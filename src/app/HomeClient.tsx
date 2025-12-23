'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search, Heart, User, ShoppingBag, ChevronRight } from 'lucide-react'

interface Product {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
}

interface HomeClientProps {
    newArrivals: Product[]
    bestsellers: Product[]
}

export default function HomeClient({ newArrivals, bestsellers }: HomeClientProps) {
    return (
        <div className="min-h-screen bg-background-light">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-header">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="text-xl font-bold tracking-widest">
                            LUMIÈRE
                        </Link>

                        {/* Navigation */}
                        <nav className="hidden md:flex items-center gap-8">
                            <Link href="/shop" className="text-sm font-medium hover:text-gray-600 transition-colors">
                                NEW ARRIVALS
                            </Link>
                            <Link href="/collections" className="text-sm font-medium hover:text-gray-600 transition-colors">
                                COLLECTIONS
                            </Link>
                            <Link href="/accessories" className="text-sm font-medium hover:text-gray-600 transition-colors">
                                ACCESSORIES
                            </Link>
                            <Link href="/sale" className="text-sm font-medium text-error hover:text-red-700 transition-colors">
                                SALE
                            </Link>
                        </nav>

                        {/* Icons */}
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                            <Link href="/cart" className="p-2 hover:bg-gray-50 rounded-full transition-colors relative">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    0
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[600px] bg-gray-100 flex items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10" />
                <div className="container mx-auto px-4 relative z-20">
                    <div className="max-w-xl">
                        <div className="inline-block px-4 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                            COLLECTION 2024
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                            Urban<br />Sophistication
                        </h1>
                        <p className="text-lg text-white/90 mb-8 max-w-md">
                            Discover the new arrivals of the season<br />
                            that combine style, comfort, and modern<br />
                            silhouettes.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/shop" className="btn btn-primary">
                                SHOP COLLECTION
                            </Link>
                            <Link href="/lookbook" className="btn btn-secondary bg-white/90 backdrop-blur-sm hover:bg-white">
                                VIEW LOOKBOOK
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* New Arrivals */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
                            <p className="text-gray-600">Explore our latest collection</p>
                        </div>
                        <Link href="/shop" className="text-sm font-semibold uppercase tracking-wide hover:text-gray-600 transition-colors flex items-center gap-2">
                            VIEW ALL
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {newArrivals.length > 0 ? (
                            newArrivals.map((product) => (
                                <Link key={product.id} href={`/product/${product.slug}`} className="group">
                                    <div className="product-card mb-3 bg-gray-50">
                                        <div className="product-card-image">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                    priority
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <button className="product-card-favorite">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-sm font-semibold mb-1 line-clamp-1">{product.name}</h3>
                                    <p className="text-lg font-bold">₹{product.base_price.toLocaleString('en-IN')}</p>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-4 text-center py-12 text-gray-500">
                                No products available
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Our Bestsellers */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-wider text-gray-600 mb-2">MOST LOVED</p>
                        <h2 className="text-3xl font-bold">Our Bestsellers</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left side - Text + CTA */}
                        <div className="flex flex-col justify-center">
                            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                                Handpick the pieces and staple clothing items every woman needs for making a capsule wardrobe that is minimal yet elegant.
                            </p>
                            <Link href="/bestsellers" className="btn btn-primary w-fit">
                                SHOP BESTSELLERS
                            </Link>
                        </div>

                        {/* Right side - Product List */}
                        <div className="space-y-6">
                            {bestsellers.length > 0 ? (
                                bestsellers.map((product) => (
                                    <Link key={product.id} href={`/product/${product.slug}`} className="flex gap-4 group">
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    width={96}
                                                    height={96}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold mb-1 group-hover:text-gray-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {product.category || 'Fashion'}
                                            </p>
                                            <p className="text-lg font-bold">₹{product.base_price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No bestsellers available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop by Category */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">SHOP BY CATEGORY</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { name: 'DRESSES', image: '/images/category-dresses.jpg', href: '/category/dresses' },
                            { name: 'OUTERWEAR', image: '/images/category-outerwear.jpg', href: '/category/outerwear' },
                            { name: 'ACCESSORIES', image: '/images/category-accessories.jpg', href: '/category/accessories' },
                        ].map((category) => (
                            <Link
                                key={category.name}
                                href={category.href}
                                className="relative h-96 rounded-lg overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">Image Placeholder</span>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                    <h3 className="text-white text-2xl font-bold tracking-wide group-hover:scale-105 transition-transform">
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-primary text-white pt-16 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        {/* Brand */}
                        <div>
                            <h3 className="text-xl font-bold tracking-widest mb-4">LUMIÈRE</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Redefining modern fashion with curated collections that blend style and comfort.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="sr-only">Instagram</span>
                                    📷
                                </a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                                    <span className="sr-only">Facebook</span>
                                    📘
                                </a>
                            </div>
                        </div>

                        {/* Shop */}
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider mb-4 text-sm">SHOP</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><Link href="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
                                <li><Link href="/bestsellers" className="hover:text-white transition-colors">Bestsellers</Link></li>
                                <li><Link href="/sale" className="hover:text-white transition-colors">Sale</Link></li>
                                <li><Link href="/collections" className="hover:text-white transition-colors">Collections</Link></li>
                            </ul>
                        </div>

                        {/* Customer Care */}
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider mb-4 text-sm">CUSTOMER CARE</h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                                <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="font-semibold uppercase tracking-wider mb-4 text-sm">NEWSLETTER</h4>
                            <p className="text-sm text-gray-300 mb-4">
                                Subscribe to get special offers, free giveaways, and updates.
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-sm placeholder:text-gray-400 focus:outline-none focus:border-white/40"
                                />
                                <button className="px-6 py-2 bg-white text-primary rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                                    SUBSCRIBE
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>© 2024 Lumière. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
