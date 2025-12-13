// src/components/product/ProductClient.tsx
"use client";

import { useState } from 'react';
import { Star, ShoppingBag, Minus, Plus, Check, Zap, ShieldCheck, Truck, Lock } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Product, Variant } from '@/types';

interface UserMeasurements {
    height_cm?: number;
    weight_kg?: number;
    chest_cm?: number;
    body_type?: string;
}

export default function ProductClient({ 
    product,
    measurements 
}: { 
    product: Product, 
    measurements?: UserMeasurements | null
}) {
    const { addToCart } = useCart();
    const router = useRouter(); // For Buy Now navigation
    
    // State
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>(product.variants[0]?.color || '');
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product.images?.[0] || '');
    const [error, setError] = useState('');

    // ... (Sorting logic remains the same)
    const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];
    const allSizes = Array.from(new Set(product.variants.map(v => v.size)))
        .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
    const activeVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
    const availableSizes = product.variants.filter(v => v.color === selectedColor).map(v => v.size);
    const price = activeVariant ? activeVariant.selling_price : product.variants[0]?.selling_price;

    // --- FIT LOGIC ---
    const getRecommendedSize = () => {
        if (!measurements) return null;
        const { height_cm, weight_kg } = measurements;
        if (weight_kg && height_cm) {
            const bmi = weight_kg / ((height_cm / 100) ** 2);
            if (bmi < 20) return 'S';
            if (bmi < 25) return 'M';
            if (bmi < 29) return 'L';
            return 'XL';
        }
        return null;
    };
    const recommendedSize = getRecommendedSize();

    // --- HANDLERS ---
    const handleQuantity = (type: 'inc' | 'dec') => {
        if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
        if (type === 'inc' && (!activeVariant || quantity < activeVariant.stock_quantity)) setQuantity(q => q + 1);
    };

    const validateSelection = () => {
        setError('');
        if (!selectedSize) { setError('Please choose a size first.'); return false; }
        if (!activeVariant) { setError('This combination is out of stock.'); return false; }
        if (activeVariant.stock_quantity < 1) { setError('Sold Out.'); return false; }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateSelection() || !activeVariant) return;
        addToCart(product.id, activeVariant.id, quantity);
    };

    // ⚡ BUY NOW LOGIC (Direct Checkout)
    const handleBuyNow = () => {
        if (!validateSelection() || !activeVariant) return;
        
        // redirect to checkout with specific query params
        // We pass the variant ID and quantity. The checkout page will handle the rest.
        const params = new URLSearchParams({
            variant_id: activeVariant.id,
            quantity: quantity.toString(),
            type: 'direct_buy' // Flag to tell checkout to ignore the main cart
        });

        router.push(`/checkout?${params.toString()}`);
    };

    const getColorClass = (colorName: string) => {
        const map: Record<string, string> = {
            'Black': 'bg-black', 'White': 'bg-white border-gray-200',
            'Red': 'bg-red-600', 'Blue': 'bg-blue-600',
            'Green': 'bg-green-700', 'Yellow': 'bg-yellow-400',
            'Brown': 'bg-[#4F2817]', 'Beige': 'bg-[#F5F5DC]'
        };
        return map[colorName] || 'bg-gray-200';
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 font-sans relative">
            
            {/* --- LEFT: GALLERY --- */}
            <div className="flex flex-col-reverse lg:flex-row gap-4">
                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
                    {product.images?.map((img, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`relative w-20 h-20 lg:w-32 lg:h-32 rounded-[20px] overflow-hidden border-2 transition flex-shrink-0
                                ${mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 aspect-[4/5] bg-[#F0EEED] rounded-[20px] overflow-hidden shadow-inner">
                    {mainImage ? (
                        <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                    )}
                </div>
            </div>

            {/* --- RIGHT: DETAILS --- */}
            <div className="flex flex-col">
                <h1 className="text-4xl lg:text-5xl font-black text-black uppercase mb-3 leading-tight tracking-tight font-display">
                    {product.name}
                </h1>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-yellow-400">
                        {[1,2,3,4].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                        <Star className="w-5 h-5 text-yellow-400" />
                    </div>
                    <span className="text-sm text-black font-medium">4.5/5</span>
                </div>

                {/* 3. PRICE SECTION */}
                <div className="flex items-center gap-4 mb-6">
                    {/* Safe Price Rendering */}
                    <span className="text-3xl font-bold text-black">
                        ₹{price ? Number(price).toFixed(2) : "0.00"}
                    </span>
                    
                    {/* Safe Discount Rendering */}
                    {price && Number(price) > 0 && (
                        <>
                            <span className="text-3xl font-bold text-gray-300 line-through">
                                ₹{Math.round(Number(price) * 1.2).toFixed(2)}
                            </span>
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                                -20%
                            </span>
                        </>
                    )}
                </div>

                <p className="text-gray-500 leading-relaxed mb-6 border-b border-gray-100 pb-6">
                    {product.description}
                </p>

                {/* Colors */}
                <div className="mb-6">
                    <p className="text-gray-500 text-sm mb-3 font-medium">Select Colors</p>
                    <div className="flex gap-3">
                        {uniqueColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${getColorClass(color)}
                                    ${selectedColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}
                                `}
                                title={color}
                            >
                                {selectedColor === color && <Check className={`w-5 h-5 ${color === 'White' ? 'text-black' : 'text-white'}`} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sizes */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-gray-500 text-sm font-medium">Choose Size</p>
                        <button className="text-gray-500 text-sm underline hover:text-black">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {allSizes.map((size) => {
                            const isAvailable = availableSizes.includes(size);
                            const isSelected = selectedSize === size;
                            const isRecommended = recommendedSize === size;

                            return (
                                <button
                                    key={size}
                                    onClick={() => isAvailable && setSelectedSize(size)}
                                    disabled={!isAvailable}
                                    className={`
                                        px-6 py-3 rounded-full text-sm font-bold transition relative min-w-[80px]
                                        ${isSelected ? 'bg-black text-white shadow-lg scale-105' : 'bg-[#F0F0F0] text-gray-600 hover:bg-gray-200'}
                                        ${!isAvailable ? 'opacity-30 cursor-not-allowed decoration-slice' : ''}
                                    `}
                                >
                                    {size}
                                    {isRecommended && isAvailable && !isSelected && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Dynamic Feedback */}
                    {error && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium animate-pulse">
                            ⚠️ {error}
                        </div>
                    )}
                    
                    {/* Urgency Trigger */}
                    {activeVariant && activeVariant.stock_quantity < 5 && activeVariant.stock_quantity > 0 && (
                        <div className="mt-3 text-orange-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                            🔥 Hurry! Only {activeVariant.stock_quantity} left in stock.
                        </div>
                    )}

                    {recommendedSize && !error && (
                        <div className="mt-3 flex items-start gap-2 bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 border border-indigo-100 font-medium">
                            ✨ Based on your Size Book, <strong>{recommendedSize}</strong> is your best fit.
                        </div>
                    )}
                </div>

                {/* 7. ACTIONS [Buy Now + Add to Cart] */}
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-3 gap-6">
                            <button onClick={() => handleQuantity('dec')} className="text-xl font-bold hover:text-gray-500"><Minus className="w-5 h-5" /></button>
                            <span className="font-medium text-lg min-w-[20px] text-center">{quantity}</span>
                            <button onClick={() => handleQuantity('inc')} className="text-xl font-bold hover:text-gray-500"><Plus className="w-5 h-5" /></button>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            className="flex-1 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition active:scale-95 shadow-xl flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-5 h-5" /> Add to Cart
                        </button>
                    </div>
                    
                    {/* BUY NOW BUTTON */}
                    <button 
                        onClick={handleBuyNow}
                        className="w-full bg-indigo-600 text-white rounded-full font-bold text-lg py-4 hover:bg-indigo-700 transition active:scale-95 shadow-xl flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5 fill-current" /> Buy Now
                    </button>
                </div>

                {/* Trust Badges (CRO) */}
                <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-gray-100 text-center">
                    <div className="flex flex-col items-center gap-1">
                        <div className="p-2 bg-gray-50 rounded-full"><Lock className="w-4 h-4 text-gray-600" /></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Secure Pay</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="p-2 bg-gray-50 rounded-full"><Truck className="w-4 h-4 text-gray-600" /></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="p-2 bg-gray-50 rounded-full"><ShieldCheck className="w-4 h-4 text-gray-600" /></div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Authentic</span>
                    </div>
                </div>

            </div>
        </div>
    );
}