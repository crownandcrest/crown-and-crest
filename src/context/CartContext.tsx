// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a Cart Item
export interface CartItem {
    productId: string;
    variantId: string;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    isCartOpen: boolean;
    toggleCart: () => void;
    addToCart: (productId: string, variantId: string, quantity: number) => void;
    removeFromCart: (productId: string, variantId: string) => void;
    updateQuantity: (productId: string, variantId: string, newQuantity: number) => void;
    getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Load Cart from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('crown_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // 2. Save Cart to LocalStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('crown_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // --- Actions ---

    const toggleCart = () => setIsCartOpen(prev => !prev);

    const addToCart = (productId: string, variantId: string, quantity: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === productId && item.variantId === variantId);
            if (existing) {
                // If item exists, increase quantity
                return prev.map(item => 
                    item.productId === productId && item.variantId === variantId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            // Else, add new item
            return [...prev, { productId, variantId, quantity }];
        });
        setIsCartOpen(true); // Auto-open drawer
    };

    const removeFromCart = (productId: string, variantId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId || item.variantId !== variantId));
    };

    const updateQuantity = (productId: string, variantId: string, newQuantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId && item.variantId === variantId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const getCartCount = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    return (
        <CartContext.Provider value={{ 
            cart, isCartOpen, toggleCart, addToCart, removeFromCart, updateQuantity, getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

// Custom Hook to use the Cart
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};