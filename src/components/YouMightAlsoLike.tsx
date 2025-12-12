import React from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";

export default async function YouMightAlsoLike({ 
  currentProductId, 
  category 
}: { 
  currentProductId: string, 
  category: string 
}) {
  // Fetch 4 products from same category, excluding current one
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .neq("id", currentProductId) // Exclude current
    .limit(4);

  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <section className="py-16 mt-10 border-t border-gray-100">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-10 uppercase font-display">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((p) => (
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
    </section>
  );
}