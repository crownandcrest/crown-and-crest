import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { clearCart } from '@/lib/cart/actions'
import { trackPaymentError } from '@/lib/observability/errorTracking'
import { logInfo, logError, logWarn } from '@/lib/observability/structuredLogging'

export async function POST(req: Request) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = body

  const verifyStartTime = Date.now()

  // 1️⃣ Fetch order FIRST
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    await trackPaymentError(new Error('Order not found'), orderId, {
      userId: user.uid,
      action: 'fetch_order',
    })
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  logInfo.paymentVerificationStart(orderId)

  // 2️⃣ HARD STOP if already COMPLETED (idempotent check)
  if (order.status === 'COMPLETED') {
    // Order already processed, return success immediately
    // Do NOT reprocess: stock, items, or cart operations
    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order already completed',
    })
  }

  // 3️⃣ Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    // Payment verification failed
    logError.paymentVerificationFailed(orderId, 'invalid_signature')
    
    await trackPaymentError(new Error('Invalid payment signature'), orderId, {
      userId: user.uid,
      action: 'verify_signature',
      paymentId: razorpay_payment_id,
    })

    // Release reservations
    try {
      await supabaseAdmin.rpc('release_reservation', {
        p_order_id: orderId,
      })
    } catch (releaseError) {
      await trackPaymentError(releaseError, orderId, {
        userId: user.uid,
        action: 'release_reservation_after_sig_fail',
      })
    }

    // Mark order as FAILED
    await supabaseAdmin
      .from('orders')
      .update({ status: 'FAILED' })
      .eq('id', orderId)

    return NextResponse.json(
      { error: 'Invalid payment signature' },
      { status: 400 }
    )
  }

  // 4️⃣ STEP 1: Create order items snapshot (FATAL - must succeed)
  // CRITICAL: Items MUST be created BEFORE stock commit to prevent stock loss
  try {
    const { data: snapshotRes, error: snapshotErr } = await supabaseAdmin.rpc('create_order_items_snapshot', {
      p_order_id: orderId,
      p_uid: order.firebase_uid,
    })
    
    if (snapshotErr) {
      logError.paymentVerificationFailed(orderId, 'order_items_snapshot_failed')

      await trackPaymentError(snapshotErr, orderId, {
        userId: user.uid,
        action: 'create_order_snapshot',
      })
      
      // CRITICAL: Payment succeeded but order items creation failed - abort
      return NextResponse.json(
        { error: 'Order items creation failed, please contact support' },
        { status: 500 }
      )
    }
  } catch (snapshotEx) {
    logError.paymentVerificationFailed(orderId, 'order_items_snapshot_exception')

    await trackPaymentError(snapshotEx, orderId, {
      userId: user.uid,
      action: 'create_order_snapshot_exception',
    })
    
    // CRITICAL: Payment succeeded but order items creation failed - abort
    return NextResponse.json(
      { error: 'Order items creation failed, please contact support' },
      { status: 500 }
    )
  }

  // 4️⃣ STEP 2: Commit stock reservations (FATAL - must succeed)
  // CRITICAL: Only commit stock AFTER order_items are guaranteed to exist
  try {
    const { data: commitResult, error: commitError } = await supabaseAdmin.rpc(
      'commit_reservation',
      {
        p_order_id: orderId,
      }
    )

    if (commitError) {
      logError.inventoryCommitFailed(orderId, orderId, commitError.message)
      
      await trackPaymentError(commitError, orderId, {
        userId: user.uid,
        action: 'commit_reservation',
        paymentId: razorpay_payment_id,
      })
      
      // CRITICAL: Payment succeeded but stock commit failed - abort
      return NextResponse.json(
        { error: 'Stock commit failed, please contact support' },
        { status: 500 }
      )
    }

    logInfo.inventoryCommit(orderId, 1, Date.now() - verifyStartTime)
  } catch (commitError) {
    logError.inventoryCommitFailed(orderId, orderId, commitError instanceof Error ? commitError.message : String(commitError))
    
    await trackPaymentError(commitError, orderId, {
      userId: user.uid,
      action: 'commit_reservation_exception',
      paymentId: razorpay_payment_id,
    })
    
    // CRITICAL: Payment succeeded but stock commit failed - abort
    return NextResponse.json(
      { error: 'Stock commit failed, please contact support' },
      { status: 500 }
    )
  }

  // 4️⃣ STEP 3: Atomic update with status guard (prevents double-processing)
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      razorpay_payment_id,
      razorpay_signature,
      status: 'COMPLETED',
    })
    .eq('id', orderId)
    .eq('status', 'PAYMENT_PENDING') // 🔐 IDENTITY GUARD - only update if still pending

  if (updateError) {
    // Order already processed or not in PAYMENT_PENDING state
    await trackPaymentError(updateError, orderId, {
      userId: user.uid,
      action: 'update_order_status',
      paymentId: razorpay_payment_id,
    })
    return NextResponse.json(
      { error: 'Order already processed or invalid state' },
      { status: 409 }
    )
  }

  const verifyDuration = Date.now() - verifyStartTime
  logInfo.paymentVerificationComplete(orderId, verifyDuration)

  // 5️⃣ Clear cart after payment is confirmed and stock is committed
  // NON-CRITICAL: Cart state never affects payment success
  try {
    await clearCart(order.firebase_uid)
    revalidatePath('/cart')
    revalidatePath('/')
  } catch (cartClearError) {
    logWarn.paymentVerificationRetry(orderId, 1, cartClearError instanceof Error ? cartClearError.message : String(cartClearError))

    await trackPaymentError(cartClearError, orderId, {
      userId: user.uid,
      action: 'clear_cart_after_payment',
    })
    // Cart clear failure does NOT affect payment success
  }

  return NextResponse.json({ success: true, orderId: order.id })
}