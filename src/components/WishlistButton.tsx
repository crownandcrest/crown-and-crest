"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart } from "lucide-react";
import { Product } from "@/types";

export default function WishlistButton({ product }: { product: Product }) {
  const supabase = createClient();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Check if item is already liked on load
  useEffect(() => {
    async function checkStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("wishlist")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();

      if (data) setLiked(true);
    }
    checkStatus();
  }, [product.id]);

  // 2. Handle Click (Toggle)
  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop click from opening product page
    e.stopPropagation();
    
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please login to save items!");
      setLoading(false);
      return;
    }

    if (liked) {
      // REMOVE
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", product.id);
        
      if (!error) setLiked(false);
    } else {
      // ADD
      const { error } = await supabase
        .from("wishlist")
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_data: product // Save the whole object so we can display it later!
        });

      if (!error) setLiked(true);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleWishlist} 
      disabled={loading}
      className={`p-2 rounded-full transition-all ${liked ? "bg-red-50 text-red-500" : "bg-white/80 hover:bg-black hover:text-white text-black"}`}
    >
      <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
    </button>
  );
}