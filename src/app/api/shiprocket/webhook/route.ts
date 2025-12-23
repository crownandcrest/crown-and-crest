import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { mapShiprocketStatus } from '@/lib/shiprocket/shipment'

/**
 * Shiprocket Webhook Handler
 * 
 * Receives tracking updates from Shiprocket
 * Updates order shipment status in database
 * 
 * Events handled:
 * - SHIPMENT_CREATED
 * - PICKUP_SCHEDULED
 * - PICKED_UP
 * - IN_TRANSIT
 * - OUT_FOR_DELIVERY
 * - DELIVERED
 * - RTO_INITIATED
 * - RTO_DELIVERED
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-shiprocket-signature')

    // Verify webhook signature (if Shiprocket provides one)
    if (process.env.SHIPROCKET_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.SHIPROCKET_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')

      if (expectedSignature !== signature) {
        console.error('[SHIPROCKET_WEBHOOK] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    console.log('[SHIPROCKET_WEBHOOK] Received event:', event.event)

    const { data } = event
    const { awb, order_id, shipment_status, current_status, courier_name, activities } = data

    // Find order by Shiprocket order ID or AWB
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, shipment_status, tracking_id, actual_delivery_date')
      .or(`shiprocket_order_id.eq.${order_id},tracking_id.eq.${awb}`)
      .single()

    if (orderError || !order) {
      console.error('[SHIPROCKET_WEBHOOK] Order not found:', order_id, awb)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Map Shiprocket status to our internal status
    const newStatus = mapShiprocketStatus(current_status || shipment_status)

    // Update order with latest tracking info
    const updateData: any = {
      shipment_status: newStatus,
      last_tracking_update: new Date().toISOString(),
    }

    // Update courier name if provided
    if (courier_name) {
      updateData.courier_name = courier_name
    }

    // Update tracking ID if provided
    if (awb && !order.tracking_id) {
      updateData.tracking_id = awb
    }

    // Set delivery date if delivered
    if (newStatus === 'DELIVERED' && !order.actual_delivery_date) {
      updateData.actual_delivery_date = new Date().toISOString().split('T')[0]
    }

    await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    console.log('[SHIPROCKET_WEBHOOK] Order updated:', order.id, 'Status:', newStatus)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[SHIPROCKET_WEBHOOK] Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
