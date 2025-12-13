"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { Heart, Share2, Ruler, User, Clock, MapPin, Loader2 } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import Link from "next/link";
import { Product, ProductVariant, SizeChart, UserMeasurement } from "@/types";

interface ProductDetailsClientProps {
    product: Product & { product_variants: ProductVariant[] };
    relatedProducts: Product[];
    sizeChart?: SizeChart;      
    userProfiles?: UserMeasurement[]; 
}

export default function ProductDetailsClient({ product, relatedProducts, sizeChart, userProfiles = [] }: ProductDetailsClientProps) {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    
    const colors = useMemo(() => {
        return Array.from(new Set(product.product_variants.map((v: ProductVariant) => v.color)));
    }, [product.product_variants]);

    const [activeImage, setActiveImage] = useState(product.images?.[0] || "");
    const [selectedColor, setSelectedColor] = useState<string>(() => colors[0] as string || "");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    
    const [pincode, setPincode] = useState("");
    const [deliveryEstimate, setDeliveryEstimate] = useState<string | null>(null);
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);

    const isWishlisted = isInWishlist(product.id);

    const handleWishlistToggle = () => {
        if (isWishlisted) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product.id);
        }
    };

    const handlePincodeCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pincode.length !== 6 || isCheckingPincode) return;

        setIsCheckingPincode(true);
        setDeliveryEstimate(null);

        await new Promise(resolve => setTimeout(resolve, 800));

        if (pincode === '400001' || pincode === '110001') {
             setDeliveryEstimate("Estimated Delivery: 2-3 Business Days");
        } else if (pincode.startsWith('5') || pincode.startsWith('6')) {
             setDeliveryEstimate("Estimated Delivery: 5-7 Business Days (Remote Area)");
        } else {
             setDeliveryEstimate("Delivery not available at this pincode.");
        }

        setIsCheckingPincode(false);
    };

    const recommendations = useMemo(() => {
        if (!sizeChart || !userProfiles || userProfiles.length === 0) return null;
        
        const results = userProfiles.map(profile => {
            const targetChest = Number(profile.chest) + 2; 
            
            let bestFit = null;
            let minDiff = Infinity;

            Object.entries(sizeChart.measurements).forEach(([sizeKey, measures]: [string, { [key: string]: number }]) => {
                const chartChest = Number(measures.chest);
                
                if (chartChest >= targetChest) {
                    const diff = chartChest - targetChest;
                    if (diff < minDiff) {
                        minDiff = diff;
                        bestFit = sizeKey;
                    }
                }
            });

            return { profileName: profile.profile_name, isDefault: profile.is_default, bestFit };
        });

        return results;
    }, [sizeChart, userProfiles]);

    const defaultRecommendation = recommendations?.find(r => r.isDefault) || recommendations?.[0];

    const sizes = useMemo(() => {
        if (!selectedColor) return [];
        return product.product_variants
            .filter((v: ProductVariant) => v.color === selectedColor)
            .map((v: ProductVariant) => ({ size: v.size, stock: v.stock_quantity }));
    }, [product.product_variants, selectedColor]);

    const activeVariant = useMemo(() => {
        return product.product_variants.find((v: ProductVariant) => v.color === selectedColor && v.size === selectedSize);
    }, [product.product_variants, selectedColor, selectedSize]);

    const price = activeVariant ? activeVariant.selling_price : (product.product_variants[0]?.selling_price || 0);
    const originalPrice = activeVariant ? activeVariant.cost_price : (product.product_variants[0]?.cost_price || price * 1.2);
    const discount = originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    const currentStock = activeVariant ? activeVariant.stock_quantity : 0;

    const handleAddToCart = () => {
        if (!selectedSize) return alert("Please select a size.");
        if (!activeVariant || currentStock === 0) return alert("Out of stock.");
        
        addToCart(product.id, activeVariant.id, quantity);
        alert("Added to Cart!"); 
    };

    return (
        <div className="min-h-screen bg-white">
            
            <div className="container mx-auto px-4 md:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] w-full bg-gray-100 rounded-3xl overflow-hidden">
                            {activeImage && <Image src={activeImage} alt={product.name} fill className="object-cover" priority />}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {discount > 0 && <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-full">-{discount}%</span>}
                            </div>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images?.map((img: string, idx: number) => (
                                <button key={idx} onClick={() => setActiveImage(img)} className={`relative w-20 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent hover:border-gray-300'}`}>
                                    <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col">
                        
                        <div className="mb-8 border-b border-gray-100 pb-8">
                             <nav className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Home / Shop / {product.category}</nav>
                             <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">{product.name}</h1>
                             <div className="flex items-center gap-4">
                                 <span className="text-2xl font-bold">₹{price.toLocaleString()}</span>
                                 {originalPrice > price && <span className="text-lg text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>}
                                 {discount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">-{discount}%</span>}
                             </div>
                        </div>

                        {defaultRecommendation && defaultRecommendation.bestFit && (
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 animate-in fade-in">
                                <div className="flex items-start gap-3">
                                    <Ruler className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm text-blue-900 font-bold mb-1">
                                            We recommend Size <span className="text-lg underline">{defaultRecommendation.bestFit}</span>
                                        </p>
                                        <p className="text-xs text-blue-700">
                                            Based on your <strong>{defaultRecommendation.profileName}</strong> profile.
                                        </p>
                                        {recommendations && recommendations.length > 1 && (
                                            <div className="mt-3 pt-3 border-t border-blue-200">
                                                <p className="text-[10px] uppercase font-bold text-blue-500 mb-2">Other Profiles:</p>
                                                <div className="space-y-1">
                                                    {recommendations.filter(r => !r.isDefault).map((rec, i) => (
                                                        <div key={i} className="flex justify-between text-xs text-blue-800">
                                                            <span>{rec.profileName}</span>
                                                            <span className="font-bold">{rec.bestFit || "N/A"}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Link href="/account/size-book" className="text-xs font-bold text-blue-600 underline">Update</Link>
                                </div>
                            </div>
                        )}
                        
                        {!userProfiles || userProfiles.length === 0 && (
                            <div className="mb-8">
                                <Link href="/account/size-book" className="text-xs flex items-center gap-2 text-gray-500 hover:text-black transition">
                                    <User className="w-4 h-4" /> Log in & set your size for a recommendation.
                                </Link>
                            </div>
                        )}

                        <div className="mb-8">
                            <p className="font-bold text-sm uppercase mb-4">Color: {selectedColor}</p>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((color) => {
                                    const cName = String(color);
                                    return (
                                        <button key={cName} onClick={() => { setSelectedColor(cName); setSelectedSize(""); }} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center p-1 ${selectedColor === cName ? 'border-black' : 'border-gray-200'}`}>
                                            <div className={`w-full h-full rounded-full ${cName.toLowerCase() === 'white' ? 'bg-white border border-gray-200' : ''}`} style={{ backgroundColor: cName.toLowerCase() === 'white' ? '#fff' : cName }} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                             <div className="font-bold text-sm uppercase mb-4 flex justify-between items-center">
                                <span>Size: {selectedSize || "Select"}</span>
                                {sizeChart && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                        Chart: {sizeChart.name}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {sizes.map((item) => (
                                    <button 
                                        key={item.size}
                                        onClick={() => setSelectedSize(item.size)}
                                        disabled={item.stock === 0}
                                        className={`py-3 text-sm font-bold border-2 rounded-xl relative ${selectedSize === item.size ? 'bg-black text-white border-black' : item.stock === 0 ? 'bg-gray-50 text-gray-300 line-through' : 'border-gray-200 hover:border-black'}`}>
                                        {item.size}
                                        {item.stock > 0 && item.stock < 5 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{item.stock} left</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mb-8 pt-4 border-t border-gray-100">
                             <h3 className="text-sm font-bold uppercase mb-2 flex items-center gap-2 text-gray-700">
                                <MapPin className="w-4 h-4" /> Check Delivery Estimate
                            </h3>
                            <form onSubmit={handlePincodeCheck} className="flex gap-2">
                                <input 
                                    type="number" 
                                    placeholder="Enter Pincode (e.g., 400001)"
                                    className="flex-1 p-3 border border-gray-200 rounded-xl text-sm focus:border-black"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={isCheckingPincode || pincode.length !== 6}
                                    className="bg-gray-100 text-black px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isCheckingPincode ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                                </button>
                            </form>
                            
                            {deliveryEstimate && (
                                <p className={`mt-2 text-sm flex items-center gap-1 ${deliveryEstimate.startsWith('Delivery not') ? 'text-red-500' : 'text-green-600'}`}>
                                    <Clock className="w-4 h-4" />
                                    <span className="font-bold">{deliveryEstimate}</span>
                                </p>
                            )}
                        </div>

                        <div className="hidden lg:flex gap-4 mb-8">
                            <div className="flex items-center border-2 border-black rounded-full px-4">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-lg font-bold px-2">-</button>
                                <span className="px-4 font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="text-lg font-bold px-2" disabled={quantity >= currentStock}>+</button>
                            </div>
                            <button onClick={handleAddToCart} disabled={!selectedSize || currentStock === 0} className="flex-1 bg-black text-white text-sm font-bold uppercase tracking-wider py-4 rounded-full hover:bg-gray-800 transition disabled:opacity-50">
                                {currentStock === 0 ? "Out of Stock" : !selectedSize ? "Select Size" : "Add to Cart"}
                            </button>
                            <button onClick={handleWishlistToggle} className="p-4 border-2 border-gray-200 rounded-full hover:border-black transition text-gray-500 hover:text-black">
                                <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-8 space-y-6 text-sm text-gray-600">
                            <p>{product.description}</p>
                            <ul className="grid grid-cols-2 gap-y-3 font-medium text-gray-900">
                                {product.fit_type && <li>Fit: {product.fit_type}</li>}
                                <li>100% Cotton</li>
                                <li>Made in India</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section className="py-20 border-t border-gray-100">
                    <div className="container mx-auto px-4 md:px-10">
                        <h3 className="text-2xl font-black uppercase mb-10 text-center">Complete The Look</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((related) => <ProductCard key={related.id} product={related} />)}
                        </div>
                    </div>
                </section>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 flex gap-4">
                 <button className="p-4 border-2 border-gray-200 rounded-full text-gray-500"><Share2 className="w-5 h-5" /></button>
                 <button onClick={handleWishlistToggle} className="p-4 border-2 border-gray-200 rounded-full hover:border-black transition text-gray-500 hover:text-black">
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : ''}`} />
                 </button>
                 <button onClick={handleAddToCart} disabled={!selectedSize || currentStock === 0} className="flex-1 bg-black text-white text-sm font-bold uppercase tracking-wider py-4 rounded-full transition disabled:opacity-50">
                     {currentStock === 0 ? "Out of Stock" : !selectedSize ? "Select Size" : `Add - ₹${price.toLocaleString()}`}
                </button>
            </div>
        </div>
    );
}

