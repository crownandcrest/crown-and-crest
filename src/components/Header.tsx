"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext"; 
import { Search, ShoppingCart, User, Menu, X } from "lucide-react"; // Ensure you have lucide-react installed

export default function Header(): React.JSX.Element {
  const { getCartCount } = useCart();
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const totalItems = getCartCount();

  return (
    <>
      {/* Top Banner [cite: 2, 3] */}
      <div className="bg-cc-black text-white text-xs sm:text-sm py-2 px-4 text-center relative">
        <p>
          Sign up and get 20% off to your first order.{" "}
          <Link href="/signup" className="underline font-medium hover:text-gray-300 ml-1">
            Sign Up Now
          </Link>
        </p>
        {/* Optional Close Button from design */}
        <button className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white">
            <X size={16} />
        </button>
      </div>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-6 py-6 flex items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <button 
                className="lg:hidden text-cc-black"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <Menu size={24} />
            </button>

            {/* Logo [cite: 1, 609] */}
            <Link href="/" className="flex-shrink-0">
                <span className="text-2xl md:text-[32px] font-black uppercase tracking-tighter text-cc-black font-display">
                Crown & Crest
                </span>
            </Link>
          </div>

          {/* Navigation - Desktop  */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            <Link href="/shop" className="text-base text-cc-black hover:text-neutral-600 transition-colors">Shop</Link>
            <Link href="/shop?sale=true" className="text-base text-cc-black hover:text-neutral-600 transition-colors">On Sale</Link>
            <Link href="/shop?sort=newest" className="text-base text-cc-black hover:text-neutral-600 transition-colors">New Arrivals</Link>
            <Link href="/shop?brand=all" className="text-base text-cc-black hover:text-neutral-600 transition-colors">Brands</Link>
          </nav>

          {/* Search Bar - Matches Pill Shape in PDF  */}
          <div className="flex-1 hidden lg:block max-w-[500px]">
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className="w-full bg-cc-gray rounded-full py-3 pl-12 pr-4 text-sm outline-none focus:ring-1 focus:ring-black/10 transition-all placeholder:text-gray-500"
                />
            </div>
          </div>

          {/* Right Icons: Cart & Account */}
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-cc-black">
                <Search size={24} />
            </button>
            
            <Link href="/cart" className="relative text-cc-black hover:text-neutral-600 transition-colors">
              <ShoppingCart size={24} />
              {isClient && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link href="/account" className="text-cc-black hover:text-neutral-600 transition-colors">
              <User size={24} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}