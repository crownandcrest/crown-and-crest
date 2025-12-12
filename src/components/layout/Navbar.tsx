"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { 
    Search, ShoppingBag, User, Menu, X, ChevronRight 
} from "lucide-react";
// Import the new Smart Search Component
import PredictiveSearch from "@/components/layout/PredictiveSearch";

export default function Navbar() {
    const supabase = createClient();
    const router = useRouter();
    const { cart } = useCart();
    
    const [isOpen, setIsOpen] = useState(false); // Mobile Menu
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Mobile Search Toggle
    const [user, setUser] = useState<any>(null);

    // 1. Check Login Status
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            {/* TOP STRIP */}
            <div className="bg-black text-white text-xs font-bold text-center py-2 px-4">
                Sign up and get 20% off your first order. <Link href="/login" className="underline">Sign Up Now</Link>
            </div>

            {/* MAIN NAVBAR */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="container mx-auto px-4 md:px-10 h-20 flex items-center justify-between gap-4">
                    
                    {/* 1. Mobile Menu & Logo */}
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsOpen(true)} 
                            className="lg:hidden p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link href="/" className="text-2xl md:text-3xl font-black uppercase tracking-tighter font-display">
                            Crown & Crest
                        </Link>
                    </div>

                    {/* 2. Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-gray-600">
                        <Link href="/shop" className="hover:text-black transition">Shop All</Link>
                        <Link href="/shop?category=Men" className="hover:text-black transition">Men</Link>
                        <Link href="/shop?category=Women" className="hover:text-black transition">Women</Link>
                        <Link href="/shop?sort=newest" className="hover:text-black transition">New Arrivals</Link>
                    </nav>

                    {/* 3. SMART SEARCH BAR (Desktop) */}
                    <div className="hidden lg:flex flex-1 max-w-xl mx-8 justify-center">
                        <PredictiveSearch />
                    </div>

                    {/* 4. Icons */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Mobile Search Icon */}
                        <button 
                            onClick={() => setIsSearchOpen(!isSearchOpen)} 
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition group">
                            <ShoppingBag className="w-5 h-5 group-hover:text-black" />
                            {cart.length > 0 && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                    {cart.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition">
                                <User className="w-5 h-5" />
                            </Link>
                        ) : (
                            <Link href="/login" className="hidden md:block bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition">
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* MOBILE SEARCH (Slide Down) */}
                {isSearchOpen && (
                    <div className="lg:hidden px-4 pb-4 animate-in slide-in-from-top-2">
                        {/* Reuse the Smart Component for Mobile too */}
                        <PredictiveSearch />
                    </div>
                )}
            </header>

            {/* MOBILE MENU DRAWER */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)} />
            )}
            
            <div className={`fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-[60] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black uppercase font-display">Menu</h2>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {[
                            { name: "Shop All", href: "/shop" },
                            { name: "Men", href: "/shop?category=Men" },
                            { name: "Women", href: "/shop?category=Women" },
                            { name: "New Arrivals", href: "/shop?sort=newest" },
                        ].map((link) => (
                            <Link 
                                key={link.name} 
                                href={link.href} 
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 font-bold text-gray-700 hover:text-black transition"
                            >
                                {link.name} <ChevronRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-gray-100 pt-6 mt-6">
                        {user ? (
                            <Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl font-bold mb-3">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs">
                                    {user.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm">My Account</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/login" onClick={() => setIsOpen(false)} className="bg-black text-white py-3 rounded-xl font-bold text-center text-sm">Login</Link>
                                <Link href="/signup" onClick={() => setIsOpen(false)} className="border border-gray-200 py-3 rounded-xl font-bold text-center text-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}