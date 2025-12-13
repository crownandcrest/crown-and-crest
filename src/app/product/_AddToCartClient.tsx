// src/app/product/_AddToCartClient.tsx
"use client";
import React from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCart({ product }: { product: any }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Assuming product has an 'id' for productId and we can use it as variantId for simplicity
    addToCart(product.id, product.id, 1);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = "/cart";
  };

  return (
    <div className="flex gap-3">
      <button onClick={handleBuyNow} className="bg-crest text-white px-4 py-2 rounded">Buy Now</button>
      <button onClick={handleAddToCart} className="border px-4 py-2 rounded">Add to Cart</button>
    </div>
  );
}
