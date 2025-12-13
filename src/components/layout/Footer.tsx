"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";

import { useState } from "react";

export default function Footer() {
  const [open, setOpen] = useState<number | null>(null);
  // Payment logos (Cloudinary demo URLs)
  const paymentLogos = [
    "https://res.cloudinary.com/demo/image/upload/w_40,h_24,c_fit,f_auto,q_auto/v1700000000/visa.png",
    "https://res.cloudinary.com/demo/image/upload/w_40,h_24,c_fit,f_auto,q_auto/v1700000000/amex.png",
    "https://res.cloudinary.com/demo/image/upload/w_40,h_24,c_fit,f_auto,q_auto/v1700000000/paypal.png"
  ];
  return (
    <footer className="bg-black text-white pt-12 pb-8 border-t border-gray-800">
      {/* Newsletter */}
      <div className="max-w-2xl mx-auto px-4 mb-10">
        <div className="bg-white text-black rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 shadow-lg">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-black mb-1">Unlock 10% Off</h2>
            <p className="text-gray-600 text-sm mb-2">Subscribe to our newsletter for exclusive drops.</p>
          </div>
          <form className="flex w-full md:w-auto" onSubmit={e => { e.preventDefault(); /* TODO: Server Action */ }}>
            <input type="email" required placeholder="Your email" className="rounded-l-lg px-4 py-2 border border-gray-300 focus:outline-none w-full md:w-56" />
            <button type="submit" className="bg-black text-white px-5 py-2 rounded-r-lg font-bold hover:bg-gray-900 transition flex items-center gap-2">Join <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Customer Care / Accordion */}
        <div>
          <button className="md:hidden w-full text-left font-bold uppercase tracking-wider mb-4 text-sm text-gray-400" onClick={() => setOpen(open === 0 ? null : 0)}>Customer Care</button>
          <div className={`md:block ${open === 0 ? '' : 'hidden md:block'}`}>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/shipping" className="hover:text-gray-400 transition">Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-gray-400 transition">Returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-gray-400 transition">Sizing</Link></li>
            </ul>
          </div>
        </div>
        {/* The Brand / Accordion */}
        <div>
          <button className="md:hidden w-full text-left font-bold uppercase tracking-wider mb-4 text-sm text-gray-400" onClick={() => setOpen(open === 1 ? null : 1)}>The Brand</button>
          <div className={`md:block ${open === 1 ? '' : 'hidden md:block'}`}>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/about" className="hover:text-gray-400 transition">About</Link></li>
              <li><Link href="/sustainability" className="hover:text-gray-400 transition">Sustainability</Link></li>
              <li><Link href="/careers" className="hover:text-gray-400 transition">Careers</Link></li>
            </ul>
          </div>
        </div>
        {/* Legal / Accordion */}
        <div>
          <button className="md:hidden w-full text-left font-bold uppercase tracking-wider mb-4 text-sm text-gray-400" onClick={() => setOpen(open === 2 ? null : 2)}>Legal</button>
          <div className={`md:block ${open === 2 ? '' : 'hidden md:block'}`}>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link href="/privacy" className="hover:text-gray-400 transition">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-gray-400 transition">Terms</Link></li>
            </ul>
          </div>
        </div>
        {/* Connect / Accordion */}
        <div>
          <button className="md:hidden w-full text-left font-bold uppercase tracking-wider mb-4 text-sm text-gray-400" onClick={() => setOpen(open === 3 ? null : 3)}>Connect</button>
          <div className={`md:block ${open === 3 ? '' : 'hidden md:block'}`}>
            <div className="flex gap-4 mb-4">
              <Link href="#" className="hover:text-gray-400 transition"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-gray-400 transition"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-gray-400 transition"><Twitter className="w-5 h-5" /></Link>
            </div>
            <form className="hidden md:block mb-2" onSubmit={e => { e.preventDefault(); /* TODO: Server Action */ }}>
              <input type="email" required placeholder="Your email" className="rounded-l-lg px-4 py-2 border border-gray-300 focus:outline-none w-40" />
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-r-lg font-bold hover:bg-gray-900 transition">Join</button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Logos */}
      <div className="container mx-auto px-4 md:px-10 flex flex-wrap items-center justify-between gap-4 border-t border-gray-900 pt-8">
        <div className="flex gap-4 grayscale">
          {paymentLogos.map((src, i) => (
            <img key={i} src={src} alt="Payment method" className="h-6 w-auto" />
          ))}
        </div>
        <p className="text-xs text-gray-600">© 2025 Crown & Crest. All rights reserved.</p>
      </div>
    </footer>
  );
}