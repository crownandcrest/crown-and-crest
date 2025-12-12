"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { 
    Search, Filter, ChevronRight, Package, Clock, CheckCircle, XCircle, Truck, Loader2 
} from "lucide-react";

// Define the Order structure
interface AdminOrder {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    user: { email: string } | null;
    shipping_address: any;
    items_count: number;
}

export default function AdminOrdersPage() {
    const supabase = createClient();
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        // Fetch orders with user email and a count of items
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:profiles(email), 
                order_items(count)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders:", error);
        } else {
            // Transform data to flat structure
            const formattedOrders = data.map((order: any) => ({
                ...order,
                items_count: order.order_items[0]?.count || 0,
                user: order.user || { email: 'Guest' }
            }));
            setOrders(formattedOrders);
        }
        setLoading(false);
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === "all" || order.status === filterStatus;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
            order.id.toLowerCase().includes(searchLower) || 
            order.shipping_address?.full_name?.toLowerCase().includes(searchLower) ||
            order.user?.email?.toLowerCase().includes(searchLower);
        
        return matchesStatus && matchesSearch;
    });

    // Helper for Status Badge Styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'pending_payment': return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case 'processing': return "bg-blue-50 text-blue-700 border-blue-200";
            case 'shipped': return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case 'delivered': return "bg-green-100 text-green-700 border-green-200";
            case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending_payment': return <Clock className="w-3 h-3" />;
            case 'processing': return <Package className="w-3 h-3" />;
            case 'shipped': return <Truck className="w-3 h-3" />;
            case 'delivered': return <CheckCircle className="w-3 h-3" />;
            case 'cancelled': return <XCircle className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500 text-sm">Manage and fulfill customer orders.</p>
                </div>
                
                {/* Stats (Simple Counters) */}
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white border rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 font-bold uppercase">Pending</span>
                        <span className="text-lg font-black text-yellow-600">
                            {orders.filter(o => o.status === 'pending_payment' || o.status === 'processing').length}
                        </span>
                    </div>
                    <div className="px-4 py-2 bg-white border rounded-lg shadow-sm">
                        <span className="block text-xs text-gray-500 font-bold uppercase">Total Revenue</span>
                        <span className="text-lg font-black text-green-600">
                            ₹{orders.reduce((acc, curr) => acc + curr.total_amount, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search Order ID, Customer, Email..." 
                        className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-black focus:border-black"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Status Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto">
                    {['all', 'processing', 'shipped', 'delivered'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold capitalize transition-all whitespace-nowrap ${
                                filterStatus === tab 
                                    ? "bg-white text-black shadow-sm" 
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-gray-300" /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="p-20 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No orders found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-xs border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition group">
                                        <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                            <span className="block text-xs text-gray-400">
                                                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{order.shipping_address?.fullName || "Guest"}</p>
                                            <p className="text-xs text-gray-500">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            ₹{order.total_amount.toLocaleString()}
                                            <span className="block text-xs text-gray-400 font-normal">{order.items_count} items</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyle(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                View <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}