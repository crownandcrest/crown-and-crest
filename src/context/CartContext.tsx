// src/context/CartContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a Cart Item
export interface CartItem {
    id: string; // Unique ID (product_id + variant_id)
    productId: string;
    variantId: string;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
    maxStock: number;
}

interface CartContextType {
    cart: CartItem[];
    isCartOpen: boolean;
    toggleCart: () => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    cartTotal: number;
    cartCount: number;
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

    const addToCart = (newItem: CartItem) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === newItem.id);
            if (existing) {
                // If item exists, increase quantity (check stock limit)
                return prev.map(item => 
                    item.id === newItem.id 
                        ? { ...item, quantity: Math.min(item.quantity + newItem.quantity, item.maxStock) }
                        : item
                );
            }
            // Else, add new item
            return [...prev, newItem];
        });
        setIsCartOpen(true); // Auto-open drawer
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === itemId) {
                const newQty = item.quantity + delta;
                return { ...item, quantity: Math.min(Math.max(1, newQty), item.maxStock) };
            }
            return item;
        }));
    };

    // Derived State
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, isCartOpen, toggleCart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount 
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