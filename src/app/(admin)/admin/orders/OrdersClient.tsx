'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, Download } from 'lucide-react'
import Link from 'next/link'
import OrderFilters from '@/components/admin/OrderFilters'
import BulkActions from '@/components/admin/BulkActions'
import toast from 'react-hot-toast'

interface FilterState {
    payment_method?: string
    risk_tier?: string
    status?: string
    courier?: string
    pincode?: string
    date_from?: string
    date_to?: string
}

interface Order {
    id: string
    created_at: string
    status: string
    amount: number
    currency: string
    payment_method?: string
    is_cod?: boolean
    razorpay_risk_tier?: string
    courier_name?: string
    tracking_id?: string
    customer_name?: string
    customer_phone?: string
    shipping_address?: any
    estimated_delivery_date?: string
}

export default function OrdersClient() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [filters, setFilters] = useState<FilterState>({})
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchOrders()
    }, [filters, page])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            // Convert FilterState to Record<string, string> by removing undefined values
            const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value) acc[key] = value
                return acc
            }, {} as Record<string, string>)

            const params = new URLSearchParams({ ...filterParams, page: String(page), limit: '50' })
            const response = await fetch(`/api/admin/orders?${params}`)
            const data = await response.json()

            if (response.ok) {
                setOrders(data.orders)
                setTotalPages(data.totalPages)
            } else {
                toast.error('Failed to fetch orders')
            }
        } catch (error) {
            toast.error('Error fetching orders')
        } finally {
            setLoading(false)
        }
    }

    const handleFilter = (newFilters: FilterState) => {
        setFilters(newFilters)
        setPage(1)
        setSelectedIds([])
    }

    const handleReset = () => {
        setFilters({})
        setPage(1)
        setSelectedIds([])
    }

    const handleSelectAll = () => {
        if (selectedIds.length === orders.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(orders.map(o => o.id))
        }
    }

    const handleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id))
        } else {
            setSelectedIds([...selectedIds, id])
        }
    }

    const handleBulkUpdate = async (newStatus: string) => {
        const response = await fetch('/api/admin/orders/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_ids: selectedIds, new_status: newStatus }),
        })

        if (response.ok) {
            setSelectedIds([])
            await fetchOrders()
        } else {
            throw new Error('Bulk update failed')
        }
    }

    const handleExport = async () => {
        // Convert FilterState to Record<string, string> by removing undefined values
        const filterParams = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[key] = value
            return acc
        }, {} as Record<string, string>)

        const params = new URLSearchParams(filterParams)
        window.location.href = `/api/admin/orders/export?${params}`
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">{orders.length} orders (Page {page} of {totalPages})</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-semibold text-sm"
                >
                    <Download className="w-4 h-4" />
                    Export All
                </button>
            </div>

            {/* Filters */}
            <OrderFilters onApply={handleFilter} onReset={handleReset} />

            {/* Bulk Actions */}
            <BulkActions
                selectedIds={selectedIds}
                onClearSelection={() => setSelectedIds([])}
                onStatusUpdate={handleBulkUpdate}
                onExport={handleExport}
            />

            {/* Orders Table */}
            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Orders will appear here when customers make purchases</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === orders.length && orders.length > 0}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courier</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => {
                                const pincode = (() => {
                                    try {
                                        const addr = typeof order.shipping_address === 'string'
                                            ? JSON.parse(order.shipping_address)
                                            : order.shipping_address
                                        return addr?.pincode || '-'
                                    } catch {
                                        return '-'
                                    }
                                })()

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={() => handleSelectOne(order.id)}
                                                className="rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{order.customer_name || '-'}</div>
                                            {order.customer_phone && (
                                                <div className="text-xs text-gray-500">{order.customer_phone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {pincode}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.is_cod ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.payment_method || (order.is_cod ? 'COD' : 'PREPAID')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.razorpay_risk_tier && (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.razorpay_risk_tier === 'LOW' ? 'bg-green-100 text-green-700' :
                                                    order.razorpay_risk_tier === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {order.razorpay_risk_tier}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'PAYMENT_CONFIRMED' || order.status === 'COD_CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'FAILED' || order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.courier_name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {order.estimated_delivery_date
                                                ? new Date(order.estimated_delivery_date).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {order.currency} {order.amount.toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-primary hover:text-gray-900 font-semibold"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
