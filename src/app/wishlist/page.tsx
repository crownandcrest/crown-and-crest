"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Wishlist
  useEffect(() => {
    async function fetchWishlist() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
         window.location.href = "/login";
         return;
      }

      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setItems(data);
      setLoading(false);
    }
    fetchWishlist();
  }, []);

  const removeItem = async (id: string) => {
    // Optimistic UI Update (Remove from screen immediately)
    setItems(items.filter(item => item.id !== id));
    
    // Remove from DB
    await supabase.from("wishlist").delete().eq("id", id);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-8 uppercase">My Wishlist ({items.length})</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-400">Your wishlist is empty</h2>
            <Link href="/shop" className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-xl font-bold">
                Go Shopping
            </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const product = item.product_data;
            return (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-xl bg-white shadow-sm">
                
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg relative overflow-hidden">
                   {product.image && (
                      <Image 
                        src={product.image} 
                        alt={product.title} 
                        fill 
                        className="object-cover"
                      />
                   )}
                </div>

                {/* Details */}
                <div className="flex-1">
                    <h3 className="font-bold text-lg">{product.title}</h3>
                    <p className="text-gray-500">₹{product.price}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button 
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <Link 
                        href={`/shop/${item.product_id}`}
                        className="p-3 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}