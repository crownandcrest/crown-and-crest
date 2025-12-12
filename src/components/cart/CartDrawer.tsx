// src/components/cart/CartDrawer.tsx
"use client";

import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

    // Disable body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
            ></div>

            {/* Drawer Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Header */}
                <div className="p-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-xl font-black uppercase flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" /> Your Cart
                    </h2>
                    <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                            <ShoppingBag className="w-16 h-16 text-gray-200" />
                            <p>Your cart is empty.</p>
                            <button onClick={toggleCart} className="text-indigo-600 font-bold hover:underline">
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                {/* Image */}
                                <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500">Size: {item.size} • {item.color}</p>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button 
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1.5 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1.5 hover:bg-gray-50 text-gray-600 disabled:opacity-30"
                                                disabled={item.quantity >= item.maxStock}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
                        <div className="flex justify-between items-center text-lg font-black text-gray-900">
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Shipping & taxes calculated at checkout.</p>
                        
                        <Link 
                            href="/checkout" 
                            onClick={toggleCart}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-xl"
                        >
                            Checkout Now <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}