"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User, ShoppingBag, Menu, X, LogOut, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  // 1. LISTEN TO AUTH STATE
  useEffect(() => {
    // Check initial user
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();

    // Subscribe to changes (Login, Logout, Auto-refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push("/"); // Go home on logout
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The listener above will handle the state update
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* LOGO */}
          <Link href="/" className="text-2xl font-serif font-black tracking-tight uppercase mx-auto md:mx-0">
            VOGUE
          </Link>

          {/* DESKTOP MENU + MEGA MENU */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center">
            {/* Main nav links */}
            <div className="relative group">
              <button className={`text-sm font-bold px-2 py-1 transition ${pathname.startsWith('/shop') ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Women</button>
              {/* Mega Menu */}
              <div className="absolute left-0 top-full w-screen max-w-4xl bg-white shadow-xl border-t border-gray-100 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50 p-8 flex gap-8">
                <div className="flex-1 grid grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-bold mb-2">New In</h4>
                    <ul className="space-y-1">
                      <li><Link href="/shop?category=women-new" className="hover:underline">View All</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Clothing</h4>
                    <ul className="space-y-1">
                      <li><Link href="/shop?category=women-dresses" className="hover:underline">Dresses</Link></li>
                      <li><Link href="/shop?category=women-tops" className="hover:underline">Tops</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">Shoes</h4>
                    <ul className="space-y-1">
                      <li><Link href="/shop?category=women-shoes" className="hover:underline">All Shoes</Link></li>
                    </ul>
                  </div>
                </div>
                {/* Featured editorial image */}
                <div className="flex-1 flex items-center justify-center">
                  <img src="https://res.cloudinary.com/demo/image/upload/w_300,h_400,c_fill,f_auto,q_auto/v1700000000/trench-coat.jpg" alt="Featured" className="rounded-lg shadow-lg object-cover w-60 h-80" />
                </div>
              </div>
            </div>
            <Link href="/shop?category=men" className={`text-sm font-bold px-2 py-1 transition ${pathname.includes('/men') ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Men</Link>
            <Link href="/shop?category=kids" className={`text-sm font-bold px-2 py-1 transition ${pathname.includes('/kids') ? 'text-black' : 'text-gray-500 hover:text-black'}`}>Kids</Link>
          </div>

          {/* ICONS */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search" aria-label="Search"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></Link>
            <Link href="/account" aria-label="Account"><User className="w-5 h-5" /></Link>
            <Link href="/wishlist" aria-label="Wishlist"><Heart className="w-5 h-5" /></Link>
            <Link href="/cart" className="relative" aria-label="Cart">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce">{cartCount}</span>
              )}
            </Link>
          </div>
            
            {/* DYNAMIC AUTH BUTTONS */}
            {user ? (
              <div className="flex items-center gap-4 ml-4">

                <div className="relative group">
                    <button className="flex items-center gap-2 text-sm font-bold hover:bg-gray-100 px-3 py-2 rounded-full transition">
                        <User className="w-4 h-4" />
                        <span>Account</span>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right">
                        <div className="px-4 py-2 border-b border-gray-100 mb-2">
                            <p className="text-xs text-gray-400 font-bold">Signed in as</p>
                            <p className="text-sm font-medium truncate">{user.email || user.phone}</p>
                        </div>

                        <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">My Orders</Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sign Out</button>
                    </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-800 transition">
                Login
              </Link>
            )}
            
            <Link href="/cart" className="p-2 relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
            </Link>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* MOBILE MENU DROPDOWN */}
      {/* {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white/95 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Link href="/" className="text-xl font-black uppercase">VOGUE</Link>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center gap-8">
            <Link href="/shop?category=women" className="text-lg font-bold">Women</Link>
            <Link href="/shop?category=men" className="text-lg font-bold">Men</Link>
            <Link href="/shop?category=kids" className="text-lg font-bold">Kids</Link>
            <Link href="/about" className="text-lg font-bold">About</Link>
            {user ? (
              <>
                <Link href="/account" className="text-lg font-bold">Account</Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold mt-4"><LogOut className="w-4 h-4" />Sign Out</button>
              </>
            ) : (
              <Link href="/login" className="block w-full text-center bg-black text-white py-3 rounded-xl font-bold">Login / Sign Up</Link>
            )}
          </div>
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50">
            <Link href="/" className={`flex flex-col items-center ${pathname === '/' ? 'text-black' : 'text-gray-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg><span className="text-xs">Home</span></Link>
            <Link href="/shop" className={`flex flex-col items-center ${pathname.startsWith('/shop') ? 'text-black' : 'text-gray-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg><span className="text-xs">Shop</span></Link>
            <Link href="/curated" className={`flex flex-col items-center ${pathname.startsWith('/curated') ? 'text-black' : 'text-gray-400'}`}><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15 8.5 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 9 8.5 12 2" /></svg><span className="text-xs">Curated</span></Link>
            <Link href="/wishlist" className={`flex flex-col items-center ${pathname.startsWith('/wishlist') ? 'text-black' : 'text-gray-400'}`}><Heart className="w-6 h-6" /><span className="text-xs">Wishlist</span></Link>
            <Link href="/account" className={`flex flex-col items-center ${pathname.startsWith('/account') ? 'text-black' : 'text-gray-400'}`}><User className="w-6 h-6" /><span className="text-xs">Account</span></Link>
          </div>
        </div>
      )} */}
    </nav>
  );
}