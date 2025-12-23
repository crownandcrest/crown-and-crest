'use server'

// Using supabase admin client for elevated privileges
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Order, OrderItem, OrderWithItems } from '@/types/order'

export async function getUserOrders(uid: string) {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('firebase_uid', uid)
    .order('created_at', { ascending: false })

  return data ?? []
}




export async function getOrderById(orderId: string, uid: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select(`
      id,
      firebase_uid,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      status,
      currency,
      created_at
    `)
    .eq('id', orderId)
    .eq('firebase_uid', uid)
    .maybeSingle()

  if (error && (error.message || error.code)) {
    console.error('getOrderById error:', error)
    throw new Error('Order fetch failed')
  }

  if (!data) {
    throw new Error('Order not found')
  }

  return data
}

/**
 * Fetch order with snapshot items. Product joins remain optional; items are authoritative.
 */
export async function getOrderWithItems(orderId: string, uid: string): Promise<OrderWithItems> {
  const order = await getOrderById(orderId, uid)
  const { data: items, error } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getOrderWithItems error:', error)
    throw new Error('Order items fetch failed')
  }

  return { order, items: (items ?? []) as OrderItem[] }
}

/**
 * Server-only snapshot creation helper.
 * Idempotent: if items already exist for the order, it does nothing.
 */
export async function snapshotOrderItems(orderId: string, uid: string) {
  const { data, error } = await supabaseAdmin.rpc('create_order_items_snapshot', {
    p_order_id: orderId,
    p_uid: uid,
  })
  if (error) {
    console.error('snapshotOrderItems error:', error)
    throw new Error(error.message)
  }
  return data
}

export async function createSupabaseOrder(amount: number, uid: string): Promise<Order> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert({
      firebase_uid: uid,
      amount,
      currency: 'INR',
      status: 'CREATED', // 🔒 ALWAYS START HERE
      razorpay_order_id: null,
      razorpay_payment_id: null,
    })
    .select()
    .single()

  if (error) {
    console.error('SUPABASE INSERT ERROR:', JSON.stringify(error, null, 2))
    throw new Error(error.message)
  }

  if (!data) {
    console.error('SUPABASE INSERT RETURNED NO DATA')
    throw new Error('Insert returned no data')
  }

  return data
}
