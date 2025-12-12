"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import FilterSidebar from "./FilterSidebar";
import { SlidersHorizontal, ChevronDown, CheckCircle, Truck, RefreshCw, ShoppingBag } from "lucide-react";

export default function ShopClient({ initialProducts }: { initialProducts: any[] }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [filters, setFilters] = useState<any>({});
    const [sort, setSort] = useState("newest");

    // Client-side Filtering Logic
    const filteredProducts = initialProducts.filter(product => {
        if (filters.category?.length > 0 && !filters.category.includes(product.category)) return false;
        // Add more logic here for size/color filtering based on variants
        return true;
    }).sort((a, b) => {
        if (sort === "price_asc") return a.product_variants[0].selling_price - b.product_variants[0].selling_price;
        if (sort === "price_desc") return b.product_variants[0].selling_price - a.product_variants[0].selling_price;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return (
        <div className="min-h-screen bg-white">
            
            {/* 1. HERO HEADER */}
            <div className="pt-10 pb-8 container mx-auto px-4 md:px-10">
                <nav className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Home / Shop / Men</nav>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2">Streetwear Collection</h1>
                <p className="text-gray-500 max-w-xl">Explore premium oversized t-shirts crafted for comfort and durability. 100% Cotton. Made for India.</p>
            </div>

            {/* 2. STICKY FILTER BAR */}
            <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md border-y border-gray-200">
                <div className="container mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
                    
                    {/* Left: Filter Toggle */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider hover:text-gray-600 lg:hidden"
                        >
                            <SlidersHorizontal className="w-4 h-4" /> Filters
                        </button>
                        <span className="hidden lg:block text-sm font-bold text-gray-400 uppercase tracking-wider">
                            {filteredProducts.length} Products
                        </span>
                    </div>

                    {/* Right: Sort */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 uppercase hidden md:inline">Sort By:</span>
                        <select 
                            className="text-sm font-bold bg-transparent outline-none cursor-pointer uppercase"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="newest">Newest Arrivals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="trending">Best Selling</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex container mx-auto px-4 md:px-10 py-10 gap-10">
                
                {/* 3. SIDEBAR */}
                <FilterSidebar 
                    isOpen={isSidebarOpen} 
                    onClose={() => setIsSidebarOpen(false)} 
                    filters={filters} 
                    setFilters={setFilters} 
                />

                {/* 4. PRODUCT GRID */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="mt-20 text-center">
                        <button className="border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest hover:text-gray-600 hover:border-gray-400 transition">
                            Load More
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. RECOMMENDATIONS */}
            <section className="py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 md:px-10">
                    <h3 className="text-2xl font-black uppercase mb-10 text-center">You Might Also Like</h3>
                    {/* Reuse Product Grid here with random items */}
                </div>
            </section>

            {/* 6. TRUST STRIP */}
            <div className="bg-gray-50 py-12 border-t border-gray-200">
                <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-gray-400" />
                        <span className="font-bold text-sm uppercase">7-Day Easy Returns</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-6 h-6 text-gray-400" />
                        <span className="font-bold text-sm uppercase">100% Cotton Quality</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Truck className="w-6 h-6 text-gray-400" />
                        <span className="font-bold text-sm uppercase">Fast Shipping</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                        <span className="font-bold text-sm uppercase">Secure Payment</span>
                    </div>
                </div>
            </div>

            {/* 7. SEO TEXT */}
            <div className="container mx-auto px-4 py-10 text-center max-w-3xl">
                <p className="text-xs text-gray-400 leading-relaxed">
                    Crown & Crest brings premium oversized T-shirts made with 240 GSM heavy cotton, ideal for streetwear and daily comfort. 
                    Explore affordable, durable, and minimal designs perfect for Indian weather. Shop the latest drop now.
                </p>
            </div>
        </div>
    );
}