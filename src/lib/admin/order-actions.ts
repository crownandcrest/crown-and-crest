// Admin Order Management Actions
// Server-only functions for order status updates and bulk operations

'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'
import { OrderStatus } from '@/types/order'
import { createShipment } from '@/lib/shiprocket/shipment'
import { getTrackingDetails } from '@/lib/shiprocket/shipment'

/**
 * Verify user has admin permissions
 */
async function requireAdmin(): Promise<string> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const adminUids = process.env.ADMIN_UIDS?.split(',') || []
  if (!adminUids.includes(user.uid)) {
    throw new Error('Forbidden: Admin access required')
  }

  return user.uid
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(), 
      })
      .eq('id', orderId)

    if (error) {
      console.error('[ADMIN] Error updating order status:', error)
      return { success: false, error: error.message }
    }

    console.log('[ADMIN] Order status updated:', orderId, newStatus)
    return { success: true }

  } catch (error: unknown) {
    console.error('[ADMIN] requireAdmin failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Bulk update order status
 */
export async function bulkUpdateOrderStatus(
  orderIds: string[],
  newStatus: OrderStatus
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    await requireAdmin()

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .in('id', orderIds)
      .select('id')

    if (error) {
      console.error('[ADMIN] Error in bulk update:', error)
      return { success: false, count: 0, error: error.message }
    }

    const count = data?.length || 0
    console.log('[ADMIN] Bulk status update:', count, 'orders to', newStatus)
    
    return { success: true, count }

  } catch (error: unknown) {
    console.error('[ADMIN] requireAdmin failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, count: 0, error: errorMessage }
  }
}

/**
 * Create Shiprocket shipment for an order
 */
export async function createShipmentForOrder(
  orderId: string
): Promise<{ success: boolean; error?: string; shipmentId?: number; awb?: string }> {
  try {
    await requireAdmin()

    // Check if shipment already exists
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('shiprocket_shipment_id, tracking_id')
      .eq('id', orderId)
      .single()

    if (order?.shiprocket_shipment_id) {
      return {
        success: false,
        error: 'Shipment already created for this order',
      }
    }

    // Create shipment
    const shipment = await createShipment(orderId)

    console.log('[ADMIN] Shipment created:', shipment.shipmentId)
    
    return {
      success: true,
      shipmentId: shipment.shipmentId,
      awb: shipment.awbCode || undefined,
    }

  } catch (error: unknown) {
    console.error('[ADMIN] Error creating shipment:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Refresh tracking info for an order
 */
export async function refreshTrackingInfo(
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    // Get order AWB
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('tracking_id')
      .eq('id', orderId)
      .single()

    if (!order?.tracking_id) {
      return { success: false, error: 'No tracking ID found' }
    }

    // Fetch latest tracking data
    const trackingData = await getTrackingDetails(order.tracking_id)

    if (!trackingData) {
      return { success: false, error: 'Failed to fetch tracking data' }
    }

    // Update order with latest tracking info
    const latestActivity = trackingData.tracking_data.shipment_track_activities[0]
    
    await supabaseAdmin
      .from('orders')
      .update({
        shipment_status: latestActivity?.sr_status_label || 'IN_TRANSIT',
        last_tracking_update: new Date().toISOString(),
      })
      .eq('id', orderId)

    console.log('[ADMIN] Tracking info refreshed for:', orderId)
    
    return { success: true }

  } catch (error: unknown) {
    console.error('[ADMIN] Error refreshing tracking:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}
