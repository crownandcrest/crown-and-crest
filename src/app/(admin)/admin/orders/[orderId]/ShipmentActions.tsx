'use client'

import { useState } from 'react'
import { Truck, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { createShipmentForOrder, refreshTrackingInfo } from '@/lib/admin/order-actions'

interface ShipmentActionsProps {
    orderId: string
    hasShipment: boolean
}

export default function ShipmentActions({ orderId, hasShipment }: ShipmentActionsProps) {
    const [creating, setCreating] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const handleCreateShipment = async () => {
        setCreating(true)
        try {
            const result = await createShipmentForOrder(orderId)
            if (result.success) {
                toast.success('Shipment created successfully!')
                window.location.reload() // Refresh to show new shipment data
            } else {
                toast.error(result.error || 'Failed to create shipment')
            }
        } catch (error) {
            toast.error('Error creating shipment')
        } finally {
            setCreating(false)
        }
    }

    const handleRefreshTracking = async () => {
        setRefreshing(true)
        try {
            const result = await refreshTrackingInfo(orderId)
            if (result.success) {
                toast.success('Tracking info refreshed!')
                window.location.reload()
            } else {
                toast.error(result.error || 'Failed to refresh tracking')
            }
        } catch (error) {
            toast.error('Error refreshing tracking')
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Shipment Actions</h3>
            <div className="flex flex-col gap-2">
                {!hasShipment ? (
                    <button
                        onClick={handleCreateShipment}
                        disabled={creating}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-900 font-semibold text-sm disabled:opacity-50"
                    >
                        <Truck className="w-4 h-4" />
                        {creating ? 'Creating...' : 'Create Shipment'}
                    </button>
                ) : (
                    <button
                        onClick={handleRefreshTracking}
                        disabled={refreshing}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-semibold text-sm disabled:opacity-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {refreshing ? 'Refreshing...' : 'Refresh Tracking'}
                    </button>
                )}
            </div>
        </div>
    )
}
