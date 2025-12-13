"use client";

import { useCartDetails, DetailedCartItem } from "@/lib/hooks/useCartDetails"; 
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2, MapPin, CreditCard, Banknote, ArrowRight, ShieldCheck } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Address, VariantWithProduct, OrderInsert, OrderItemInsert } from "@/types";
import RazorpayScript from "@/components/RazorpayScript";
import CheckoutGuard from "@/components/checkout/CheckoutGuard"; // Import CheckoutGuard

// Extend window interface for Razorpay
declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <RazorpayScript />
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const { cart: cartFromHook, cartTotal } = useCartDetails();
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Modes
    const isDirectBuy = searchParams.get('type') === 'direct_buy';
    const directVariantId = searchParams.get('variant_id');
    const directQty = Number(searchParams.get('quantity') || 1);

    const [checkoutItems, setCheckoutItems] = useState<DetailedCartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // User & Data
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [savedAddress, setSavedAddress] = useState<Address | null>(null);
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'prepaid'>('prepaid');

    const [formData, setFormData] = useState({
        fullName: "", email: "", address: "", city: "", zip: "", phone: "", 
        secondaryPhone: "" // New Field
    });

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            // 🔒 Gatekeeper: Force Login
            if (!user) {
                const returnUrl = encodeURIComponent('/checkout');
                router.push(`/login?redirect=${returnUrl}`);
                return;
            }

            setUser(user);

            // Fetch Address Book
            const { data: addressData } = await supabase
                .from('user_addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            const addresses = addressData as Address[] | null;
            const defaultAddr = addresses?.find((a) => a.is_default) || addresses?.[0];
            
            if (defaultAddr) {
                setSavedAddress(defaultAddr);
                setUseSavedAddress(true);
                setFormData({
                    fullName: defaultAddr.full_name || "",
                    email: user.email || "",
                    address: defaultAddr.street || "",
                    city: defaultAddr.city || "",
                    zip: defaultAddr.zip || "",
                    phone: defaultAddr.phone || "",
                    secondaryPhone: ""
                });
            } else {
                setUseSavedAddress(false);
                setFormData(prev => ({ ...prev, email: user.email || "" }));
            }

            // Load Items
            if (isDirectBuy && directVariantId) {
                const { data: variantData } = await supabase
                    .from('product_variants')
                    .select(`*, product:products (name, images)`)
                    .eq('id', directVariantId)
                    .single();
                const directVariant = variantData as unknown as VariantWithProduct;

                if (directVariant) {
                    setCheckoutItems([{
                        productId: directVariant.product_id,
                        variantId: directVariant.id,
                        name: directVariant.product?.name || 'N/A', 
                        price: directVariant.selling_price,
                        image: directVariant.product?.images?.[0] || '',
                        quantity: directQty,
                    }]);
                }
            } else {
                setCheckoutItems(cartFromHook);
            }
            setLoading(false);
        };
        init();
    }, [isDirectBuy, directVariantId, directQty, cartFromHook, router, supabase]);

    const activeTotal = isDirectBuy 
        ? checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : cartTotal;

    // --- PAYMENT HANDLER ---
    const handlePlaceOrder = async () => {
        setProcessing(true);

        try {
            // 1. Prepare Shipping Data
            const shippingPayload = useSavedAddress && savedAddress ? {
                full_name: savedAddress.full_name,
                street: savedAddress.street,
                city: savedAddress.city,
                zip: savedAddress.zip,
                phone: savedAddress.phone,
                email: user?.email || ""
            } : {
                full_name: formData.fullName,
                street: formData.address,
                city: formData.city,
                zip: formData.zip,
                phone: formData.phone,
                email: formData.email
            };

            // 2. Initial Order Insertion (Status: Pending Payment)
            const orderToInsert: OrderInsert = {
                user_id: user?.id || null,
                total_amount: activeTotal,
                status: 'pending_payment', // Starts as draft
                payment_status: 'pending',
                payment_method: paymentMethod,
                shipping_address: shippingPayload,
                secondary_phone: formData.secondaryPhone || null, // Saved only to DB
                is_phone_verified: false,
            };

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert(orderToInsert)
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Insert Items
            const dbItems: OrderItemInsert[] = checkoutItems.map(item => ({
                order_id: orderData.id,
                product_id: item.productId,
                variant_id: item.variantId,
                quantity: item.quantity,
                price_at_purchase: item.price
            }));
            const { error: itemsError } = await supabase.from('order_items').insert(dbItems);
            if (itemsError) throw itemsError;

            // --- BRANCH: CASH ON DELIVERY ---
            if (paymentMethod === 'cod') {
                // Instantly confirm order
                await supabase.from('orders').update({ status: 'processing' }).eq('id', orderData.id);
                finalizeOrder(orderData.id);
                return;
            }

            // --- BRANCH: RAZORPAY ONLINE ---
            if (paymentMethod === 'prepaid') {
                // Call our API to get an Order ID from Razorpay
                const response = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: activeTotal })
                });
                
                const rzpOrder = await response.json();
                if (!rzpOrder.id) throw new Error("Payment initialization failed");

                // Open Razorpay Modal
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: rzpOrder.amount,
                    currency: "INR",
                    name: "Crown & Crest",
                    description: `Order #${orderData.id.slice(0, 8)}`,
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        // PAYMENT SUCCESS! Update DB
                        await supabase.from('orders').update({
                            status: 'processing',
                            payment_status: 'paid',
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        }).eq('id', orderData.id);

                        finalizeOrder(orderData.id);
                    },
                    prefill: {
                        name: shippingPayload.full_name,
                        email: shippingPayload.email,
                        contact: shippingPayload.phone
                    },
                    theme: { color: "#000000" }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response: any) {
                    alert("Payment Failed: " + response.error.description);
                    setProcessing(false);
                });
                rzp1.open();
            }

        } catch (err: any) {
            alert("Order Failed: " + err.message);
            setProcessing(false);
        }
    };

    const finalizeOrder = (orderId: string) => {
        if (!isDirectBuy) localStorage.removeItem('crown_cart');
        router.push(`/account/orders/${orderId}`);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* LEFT COLUMN: Input Forms */}
                <div className="space-y-8">
                    {/* Address Selection */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-indigo-600" /> Shipping Address</h2>
                        
                        {savedAddress && (
                            <div onClick={() => setUseSavedAddress(true)} className={`cursor-pointer p-4 mb-4 rounded-xl border-2 transition flex items-start gap-4 ${useSavedAddress ? 'border-black bg-gray-50' : 'border-gray-100'}`}>
                                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${useSavedAddress ? 'border-black' : 'border-gray-300'}`}>{useSavedAddress && <div className="w-2.5 h-2.5 bg-black rounded-full" />}</div>
                                <div><h3 className="font-bold">{savedAddress.full_name}</h3><p className="text-sm text-gray-500">{savedAddress.street}, {savedAddress.city}</p></div>
                            </div>
                        )}
                        <div onClick={() => setUseSavedAddress(false)} className={`cursor-pointer p-4 rounded-xl border-2 transition flex items-center gap-4 ${!useSavedAddress ? 'border-black' : 'border-gray-100'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useSavedAddress ? 'border-black' : 'border-gray-300'}`}>{!useSavedAddress && <div className="w-2.5 h-2.5 bg-black rounded-full" />}</div>
                            <span className="font-bold text-gray-900">Use a different address</span>
                        </div>

                        {/* Guest / Manual Form */}
                        {!useSavedAddress && (
                            <form id="checkout-form" className="mt-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="Full Name" className="w-full p-3 border rounded-xl" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                                    <input required placeholder="Phone" className="w-full p-3 border rounded-xl" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </div>
                                <input required placeholder="Address" className="w-full p-3 border rounded-xl" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input required placeholder="City" className="w-full p-3 border rounded-xl" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                    <input required placeholder="Zip Code" className="w-full p-3 border rounded-xl" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                                </div>
                            </form>
                        )}

                        {/* Secondary Contact (Hidden from label) */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                             <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-3 h-3 text-green-600" /> Backup Contact (Private)
                             </label>
                             <input 
                                placeholder="Backup Phone Number (Optional)" 
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                                value={formData.secondaryPhone} 
                                onChange={e => setFormData({...formData, secondaryPhone: e.target.value})} 
                             />
                             <p className="text-[10px] text-gray-400 mt-1">This number is saved securely on our server for delivery emergencies only. It will not appear on the shipping label.</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-600" /> Payment Method</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div onClick={() => setPaymentMethod('prepaid')} className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center justify-center text-center gap-2 ${paymentMethod === 'prepaid' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <CreditCard className="w-8 h-8 text-indigo-600" />
                                <span className="font-bold text-sm">Pay Online</span>
                                <span className="text-[10px] text-gray-500">UPI, Cards, Netbanking</span>
                            </div>
                            <div onClick={() => setPaymentMethod('cod')} className={`cursor-pointer p-4 rounded-xl border-2 transition flex flex-col items-center justify-center text-center gap-2 ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <Banknote className="w-8 h-8 text-green-600" />
                                <span className="font-bold text-sm">Cash on Delivery</span>
                                <span className="text-[10px] text-gray-500">Pay upon arrival</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 sticky top-8">
                        <h2 className="text-xl font-black uppercase mb-6">Order Summary</h2>
                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                            {checkoutItems.map((item) => (
                                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4">
                                    <div className="relative w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h3>
                                        <div className="flex justify-between mt-1"><span className="text-xs">Qty: {item.quantity}</span><span className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-2">
                            <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{activeTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                            <div className="flex justify-between text-xl font-black pt-2 border-t mt-2"><span>Total</span><span>₹{activeTotal.toFixed(2)}</span></div>
                        </div>

                        {/* Checkout Guard Wrapper */}
                        <CheckoutGuard onVerified={handlePlaceOrder}>
                            <button 
                                type="button" // Change type to button as the form submission is now handled by CheckoutGuard
                                disabled={processing} 
                                className="w-full bg-black text-white mt-6 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {processing ? <Loader2 className="animate-spin w-5 h-5" /> : <>
                                    {paymentMethod === 'cod' ? 'Place COD Order' : 'Pay Now'} <ArrowRight className="w-5 h-5" />
                                </>}
                            </button>
                        </CheckoutGuard>
                    </div>
                </div>
            </div>
        </div>
    );
}