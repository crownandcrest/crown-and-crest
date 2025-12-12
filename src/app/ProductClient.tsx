// src/components/product/ProductClient.tsx
"use client";

import { useState, useEffect } from 'react';
import { Star, ShoppingBag, Truck, ShieldCheck, Ruler } from 'lucide-react';
import Image from 'next/image';

interface Variant {
    id: string;
    size: string;
    color: string;
    selling_price: number;
    stock_quantity: number;
}

interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    category: string;
    fit_type: 'Regular' | 'Oversized' | 'Slim';
}

interface UserMeasurements {
    height_cm?: number;
    weight_kg?: number;
    chest_cm?: number;
    body_type?: string;
}

export default function ProductClient({ 
    product, 
    variants, 
    measurements 
}: { 
    product: Product, 
    variants: Variant[], 
    measurements?: UserMeasurements | null
}) {
    // 1. State
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [mainImage, setMainImage] = useState(product.images?.[0] || '');

    // Get unique sizes and sorted variants
    const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));
    // Simple sort: S, M, L, XL
    const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    uniqueSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    // Set default selected size on mount
    useEffect(() => {
        if (uniqueSizes.length > 0 && !selectedSize) {
            setSelectedSize(uniqueSizes[0]);
        }
    }, [uniqueSizes, selectedSize]);

    // Find active variant data based on selection
    const activeVariant = variants.find(v => v.size === selectedSize) || variants[0];

    // --- 🔮 THE FIT ALGORITHM ---
    const getRecommendedSize = () => {
        if (!measurements || (!measurements.height_cm && !measurements.weight_kg && !measurements.chest_cm)) return null;

        const { height_cm, weight_kg, chest_cm } = measurements;
        let score = 0;

        // Base score on Chest (Most accurate)
        if (chest_cm) {
            if (chest_cm < 90) score = 1; // S
            else if (chest_cm < 100) score = 2; // M
            else if (chest_cm < 110) score = 3; // L
            else score = 4; // XL
        } 
        // Fallback to Weight/Height
        else if (weight_kg && height_cm) {
            const bmi = weight_kg / ((height_cm / 100) ** 2);
            if (bmi < 20) score = 1; // S
            else if (bmi < 25) score = 2; // M
            else if (bmi < 29) score = 3; // L
            else score = 4; // XL
        } else {
            return null; // Not enough data
        }

        // Adjust for Fit Type
        if (product.fit_type === 'Oversized') {
            score -= 1; // Downsize recommendation for oversized items
        } else if (product.fit_type === 'Slim') {
            score += 1; // Upsize for slim items
        }

        // Clamp score
        if (score < 1) score = 1;
        if (score > 4) score = 4;

        const sizes = ['S', 'M', 'L', 'XL'];
        const recommended = sizes[score - 1];

        // Only recommend if the size is available
        return uniqueSizes.includes(recommended) ? recommended : null;
    };

    const recommendedSize = getRecommendedSize();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* --- LEFT: GALLERY --- */}
            <div className="space-y-4">
                <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                    {mainImage ? (
                        <Image src={mainImage} alt={product.name} fill className="object-cover" priority />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                    )}
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {product.images?.map((img, idx) => (
                        <button 
                            key={idx} 
                            onClick={() => setMainImage(img)}
                            className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition flex-shrink-0
                                ${mainImage === img ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                        >
                            <Image src={img} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* --- RIGHT: DETAILS --- */}
            <div className="flex flex-col h-full">
                
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
                            {product.category}
                        </span>
                        {product.fit_type && (
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
                                {product.fit_type} Fit
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 font-display uppercase">{product.name}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-gray-900">₹{activeVariant?.selling_price.toFixed(2)}</span>
                        <div className="flex items-center gap-1 text-sm text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold text-black">4.8</span>
                            <span className="text-gray-400">(120 Reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Size Selector */}
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-3">
                        <label className="font-bold text-sm text-gray-900">Select Size</label>
                        {/* Size Guide Link Placeholder */}
                        <button className="text-xs underline text-gray-500 hover:text-black">Size Guide</button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                        {uniqueSizes.map((size) => {
                            const isRecommended = size === recommendedSize;
                            return (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`relative py-3 rounded-xl border-2 font-bold transition
                                        ${selectedSize === size 
                                            ? 'border-black bg-black text-white' 
                                            : 'border-gray-200 hover:border-gray-400 text-gray-700'
                                        } ${isRecommended ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}
                                >
                                    {size}
                                    {isRecommended && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm z-10">
                                            Best Fit
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* FIT FEEDBACK MESSAGE */}
                    {recommendedSize && (
                        <div className="mt-3 flex items-start gap-2 bg-indigo-50 p-3 rounded-lg text-xs text-indigo-800 border border-indigo-100">
                            <Ruler className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <p>
                                Based on your <strong>Size Book</strong> ({measurements?.height_cm}cm / {measurements?.weight_kg}kg), 
                                we recommend <strong>Size {recommendedSize}</strong> for this <strong>{product.fit_type}</strong> fit.
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-4 mb-8">
                    <button className="flex-1 bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transform duration-200">
                        <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </button>
                </div>

                {/* Description */}
                <div className="prose prose-sm text-gray-600 mb-8">
                    <p>{product.description}</p>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-gray-900">Free Shipping</p>
                            <p className="text-[10px] text-gray-500">On orders over ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <p className="font-bold text-xs text-gray-900">Easy Returns</p>
                            <p className="text-[10px] text-gray-500">14-day exchange policy</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}