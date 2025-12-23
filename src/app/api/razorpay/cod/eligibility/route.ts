import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Razorpay Magic Checkout: COD Eligibility API
 * 
 * Called by Razorpay to determine:
 * - Whether COD is allowed for this order
 * - COD fee (if applicable)
 * - Reason codes for admin storage
 * 
 * Request from Razorpay:
 * {
 *   "order_id": "order_xxx",
 *   "amount": 2500,
 *   "customer_details": {
 *     "email": "user@example.com",
 *     "phone": "+919876543210"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { order_id, amount, customer_details } = await req.json()
    
    console.log('[COD_ELIGIBILITY] Request for order:', order_id, 'Amount:', amount)

    // Fetch order from database to get order details
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', order_id)
      .single()

    if (!order) {
      console.error('[COD_ELIGIBILITY] Order not found:', order_id)
      return NextResponse.json({
        cod_available: false,
        reason: 'ORDER_NOT_FOUND'
      })
    }

    // COD ELIGIBILITY LOGIC (LENIENT FOR NEW BRAND)
    // Start permissive, tighten later based on RTO data
    
    let codAvailable = true
    let codFee = 0
    let reason = ''

    // Rule 1: Maximum order value for COD
    const MAX_COD_AMOUNT = 10000 // ₹10,000
    if (amount > MAX_COD_AMOUNT) {
      codAvailable = false
      reason = 'ORDER_VALUE_TOO_HIGH'
    }

    // Rule 2: COD fee for orders above threshold
    const COD_FEE_THRESHOLD = 2000 // Charge fee for orders > ₹2,000
    const COD_FEE_AMOUNT = 50 // ₹50 COD fee
    
    if (codAvailable && amount > COD_FEE_THRESHOLD) {
      codFee = COD_FEE_AMOUNT
      reason = 'COD_FEE_APPLICABLE'
    }

    // Rule 3: New customers - allow COD (no blocking)
    // TODO: Add repeat customer logic later
    if (codAvailable && !reason) {
      reason = 'FIRST_ORDER_ALLOWED'
    }

    // Store eligibility decision in order for admin reference
    await supabaseAdmin
      .from('orders')
      .update({
        cod_allowed_by_razorpay: codAvailable,
        cod_eligibility_reason: reason,
        cod_fee: codFee,
      })
      .eq('id', order.id)

    console.log('[COD_ELIGIBILITY] Decision:', {
      cod_available: codAvailable,
      cod_fee: codFee,
      reason
    })

    return NextResponse.json({
      cod_available: codAvailable,
      cod_fee: codFee,
      reason,
    })

  } catch (error) {
    console.error('[COD_ELIGIBILITY] Error:', error)
    // Default to allowing COD on error (lenient approach)
    return NextResponse.json({
      cod_available: true,
      cod_fee: 0,
      reason: 'ERROR_DEFAULT_ALLOW'
    })
  }
}
