"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { 
    ArrowLeft, MapPin, Package, Truck, CheckCircle, Clock, XCircle, 
    Save, Loader2, User 
} from "lucide-react";

// Define strict types for the order data
interface OrderDetail {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    shipping_address: any;
    user: { email: string; full_name: string } | null;
    items: {
        id: string;
        quantity: number;
        price: number;
        variant: { size: string; color: string } | null;
        product: { name: string; images: string[] } | null;
    }[];
}

export default function AdminOrderDetailsPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            
            // Fetch Order + Items + Product Details in one go
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    user:profiles(email, full_name),
                    items:order_items(
                        id,
                        quantity,
                        price:price_at_purchase,
                        variant:product_variants(size, color),
                        product:products(name, images)
                    )
                `)
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching order:", error);
                alert("Order not found or access denied.");
                router.push("/admin/orders");
            } else {
                setOrder(data);
                setStatus(data.status);
            }
            setLoading(false);
        };

        fetchOrder();
    }, [id, router]);

    const handleStatusUpdate = async () => {
        setUpdating(true);
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) {
            alert("Failed to update status: " + error.message);
        } else {
            alert("Order status updated successfully!");
            router.refresh();
        }
        setUpdating(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <select 
                        value={status} 
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-transparent font-medium text-sm text-gray-700 outline-none cursor-pointer"
                    >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button 
                        onClick={handleStatusUpdate} 
                        disabled={updating || status === order.status}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Update
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" /> Order Items ({order.items.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-6 flex gap-4">
                                    <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                                        {item.product?.images?.[0] ? (
                                            <Image src={item.product.images[0]} alt="Product" fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.product?.name || "Unknown Product"}</h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Size: {item.variant?.size || "N/A"}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Color: {item.variant?.color || "N/A"}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-gray-500">Total Amount</span>
                            <span className="text-2xl font-black text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Shipping */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" /> Customer
                        </h2>
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900">{order.user?.full_name || order.shipping_address?.full_name || "Guest"}</p>
                            <p className="text-sm text-gray-500">{order.user?.email || "No email provided"}</p>
                            <p className="text-sm text-gray-500">{order.shipping_address?.phone}</p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" /> Shipping Address
                        </h2>
                        <div className="text-sm text-gray-600 space-y-1 leading-relaxed">
                            <p>{order.shipping_address?.street}</p>
                            <p>{order.shipping_address?.city}</p>
                            <p className="font-mono font-medium text-gray-800">{order.shipping_address?.zip}</p>
                        </div>
                    </div>

                    {/* Quick Actions (Future placeholder) */}
                    <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-6">
                        <h2 className="font-bold text-indigo-900 mb-2">Next Steps</h2>
                        <p className="text-sm text-indigo-700 mb-4">Pack the items and generate a shipping label.</p>
                        <button disabled className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm opacity-50 cursor-not-allowed">
                            Download Invoice (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}