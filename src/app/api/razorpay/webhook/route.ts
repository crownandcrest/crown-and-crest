import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Razorpay Magic Checkout Webhook Handler
 * 
 * Handles events from Razorpay:
 * - payment.captured (Prepaid payment success)
 * - order.paid (COD order confirmed)
 * - payment.failed (Payment failure)
 * 
 * Stores ALL Magic Checkout metadata for admin use
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')
    
    if (!signature) {
      console.error('[WEBHOOK] Missing signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // 1️⃣ VERIFY RAZORPAY SIGNATURE (CRITICAL)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('[WEBHOOK] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event
    const payload = event.payload

    console.log('[WEBHOOK] Received event:', eventType)

    // Extract order ID from notes
    const notes = payload.order?.entity?.notes || payload.payment?.entity?.notes || {}
    const internalOrderId = notes.internal_order_id

    if (!internalOrderId) {
      console.error('[WEBHOOK] Missing internal_order_id in notes')
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    // Fetch order from database
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', internalOrderId)
      .single()

    if (fetchError || !order) {
      console.error('[WEBHOOK] Order not found:', internalOrderId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2️⃣ HANDLE DIFFERENT EVENT TYPES
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(order, payload, event)
        break

      case 'order.paid':
        await handleOrderPaid(order, payload, event)
        break

      case 'payment.failed':
        await handlePaymentFailed(order, payload)
        break

      default:
        console.log('[WEBHOOK] Unhandled event type:', eventType)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[WEBHOOK] Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * PREPAID PAYMENT SUCCESS
 */
async function handlePaymentCaptured(order: any, payload: any, event: any) {
  const payment = payload.payment.entity
  
  console.log('[WEBHOOK] Processing payment.captured for order:', order.id)

  // Extract address and customer details from payment
  const customerDetails = payment.notes || {}
  const shippingAddress = extractShippingAddress(payment)

  // Update order with payment details
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'PAYMENT_CONFIRMED',
      payment_method: 'PREPAID',
      is_cod: false,
      razorpay_payment_id: payment.id,
      shipping_address: shippingAddress,
      customer_phone: customerDetails.phone || payment.contact,
      gateway_notes: event, // Store full Razorpay payload
    })
    .eq('id', order.id)
    .eq('status', 'PAYMENT_PENDING') // Only update if still pending

  console.log('[WEBHOOK] Order updated to PAYMENT_CONFIRMED')
}

/**
 * COD ORDER CONFIRMED
 */
async function handleOrderPaid(order: any, payload: any, event: any) {
  const orderEntity = payload.order.entity
  
  console.log('[WEBHOOK] Processing order.paid (COD) for order:', order.id)

  // Extract COD metadata
  const codFee = orderEntity.cod_fee || 0
  const shippingAddress = extractShippingAddress(orderEntity)

  // Update order with COD details
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'COD_CONFIRMED',
      payment_method: 'COD',
      is_cod: true,
      cod_fee: codFee,
      shipping_address: shippingAddress,
      customer_phone: orderEntity.notes?.phone,
      gateway_notes: event, // Store full Razorpay payload
    })
    .eq('id', order.id)

  console.log('[WEBHOOK] Order updated to COD_CONFIRMED with COD fee:', codFee)
}

/**
 * PAYMENT FAILED
 */
async function handlePaymentFailed(order: any, payload: any) {
  console.log('[WEBHOOK] Processing payment.failed for order:', order.id)

  // Release stock reservations
  try {
    await supabaseAdmin.rpc('release_reservation', {
      p_order_id: order.id,
    })
    console.log('[WEBHOOK] Stock reservations released')
  } catch (error) {
    console.error('[WEBHOOK] Failed to release reservations:', error)
  }

  // Mark order as failed
  await supabaseAdmin
    .from('orders')
    .update({
      status: 'FAILED',
      gateway_notes: payload,
    })
    .eq('id', order.id)

  console.log('[WEBHOOK] Order marked as FAILED')
}

/**
 * Extract shipping address from Razorpay payload
 */
function extractShippingAddress(entity: any): any {
  const address = entity.customer_details?.shipping_address || entity.shipping_address

  if (!address) return null

  return {
    fullName: entity.customer_details?.name || '',
    addressLine1: address.line1 || '',
    addressLine2: address.line2 || '',
    city: address.city || '',
    state: address.state || '',
    pincode: address.zipcode || address.postal_code || '',
    country: address.country || 'India',
  }
}
