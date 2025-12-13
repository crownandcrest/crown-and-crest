// src/lib/hooks/useWishlistDetails.ts
"use client";

import { useWishlist } from '@/context/WishlistContext';
import products from '@/data/products.json';
import { useMemo } from 'react';

export interface DetailedWishlistItem {
    productId: string;
    // Product details
    name: string;
    price: number;
    image: string;
}

export function useWishlistDetails() {
    const { wishlist, ...rest } = useWishlist();

    const detailedWishlist = useMemo(() => {
        return wishlist.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                return null;
            }

            return {
                ...item,
                name: product.title,
                price: product.price,
                image: product.images[0], // Assuming the first image is the main one
            };
        }).filter((item): item is DetailedWishlistItem => item !== null);
    }, [wishlist]);

    return {
        ...rest,
        wishlist: detailedWishlist,
    };
}