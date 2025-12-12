"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PredictiveSearch() {
    const supabase = createClient();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounce Search (Wait 300ms after typing stops to save DB calls)
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                // Call the RPC function we just created
                const { data, error } = await supabase.rpc('search_products', { keyword: query });
                
                if (!error && data) {
                    setResults(data);
                    setIsOpen(true);
                }
                setLoading(false);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsOpen(false);
        router.push(`/shop?q=${encodeURIComponent(query)}`);
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-lg">
            <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search products, categories..." 
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pl-11 pr-10 text-sm font-medium focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                />
                {query && (
                    <button 
                        type="button"
                        onClick={() => { setQuery(""); setIsOpen(false); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                    </button>
                )}
            </form>

            {/* PREDICTIVE DROPDOWN */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    
                    {results.length > 0 ? (
                        <>
                            <div className="p-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-2">Products</p>
                                {results.slice(0, 5).map((product) => (
                                    <Link 
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition group"
                                    >
                                        <div className="relative w-10 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                            {product.images?.[0] && (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition">{product.name}</h4>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{product.category}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black -translate-x-2 group-hover:translate-x-0 transition-transform opacity-0 group-hover:opacity-100" />
                                    </Link>
                                ))}
                            </div>
                            
                            {/* "View All" Footer */}
                            <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                                <button 
                                    onClick={handleSubmit} 
                                    className="text-xs font-bold text-indigo-600 hover:underline"
                                >
                                    View all {results.length} results for "{query}"
                                </button>
                            </div>
                        </>
                    ) : (
                        !loading && (
                            <div className="p-8 text-center">
                                <p className="text-sm font-bold text-gray-900">No results found.</p>
                                <p className="text-xs text-gray-500 mt-1">Try searching for "Shirt", "Denim", or "Summer".</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}