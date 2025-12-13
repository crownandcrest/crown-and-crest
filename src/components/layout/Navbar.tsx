"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, ShoppingBag, Menu, X, LogOut, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The listener above will handle the state update
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link href="/" className="text-xl font-black tracking-tighter uppercase">
            Crown & Crest
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-bold text-gray-500 hover:text-black transition">SHOP</Link>
            <Link href="/about" className="text-sm font-bold text-gray-500 hover:text-black transition">ABOUT</Link>
            
            {/* DYNAMIC AUTH BUTTONS */}
            {user ? (
              <div className="flex items-center gap-4 ml-4">
                <Link href="/wishlist" className="p-2 text-gray-400 hover:text-red-500 transition">
                   <Heart className="w-5 h-5" />
                </Link>
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
                        <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">My Wishlist</Link>
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
                {/* <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">0</span> */}
            </Link>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart">
                <ShoppingBag className="w-5 h-5" />
            </Link>
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-4">
            <Link href="/shop" className="block text-lg font-bold">Shop</Link>
            <Link href="/wishlist" className="block text-lg font-bold">Wishlist</Link>
            
            {user ? (
                <>
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 mb-2">ACCOUNT</p>
                        <p className="text-sm font-medium mb-4">{user.email || user.phone}</p>
                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                </>
            ) : (
                <Link href="/login" className="block w-full text-center bg-black text-white py-3 rounded-xl font-bold">
                    Login / Sign Up
                </Link>
            )}
        </div>
      )}
    </nav>
  );
}