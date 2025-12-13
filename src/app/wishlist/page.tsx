// src/app/wishlist/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { XCircle, HeartOff } from "lucide-react";
import { useWishlistDetails } from "@/lib/hooks/useWishlistDetails";
import { useWishlist } from "@/lib/hooks/useWishlist";

export default function WishlistPage() {
    const { wishlist: detailedWishlist } = useWishlistDetails();
    const { removeFromWishlist } = useWishlist();

    return (
        <div className="container mx-auto px-4 py-10 min-h-screen">
            <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>

            {detailedWishlist.length === 0 ? (
                <div className="text-center py-20">
                    <HeartOff className="mx-auto h-24 w-24 text-gray-400" />
                    <p className="mt-4 text-xl text-gray-600">Your wishlist is empty.</p>
                    <p className="mt-2 text-gray-500">Add items you love to your wishlist to easily find them later.</p>
                    <Link href="/shop" className="mt-6 inline-block bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {detailedWishlist.map((item) => (
                        <div key={item.productId} className="relative bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden group">
                            <button
                                onClick={() => removeFromWishlist(item.productId)}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-600 hover:text-red-500 hover:scale-110 transition-all z-10"
                                aria-label="Remove from wishlist"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>

                            <Link href={`/product/${item.productId}`} className="block">
                                <div className="relative w-full aspect-square overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold truncate">{item.name}</h2>
                                    <p className="text-gray-800 font-bold mt-1">₹{item.price.toLocaleString()}</p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}