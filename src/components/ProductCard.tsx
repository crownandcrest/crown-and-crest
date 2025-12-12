import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Star, StarHalf } from "lucide-react";

// Extended type to support your existing data + new design requirements
type P = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency?: string; // Made optional to be safe
  images: string[];
  // New optional fields for the design
  rating?: number;
  originalPrice?: number;
  discountPercentage?: number;
};

export default function ProductCard({ p }: { p: P }) {
  
  // Helper to render stars (Max 5)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-4 h-4 text-[#FFC633] fill-current" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} className="w-4 h-4 text-[#FFC633] fill-current" />);
      }
    }
    return stars;
  };

  return (
    <Link href={`/product/${p.slug}`} className="flex flex-col gap-3 group cursor-pointer">
      
      {/* Image Container - Matching PDF Design [cite: 17] */}
      {/* Light grey background, rounded corners, aspect square */}
      <div className="w-full aspect-square bg-[#F0EEED] rounded-[20px] overflow-hidden relative">
        {p.images && p.images[0] ? (
           <Image 
             src={p.images[0]} 
             alt={p.title} 
             fill 
             className="object-cover group-hover:scale-110 transition-transform duration-500" 
           />
        ) : (
            // Fallback if no image
            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg md:text-xl text-black truncate capitalize font-display">
        {p.title}
      </h3>

      {/* Rating Row [cite: 24, 332] */}
      <div className="flex items-center gap-2">
        <div className="flex">
            {renderStars(p.rating || 0)} 
        </div>
        {p.rating && (
            <span className="text-sm text-gray-600">
                {p.rating}/<span className="text-gray-400">5</span>
            </span>
        )}
      </div>

      {/* Price Row [cite: 21, 22] */}
      <div className="flex items-center gap-3 text-xl md:text-2xl font-bold text-black">
        {/* Current Price */}
        <span>{p.currency || "₹"} {p.price}</span>
        
        {/* Original Price (Strikethrough) */}
        {p.originalPrice && (
            <span className="text-gray-400 line-through decoration-2 text-xl md:text-2xl font-bold">
                {p.currency || "₹"} {p.originalPrice}
            </span>
        )}

        {/* Discount Badge (Red) */}
        {p.discountPercentage && (
            <span className="text-xs font-medium text-[#FF3333] bg-[#FF3333]/10 px-3 py-1 rounded-full">
                -{p.discountPercentage}%
            </span>
        )}
      </div>
    </Link>
  );
}