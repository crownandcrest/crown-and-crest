"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { Product, ProductVariant } from "@/types";

export default function ProductCard({ product }: { product: Product & { product_variants: ProductVariant[] } }) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isHovered, setIsHovered] = useState(false);
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    const isWishlisted = isInWishlist(product.id);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    const variants = product.product_variants || [];
    const price = variants.length > 0 ? variants[0].selling_price : 0;
    const originalPrice = variants[0]?.cost_price || price * 1.2;
    const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    
    const colors = Array.from(new Set(variants.map((v: ProductVariant) => v.color).filter((c) => c))); 
    const sizes = Array.from(new Set(variants.map((v: ProductVariant) => v.size).filter((s) => s)));

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsQuickAddOpen(true);
    };

    const confirmAddToCart = (e: React.MouseEvent, size: string) => {
        e.preventDefault();
        const variant = variants.find((v: ProductVariant) => v.size === size);
        if (variant) {
            addToCart(product.id, variant.id, 1);
            setIsQuickAddOpen(false);
            alert("Added to Cart");
        }
    };

    return (
        <Link 
            href={`/product/${product.id}`}
            className="group block relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setIsQuickAddOpen(false); }}
        >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-4">
                <Image
                    src={product.images?.[0] || ""}
                    alt={product.name}
                    fill
                    className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />
                {product.images?.[1] && (
                    <Image
                        src={product.images[1]}
                        alt={product.name}
                        fill
                        className={`object-cover absolute inset-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}

                <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {discount > 0 && <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">-{discount}%</span>}
                    {product.is_featured && <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">Trending</span>}
                </div>

                <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                    <button onClick={handleWishlistToggle} className="bg-white p-2 rounded-full shadow-md hover:bg-black hover:text-white transition">
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                    </button>
                </div>

                <div className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 transition-transform duration-300 ${isQuickAddOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                    <p className="text-xs font-bold text-center mb-3 uppercase">Select Size</p>
                    <div className="flex justify-center gap-2 flex-wrap">
                        {sizes.map((size) => (
                            <button 
                                key={size}
                                onClick={(e) => confirmAddToCart(e, size as string)}
                                className="w-8 h-8 border border-gray-300 text-xs font-bold hover:bg-black hover:text-white transition"
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {!isQuickAddOpen && (
                    <button 
                        onClick={handleQuickAdd}
                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-bold text-xs shadow-xl flex items-center gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    >
                        <Plus className="w-4 h-4" /> Quick Add
                    </button>
                )}
            </div>

            <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold">₹{price.toLocaleString()}</span>
                    {originalPrice > price && (
                        <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                    )}
                </div>
                
                <div className="flex gap-1 items-center">
                    {colors.map((color, idx) => {
                        const colorName = String(color); 
                        const isWhite = colorName.toLowerCase() === 'white';
                        
                        return (
                            <div 
                                key={idx} 
                                className={`w-3 h-3 rounded-full border border-gray-300 ${isWhite ? 'bg-white' : ''}`} 
                                style={{ backgroundColor: isWhite ? '#ffffff' : colorName }}
                                title={colorName}
                            />
                        );
                    })}
                    {sizes.length > 0 && (
                        <div className="ml-auto text-[10px] text-gray-400 uppercase">
                            {sizes.slice(0, 4).join(" / ")}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}