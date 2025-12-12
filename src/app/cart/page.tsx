"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ArrowRight, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  // Use the real cart data instead of INITIAL_CART
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Discount Logic (20%)
  const discount = cartTotal * 0.20;
  const deliveryFee = 15;
  const total = cartTotal - discount + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Link href="/shop" className="bg-black text-white px-8 py-3 rounded-full">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-10 py-8">
      <h1 className="text-3xl md:text-4xl font-black uppercase font-display mb-6">Your Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: Real Cart Items */}
        <div className="flex-1 border border-gray-200 rounded-[20px] p-4 md:p-6">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 py-4 border-b border-gray-200 last:border-0">
                
                <div className="w-24 h-24 bg-[#F0EEED] rounded-[10px] overflow-hidden relative flex-shrink-0">
                    <Image src={item.image} fill className="object-cover" alt={item.name} />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-base md:text-xl text-black mb-1">{item.name}</h3>
                            <p className="text-sm text-black">Size: <span className="text-gray-500 font-normal">{item.size}</span></p>
                            <p className="text-sm text-black">Color: <span className="text-gray-500 font-normal">{item.color}</span></p>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex justify-between items-end">
                        <span className="text-xl md:text-2xl font-bold text-black">₹{item.price}</span>
                        <div className="bg-[#F0F0F0] rounded-full flex items-center px-3 py-1 gap-4">
                            <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1"><Minus className="w-4 h-4" /></button>
                            <span className="font-medium text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN: Real Summary */}
        <div className="w-full lg:w-[450px] border border-gray-200 rounded-[20px] p-6">
            <h2 className="text-xl md:text-2xl font-bold mb-6">Order Summary</h2>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between text-gray-600 text-lg">
                    <span>Subtotal</span>
                    <span className="font-bold text-black">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-lg">
                    <span>Discount (-20%)</span>
                    <span className="font-bold text-red-500">-₹{discount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-lg border-b border-gray-200 pb-4">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-black">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black">
                    <span>Total</span>
                    <span>₹{total.toFixed(0)}</span>
                </div>
            </div>
            {/* ... Promo Code & Checkout Button code remains the same ... */}
             <Link href="/checkout" className="w-full bg-black text-white py-4 rounded-full font-medium text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/20">
                Go to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
        </div>
      </div>
    </div>
  );
}