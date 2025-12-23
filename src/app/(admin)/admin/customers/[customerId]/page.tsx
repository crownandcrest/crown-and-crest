'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, TrendingUp, CreditCard } from 'lucide-react'

export default function CustomerDetailPage({ params }: { params: Promise<{ customerId: string }> }) {
    const { customerId } = use(params)
    const [isLoading, setIsLoading] = useState(true)
    const [customer, setCustomer] = useState<any>(null)

    useEffect(() => {
        // Mock Data Fetching
        setTimeout(() => {
            setCustomer({
                id: customerId,
                firstName: 'Alex',
                lastName: 'Morgan',
                email: 'alex.morgan@example.com',
                phone: '+1 (555) 123-4567',
                joinDate: 'Oct 24, 2023',
                ordersCount: 12,
                totalSpent: 45200,
                avgOrderValue: 3766,
                lastOrderDate: 'Dec 15, 2024',
                addresses: [
                    {
                        type: 'Default',
                        street: '123 Fashion Ave, Suite 400',
                        city: 'New York',
                        state: 'NY',
                        zip: '10001',
                        country: 'USA'
                    }
                ],
                recentOrders: [
                    { id: '#ORD-7752', date: 'Dec 15, 2024', total: 5400, status: 'Delivered', items: 3 },
                    { id: '#ORD-7231', date: 'Nov 02, 2024', total: 2100, status: 'Delivered', items: 1 },
                    { id: '#ORD-6654', date: 'Sep 28, 2024', total: 8900, status: 'Returned', items: 4 },
                ]
            })
            setIsLoading(false)
        }, 800)
    }, [customerId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20 animate-fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/customers"
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                Active Customer
                            </span>
                            <span>•</span>
                            <span>Customer since {customer.joinDate}</span>
                        </div>
                    </div>
                </div>
                <button className="text-sm font-semibold text-gray-500 hover:text-gray-900">
                    Edit Customer
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Orders */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Orders</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">{customer.ordersCount}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Spent</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{customer.totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Avg Order Value</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{customer.avgOrderValue.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Recent Orders</h3>
                            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customer.recentOrders.map((order: any) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                                            <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                {order.id}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{order.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'Returned' ? 'bg-red-100 text-red-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium text-right">
                                                ₹{order.total.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Contact & Address */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Contact Information</h3>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{customer.email}</p>
                                    <button className="text-xs text-primary hover:underline font-medium">Copy email</button>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{customer.phone}</p>
                                    <p className="text-xs text-gray-500">Registered num.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Default Address */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Default Address</h3>
                            <button className="text-xs font-semibold text-primary hover:underline">Manage</button>
                        </div>
                        {customer.addresses.map((addr: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                                    <p>{addr.street}</p>
                                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                                    <p>{addr.country}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Marketing Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Marketing</h3>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-green-500 block"></span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Subscribed</p>
                                <p className="text-xs text-gray-500">Users subscribed to email marketing.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
