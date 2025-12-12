"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Star, CheckCircle, Package, Truck, MapPin, FileText } from "lucide-react";

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const orderId = params?.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push("/login");

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(
                        product_id,
                        quantity,
                        price:price_at_purchase,
                        variant:product_variants(size, color),
                        product:products(name, images)
                    )
                `)
                .eq('id', orderId)
                .eq('user_id', user.id) // Security: Ensure user owns this order
                .single();

            if (error || !data) {
                console.error("Order not found:", error);
                router.push("/account/orders"); // Fallback to list
                return;
            }

            setOrder(data);
            setLoading(false);
        };

        fetchOrder();
    }, [orderId, router]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-black" /></div>;

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            
            {/* SUCCESS HEADER (Only shows if just placed) */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-green-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-green-700">Thank you for shopping with Crown & Crest. We are processing your order.</p>
            </div>

            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h2>
                    <p className="text-gray-500 text-sm">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
    <Link 
        href={`/account/orders/${orderId}/invoice`} 
        target="_blank" // Opens in new tab
        className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition"
    >
        <FileText className="w-4 h-4" /> Download Invoice
    </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-700">
                            <Package className="w-5 h-5" /> Items
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
                                    <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                        {item.product?.images?.[0] && (
                                            <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{item.product?.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Size: {item.variant?.size} • Color: {item.variant?.color} • Qty: {item.quantity}
                                        </p>
                                        <p className="font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                                    </div>
                                    {/* Review Button Logic: Only if Delivered (or older than 2 days) */}
                                    <Link 
                                        href={`/account/reviews/write/${item.product_id}`}
                                        className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs hover:bg-black hover:text-white hover:border-black transition"
                                    >
                                        <Star className="w-3 h-3" /> Review
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Info */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-indigo-600" /> Status
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-bold text-lg capitalize">{order.status.replace('_', ' ')}</span>
                        </div>
                        {order.payment_method === 'cod' && (
                            <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg font-bold">
                                ⚠️ Please pay ₹{order.total_amount} cash upon delivery.
                            </div>
                        )}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" /> Shipping To
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-bold text-gray-900">{order.shipping_address?.full_name}</p>
                            <p>{order.shipping_address?.street}</p>
                            <p>{order.shipping_address?.city} - {order.shipping_address?.zip}</p>
                            <p className="mt-2 text-xs text-gray-400">Phone: {order.shipping_address?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>₹{order.total_amount}</span></div>
                        <div className="flex justify-between text-sm mb-4"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                        <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-4">
                            <span>Total</span>
                            <span>₹{order.total_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
