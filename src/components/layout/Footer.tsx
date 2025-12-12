"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* BRAND */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black uppercase tracking-tighter font-display">Crown & Crest</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Premium oversized streetwear crafted for comfort and durability. 
            Designed in Mumbai, made for the world.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="#" className="hover:text-gray-400 transition"><Instagram className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-gray-400 transition"><Facebook className="w-5 h-5" /></Link>
            <Link href="#" className="hover:text-gray-400 transition"><Twitter className="w-5 h-5" /></Link>
          </div>
        </div>

        {/* SHOP */}
        <div>
          <h3 className="font-bold uppercase tracking-wider mb-6 text-sm text-gray-400">Shop</h3>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="/shop" className="hover:text-gray-400 transition">All Products</Link></li>
            <li><Link href="/shop?category=Men" className="hover:text-gray-400 transition">Men</Link></li>
            <li><Link href="/shop?category=Women" className="hover:text-gray-400 transition">Women</Link></li>
            <li><Link href="/shop?sort=newest" className="hover:text-gray-400 transition">New Arrivals</Link></li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="font-bold uppercase tracking-wider mb-6 text-sm text-gray-400">Support</h3>
          <ul className="space-y-3 text-sm font-medium">
            <li><Link href="/account" className="hover:text-gray-400 transition">My Account</Link></li>
            <li><Link href="/account/orders" className="hover:text-gray-400 transition">Track Order</Link></li>
            <li><Link href="#" className="hover:text-gray-400 transition">Returns & Exchanges</Link></li>
            <li><Link href="#" className="hover:text-gray-400 transition">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-bold uppercase tracking-wider mb-6 text-sm text-gray-400">Contact</h3>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <span>123 Fashion Street, Bandra West,<br />Mumbai, Maharashtra 400050</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <a href="mailto:support@crownandcrest.com" className="hover:text-white transition">support@crownandcrest.com</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <span>+91 98765 43210</span>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="container mx-auto px-4 md:px-10 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
        <p>© 2025 Crown & Crest. All rights reserved.</p>
        <div className="flex gap-6">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}