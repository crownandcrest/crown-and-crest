// src/lib/hooks/useWishlist.ts
"use client";

import { useWishlist as useWishlistFromContext } from '@/context/WishlistContext';

export const useWishlist = () => {
    try {
        return useWishlistFromContext();
    } catch {
        // This will happen on the server, so we provide a mock implementation.
        return {
            wishlist: [],
            addToWishlist: () => {},
            removeFromWishlist: () => {},
            isInWishlist: () => false,
            getWishlistCount: () => 0,
        };
    }
};
