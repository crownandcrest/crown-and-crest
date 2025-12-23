import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

/**
 * Handles payment cancellation (user closed Razorpay modal or payment timeout)
 * Releases inventory reservations and marks order as CANCELLED
 */
export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId } = await req.json()

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
  }

  // 1️⃣ Fetch order and verify ownership
  const { data: order, error: fetchError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('firebase_uid', user.uid) // Ensure user owns this order
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // 2️⃣ Only cancel if order is still in PAYMENT_PENDING state
  // Don't cancel if already COMPLETED or CANCELLED
  if (order.status === 'COMPLETED') {
    return NextResponse.json({
      success: true,
      message: 'Order already completed, cannot cancel',
    })
  }

  if (order.status === 'CANCELLED') {
    return NextResponse.json({
      success: true,
      message: 'Order already cancelled',
    })
  }

  if (order.status !== 'PAYMENT_PENDING' && order.status !== 'CREATED') {
    return NextResponse.json(
      { error: 'Order cannot be cancelled in current state' },
      { status: 400 }
    )
  }

  // 3️⃣ RELEASE RESERVATIONS (restore stock_quantity)
  try {
    const { data: releaseResult, error: releaseError } = await supabaseAdmin.rpc(
      'release_reservation',
      {
        p_order_id: orderId,
      }
    )

    if (releaseError) {
      console.error('Error releasing reservations on cancel:', releaseError)
      // Log but continue - we still want to mark order as cancelled
    }

    console.log('Reservations released for cancelled order:', orderId, releaseResult)
  } catch (releaseError) {
    console.error('Exception releasing reservations on cancel:', releaseError)
  }

  // 4️⃣ Mark order as CANCELLED
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ status: 'CANCELLED' })
    .eq('id', orderId)
    .eq('firebase_uid', user.uid)

  if (updateError) {
    console.error('Error updating order status to CANCELLED:', updateError)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Order cancelled and reservations released',
  })
}
