import Link from "next/link";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  discount?: number;
}

export default function ProductCard({ id, name, price, rating, image, discount }: ProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="group cursor-pointer block">
      <div className="relative aspect-[3/4] w-full bg-[#F0EEED] rounded-[20px] overflow-hidden mb-4 border border-transparent group-hover:border-gray-200 transition-all">
        {image ? (
            <Image 
                src={image} 
                alt={name} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-500" 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                No Image
            </div>
        )}
      </div>
      
      <h3 className="font-bold text-lg text-black mb-1 truncate capitalize">{name}</h3>
      
      <div className="flex items-center gap-1 mb-2">
        <div className="flex text-yellow-400 gap-0.5">
            {[...Array(Math.floor(rating))].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            {rating % 1 !== 0 && <StarHalf className="w-4 h-4 fill-current" />}
        </div>
        <span className="text-sm text-gray-500 ml-1">{rating}/5</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xl font-bold text-black">₹{price.toFixed(2)}</span>
        {discount && discount > 0 ? (
            <>
                <span className="text-xl font-bold text-gray-300 line-through">
                    ₹{Math.round(price * (1 + discount / 100))}
                </span>
                <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                    -{discount}%
                </span>
            </>
        ) : null}
      </div>
    </Link>
  );
}