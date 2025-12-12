"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Printer, Download } from "lucide-react";
import Image from "next/image";

export default function InvoicePage() {
    const params = useParams();
    const supabase = createClient();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoice = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items(
                        quantity,
                        price:price_at_purchase,
                        variant:product_variants(size, color),
                        product:products(name)
                    )
                `)
                .eq('id', params?.id)
                .single();

            if (!error && data) setOrder(data);
            setLoading(false);
        };
        fetchInvoice();
    }, [params?.id]);

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (!order) return <div className="p-10 text-center">Invoice not found</div>;

    const subtotal = order.total_amount; // Assuming total_amount already includes tax for simplicity
    const tax = Math.round(subtotal * 0.05); // Example 5% Tax calculation
    const baseAmount = subtotal - tax;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans print:bg-white print:p-0">
            
            {/* ACTION BAR (Hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <h1 className="font-bold text-gray-700">Invoice #{order.id.slice(0, 8).toUpperCase()}</h1>
                <button 
                    onClick={() => window.print()} 
                    className="bg-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
                >
                    <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
            </div>

            {/* A4 PAPER CONTAINER */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-xl p-10 md:p-16 rounded-sm min-h-[297mm] relative print:shadow-none print:w-full">
                
                {/* HEADER */}
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Crown & Crest</h1>
                        <p className="text-gray-500 text-sm">Premium Apparel Co.</p>
                        <p className="text-gray-500 text-sm">Mumbai, India - 400001</p>
                        <p className="text-gray-500 text-sm">support@crownandcrest.com</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-200 uppercase mb-1">Invoice</h2>
                        <p className="font-mono font-bold text-xl text-black">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500 mt-1">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <div className="mt-4 inline-block bg-gray-100 px-3 py-1 rounded text-xs font-bold uppercase">
                            Status: {order.payment_status || order.status}
                        </div>
                    </div>
                </div>

                {/* ADDRESSES */}
                <div className="grid grid-cols-2 gap-10 mb-12">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Billed To</h3>
                        <p className="font-bold text-gray-900">{order.shipping_address?.full_name}</p>
                        <p className="text-sm text-gray-600 max-w-[200px]">{order.shipping_address?.street}</p>
                        <p className="text-sm text-gray-600">{order.shipping_address?.city} - {order.shipping_address?.zip}</p>
                        <p className="text-sm text-gray-600 mt-1">{order.shipping_address?.phone}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Payment Method</h3>
                        <p className="font-bold text-gray-900 capitalize">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                        <p className="text-sm text-gray-600">Transaction ID:</p>
                        <p className="font-mono text-xs text-gray-500">{order.razorpay_payment_id || 'N/A (COD)'}</p>
                    </div>
                </div>

                {/* TABLE */}
                <table className="w-full text-left mb-8">
                    <thead>
                        <tr className="border-b-2 border-black">
                            <th className="py-3 text-xs font-bold uppercase text-gray-500 w-1/2">Item Description</th>
                            <th className="py-3 text-xs font-bold uppercase text-gray-500 text-center">Qty</th>
                            <th className="py-3 text-xs font-bold uppercase text-gray-500 text-right">Price</th>
                            <th className="py-3 text-xs font-bold uppercase text-gray-500 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {order.items.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="py-4">
                                    <p className="font-bold text-gray-900">{item.product?.name}</p>
                                    <p className="text-xs text-gray-500">{item.variant?.size} / {item.variant?.color}</p>
                                </td>
                                <td className="py-4 text-center font-mono text-sm">{item.quantity}</td>
                                <td className="py-4 text-right font-mono text-sm">₹{item.price.toLocaleString()}</td>
                                <td className="py-4 text-right font-bold font-mono text-sm">₹{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTALS */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{baseAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (5%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-black pt-2">
                            <span>Total</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="absolute bottom-16 left-16 right-16 border-t border-gray-100 pt-8 text-center">
                    <p className="font-bold text-gray-900 mb-1">Thank you for your business!</p>
                    <p className="text-xs text-gray-500">
                        For any questions, please contact us at support@crownandcrest.com within 7 days.
                    </p>
                </div>
            </div>
        </div>
    );
}
