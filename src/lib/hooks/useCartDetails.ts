// src/lib/hooks/useCartDetails.ts
"use client";

import { useCart } from '@/context/CartContext';
import products from '@/data/products.json';
import { useMemo } from 'react';

export interface DetailedCartItem {
    productId: string;
    variantId: string;
    quantity: number;
    // Product details
    name: string;
    price: number;
    image: string;
    // Variant details (assuming they will be added later)
    size?: string;
    color?: string;
}

export function useCartDetails() {
    const { cart, ...rest } = useCart();

    const detailedCart = useMemo(() => {
        return cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                // This should not happen if data is consistent
                // You might want to handle this case, e.g., by removing the item from the cart
                return null;
            }

            // For now, variantId is the same as productId.
            // This can be extended when variants are introduced.
            return {
                ...item,
                name: product.title,
                price: product.price,
                image: product.images[0], // Assuming the first image is the main one
            };
        }).filter((item): item is DetailedCartItem => item !== null);
    }, [cart]);

    const cartTotal = useMemo(() => {
        return detailedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [detailedCart]);

    return {
        ...rest,
        cart: detailedCart,
        cartTotal,
    };
}
