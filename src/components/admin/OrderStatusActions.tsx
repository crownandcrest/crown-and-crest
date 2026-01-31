'use client'

import { useState } from 'react'
import { AlertCircle, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface OrderStatus {
    currentStatus: string
    orderId: string
    isCod?: boolean
    riskTier?: string
}

export default function OrderStatusActions({ currentStatus, orderId, isCod, riskTier }: OrderStatus) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')
    const router = useRouter()

    // Don't show actions for completed/cancelled orders
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
        return null
    }

    const handleStatusUpdate = async () => {
        if (!selectedStatus) {
            toast.error('Please select a status')
            return
        }

        setIsUpdating(true)
        try {
            const response = await fetch('/api/admin/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_ids: [orderId],
                    new_status: selectedStatus,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Order status updated')
                setShowModal(false)
                router.refresh()
            } else {
                throw new Error(data.error || 'Update failed')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update status'
            toast.error(errorMessage)
        } finally {
            setIsUpdating(false)
        }
    }

    const isHighRiskCOD = isCod && riskTier === 'HIGH'

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Actions</h3>

            {isHighRiskCOD && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-900">High Risk COD Order</p>
                        <p className="text-xs text-red-700 mt-1">
                            Review carefully before confirming. Consider contacting customer.
                        </p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-900 font-semibold text-sm"
                >
                    Update Order Status
                </button>

                {currentStatus === 'PAYMENT_PENDING' && !isCod && (
                    <button
                        onClick={() => {
                            setSelectedStatus('CANCELLED')
                            setShowModal(true)
                        }}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold text-sm"
                    >
                        Cancel Order (Payment Failed)
                    </button>
                )}

                {isHighRiskCOD && currentStatus === 'COD_CONFIRMED' && (
                    <button
                        onClick={() => {
                            setSelectedStatus('NEEDS_REVIEW')
                            setShowModal(true)
                        }}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-semibold text-sm"
                    >
                        Hold for Review
                    </button>
                )}
            </div>

            {/* Status Update Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Update Order Status
                        </h3>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                            <span className="px-3 py-1 text-sm font-semibold bg-gray-100 text-gray-800 rounded-full">
                                {currentStatus}
                            </span>
                        </div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 mb-4"
                        >
                            <option value="">Select Status</option>
                            <option value="PAYMENT_CONFIRMED">Payment Confirmed</option>
                            <option value="COD_CONFIRMED">COD Confirmed</option>
                            <option value="NEEDS_REVIEW">Needs Review</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                        </select>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setSelectedStatus('')
                                }}
                                disabled={isUpdating}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || !selectedStatus}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-gray-900 font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdating ? (
                                    'Updating...'
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Confirm
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
