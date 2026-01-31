import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { createRazorpayOrder } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { validateCartForCheckout } from '@/lib/checkout/actions'
import { rateLimit, RATE_LIMITS, getUserRateLimitKey } from '@/lib/rate-limit'

/**
 * Razorpay Magic Checkout Order Creation API
 * 
 * This endpoint creates a Razorpay order configured for Magic Checkout.
 * Magic Checkout handles: address collection, payment method selection, COD eligibility
 * 
 * Flow:
 * 1. Validate cart (stock, prices)
 * 2. Create internal order (status = CREATED)
 * 3. Reserve stock
 * 4. Create Razorpay order with Magic Checkout parameters
 * 5. Return order IDs to frontend
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[MAGIC_CHECKOUT] Creating order for user:', user.uid)

    // Rate limit check
    const rateLimitKey = getUserRateLimitKey('order:create', user.uid)
    const { success: withinLimit } = await rateLimit(rateLimitKey, RATE_LIMITS.ORDER_CREATION)
    if (!withinLimit) {
      console.log('[MAGIC_CHECKOUT] Rate limit exceeded for user:', user.uid)
      return NextResponse.json(
        { error: 'Too many order attempts. Please wait a moment and try again.' },
        { status: 429 }
      )
    }

    // 1️⃣ VALIDATE CART
    const validation = await validateCartForCheckout()
    
    if (!validation.success || !validation.items || !validation.totalAmount) {
      console.log('[MAGIC_CHECKOUT] Validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error || 'Cart validation failed' }, 
        { status: 400 }
      )
    }
    
    const { items: preparedItems, totalAmount } = validation
    console.log('[MAGIC_CHECKOUT] Cart validated:', preparedItems.length, 'items, ₹', totalAmount)
    
    // Build stock reservation items
    const reservationItems = preparedItems.map((item) => ({
      variant_id: item.variant_id,
      qty: item.quantity,
    }))

    // 2️⃣ CREATE INTERNAL ORDER
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        firebase_uid: user.uid,
        amount: totalAmount,
        currency: 'INR',
        status: 'CREATED',
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('[MAGIC_CHECKOUT] Order creation failed:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' }, 
        { status: 500 }
      )
    }
    
    console.log('[MAGIC_CHECKOUT] Internal order created:', order.id)

    try {
      // 3️⃣ RESERVE STOCK (atomic, all-or-nothing)
      const { error: reserveError } = await supabaseAdmin.rpc('reserve_stock', {
        p_order_id: order.id,
        p_uid: user.uid,
        p_items: reservationItems,
        p_ttl_seconds: 900, // 15 minutes
      })

      if (reserveError) {
        console.error('[MAGIC_CHECKOUT] Stock reservation failed:', reserveError)
        
        // Cleanup order
        await supabaseAdmin.from('orders').delete().eq('id', order.id)
        
        if (reserveError.message?.includes('OUT_OF_STOCK')) {
          return NextResponse.json(
            { error: 'OUT_OF_STOCK', message: 'One or more items are out of stock' },
            { status: 409 }
          )
        }
        
        return NextResponse.json(
          { error: 'Stock reservation failed' }, 
          { status: 500 }
        )
      }

      console.log('[MAGIC_CHECKOUT] Stock reserved successfully')

      // 4️⃣ CREATE RAZORPAY MAGIC CHECKOUT ORDER
      const razorpayOrder = await createRazorpayOrder(
        totalAmount,
        order.id.slice(0, 40) // Receipt ID
      )
      
      console.log('[MAGIC_CHECKOUT] Razorpay order created:', razorpayOrder.id)

      // 5️⃣ UPDATE ORDER WITH RAZORPAY DETAILS
      await supabaseAdmin
        .from('orders')
        .update({ 
          razorpay_order_id: razorpayOrder.id,
          status: 'PAYMENT_PENDING',
        })
        .eq('id', order.id)
      
      // 6️⃣ CREATE ORDER ITEMS (price snapshots)
      const orderItems = preparedItems.map((item) => ({
        order_id: order.id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      }))
      
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) {
        console.error('[MAGIC_CHECKOUT] Failed to create order items:', itemsError)
        throw new Error('Failed to create order items')
      }
      
      console.log('[MAGIC_CHECKOUT] Order items created:', orderItems.length)

      // SUCCESS - Return order data for Magic Checkout
      return NextResponse.json({
        success: true,
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: totalAmount,
        currency: 'INR',
      })

    } catch (error) {
      // ROLLBACK ON ERROR
      console.error('[MAGIC_CHECKOUT] Error during checkout:', error)
      
      // Release reservations
      try {
        await supabaseAdmin.rpc('release_reservation', {
          p_order_id: order.id,
        })
      } catch (releaseError) {
        console.error('[MAGIC_CHECKOUT] Failed to release reservations:', releaseError)
      }
      
      // Delete order
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      
      return NextResponse.json(
        { error: 'Checkout failed' }, 
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[MAGIC_CHECKOUT] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
