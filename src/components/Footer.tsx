// src/components/Footer.tsx
import Link from "next/link";
import { Mail, Twitter, Facebook, Instagram, Github, CreditCard } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative bg-[#F0F0F0] pt-32 pb-10 mt-40">
            
            {/* --- NEWSLETTER SECTION (Floating) --- */}
            <div className="absolute -top-24 left-0 right-0 px-4">
                <div className="container mx-auto bg-black rounded-[20px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                    <h2 className="text-3xl md:text-4xl font-black text-white font-display uppercase max-w-lg leading-tight">
                        Stay up to date about our latest offers
                    </h2>
                    <div className="w-full max-w-md space-y-3">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="w-full bg-white rounded-full py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                        <button className="w-full bg-white text-black font-bold rounded-full py-3 hover:bg-gray-100 transition">
                            Subscribe to Newsletter
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MAIN FOOTER CONTENT --- */}
            <div className="container mx-auto px-4 md:px-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12 border-b border-gray-200 pb-12">
                    
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-1 space-y-6">
                        <h3 className="text-3xl font-black font-display uppercase">Crown & Crest</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            We have clothes that suits your style and which you're proud to wear. From women to men.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                                <Twitter className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-8 h-8 bg-black text-white border border-black rounded-full flex items-center justify-center transition">
                                <Facebook className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                                <Instagram className="w-4 h-4" />
                            </Link>
                            <Link href="#" className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition">
                                <Github className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold uppercase tracking-widest mb-6">Company</h4>
                        <ul className="space-y-4 text-gray-600 text-sm">
                            <li><Link href="#" className="hover:text-black">About</Link></li>
                            <li><Link href="#" className="hover:text-black">Features</Link></li>
                            <li><Link href="#" className="hover:text-black">Works</Link></li>
                            <li><Link href="#" className="hover:text-black">Career</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-widest mb-6">Help</h4>
                        <ul className="space-y-4 text-gray-600 text-sm">
                            <li><Link href="#" className="hover:text-black">Customer Support</Link></li>
                            <li><Link href="#" className="hover:text-black">Delivery Details</Link></li>
                            <li><Link href="#" className="hover:text-black">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-black">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-widest mb-6">FAQ</h4>
                        <ul className="space-y-4 text-gray-600 text-sm">
                            <li><Link href="#" className="hover:text-black">Account</Link></li>
                            <li><Link href="#" className="hover:text-black">Manage Deliveries</Link></li>
                            <li><Link href="#" className="hover:text-black">Orders</Link></li>
                            <li><Link href="#" className="hover:text-black">Payments</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold uppercase tracking-widest mb-6">Resources</h4>
                        <ul className="space-y-4 text-gray-600 text-sm">
                            <li><Link href="#" className="hover:text-black">Free eBooks</Link></li>
                            <li><Link href="#" className="hover:text-black">Development Tutorial</Link></li>
                            <li><Link href="#" className="hover:text-black">How to - Blog</Link></li>
                            <li><Link href="#" className="hover:text-black">Youtube Playlist</Link></li>
                        </ul>
                    </div>
                </div>

                {/* --- BOTTOM BAR --- */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        Crown & Crest © 2000-2025, All Rights Reserved
                    </p>
                    <div className="flex gap-2">
                        {/* Payment Placeholders - Replace with real Images if you have them */}
                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-center font-bold text-xs text-blue-600 italic">VISA</div>
                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-center font-bold text-xs text-red-500">Mastercard</div>
                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-center font-bold text-xs text-blue-500">PayPal</div>
                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-center font-bold text-xs text-black"> Pay</div>
                        <div className="h-8 bg-white border border-gray-200 rounded px-2 flex items-center justify-center font-bold text-xs text-gray-700">G Pay</div>
                    </div>
                </div>
            </div>
        </footer>
    );
}