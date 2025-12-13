// src/lib/hooks/useWishlist.ts
"use client";

// This file re-exports the hook from the context file to follow the project's architectural pattern.
import { useWishlist as useWishlistFromContext } from '@/context/WishlistContext';

export const useWishlist = () => {
    // Ensuring the hook is only used on the client side.
    if (typeof window === 'undefined') {
        // Provide a mock implementation for the server-side to prevent errors during SSR.
        return {
            wishlist: [],
            addToWishlist: () => {},
            removeFromWishlist: () => {},
            isInWishlist: () => false,
            getWishlistCount: () => 0,
        };
    }
    return useWishlistFromContext();
};
