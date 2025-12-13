// src/context/WishlistContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a Wishlist Item
export interface WishlistItem {
    productId: string;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (productId: string) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    getWishlistCount: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Wishlist from LocalStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('crown_wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error("Failed to parse wishlist", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Save Wishlist to LocalStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('crown_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isLoaded]);

    // --- Actions ---

    const addToWishlist = (productId: string) => {
        setWishlist(prev => {
            if (!prev.some(item => item.productId === productId)) {
                return [...prev, { productId }];
            }
            return prev;
        });
    };

    const removeFromWishlist = (productId: string) => {
        setWishlist(prev => prev.filter(item => item.productId !== productId));
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(item => item.productId === productId);
    };

    const getWishlistCount = () => {
        return wishlist.length;
    }

    return (
        <WishlistContext.Provider value={{ 
            wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

// Custom Hook to use the Wishlist
export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
    return context;
};
