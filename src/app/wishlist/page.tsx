// src/app/wishlist/page.tsx
"use client";

import { useWishlistDetails } from "@/lib/hooks/useWishlistDetails";
import Link from "next/link";
import Image from "next/image";
import { Heart, X } from "lucide-react";

export default function WishlistPage() {
    const { wishlist, removeFromWishlist } = useWishlistDetails();

    if (wishlist.length === 0) {
        return (
            <div className="text-center py-20">
                <Heart className="mx-auto w-16 h-16 text-gray-300" />
                <h1 className="mt-4 text-2xl font-bold">Your Wishlist is Empty</h1>
                <p className="mt-2 text-gray-500">
                    You haven’t added any products to your wishlist yet.
                </p>
                <Link href="/shop" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-full font-bold">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-10 py-10">
            <h1 className="text-3xl font-black uppercase mb-10">My Wishlist</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {wishlist.map(item => (
                    <div key={item.productId} className="group relative">
                        <Link href={`/product/${item.slug}`}>
                            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 mb-4">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                            <p className="text-sm font-bold">₹{item.price.toLocaleString()}</p>
                        </Link>
                        <button
                            onClick={() => removeFromWishlist(item.productId)}
                            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-black hover:text-white transition opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
