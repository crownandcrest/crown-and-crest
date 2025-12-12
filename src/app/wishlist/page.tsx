"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Heart, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchWishlist = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // 1. Get Wishlist IDs
      const { data: wishlistData } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);

      if (wishlistData && wishlistData.length > 0) {
        const ids = wishlistData.map(w => w.product_id);
        
        // 2. Fetch Actual Products
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .in('id', ids);
          
        setWishlistItems(products || []);
      }
      setLoading(false);
    };

    fetchWishlist();
  }, [router, supabase]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 md:px-10 py-10 min-h-[60vh]">
      <h1 className="text-3xl font-black uppercase font-display mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8 fill-red-500 text-red-500" /> My Wishlist
      </h1>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wishlistItems.map((p) => (
             <ProductCard key={p.id} p={{
                id: p.id,
                slug: p.slug,
                title: p.title,
                price: p.price,
                currency: p.currency,
                images: p.images || [],
                rating: Number(p.rating),
                originalPrice: p.discount_percentage > 0 ? Math.round(p.price / (1 - p.discount_percentage/100)) : undefined,
                discountPercentage: p.discount_percentage
             }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-[20px]">
           <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
           <button onClick={() => router.push('/shop')} className="bg-black text-white px-6 py-3 rounded-full font-bold">
              Go Shopping
           </button>
        </div>
      )}
    </div>
  );
}