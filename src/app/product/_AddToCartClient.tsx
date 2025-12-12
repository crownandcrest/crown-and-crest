// src/app/product/_AddToCartClient.tsx
"use client";
import React from "react";
import { useCart } from "../../lib/cart";

export default function AddToCart({ product }: { product: any }) {
  const handleAddToCart = () => {
    const productToAdd = {
      ...product,
      images: product.images || [],
    };
    addToCart(productToAdd, 1);
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
