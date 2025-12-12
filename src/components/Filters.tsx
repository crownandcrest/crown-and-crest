"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronUp, SlidersHorizontal } from "lucide-react";

const CATEGORIES = ["T-shirts", "Shorts", "Shirts", "Hoodie", "Jeans"];
const COLORS = [
  "bg-green-500", "bg-red-500", "bg-yellow-400", "bg-orange-500",
  "bg-cyan-400", "bg-blue-600", "bg-purple-600", "bg-pink-500",
  "bg-white border", "bg-black"
];
const SIZES = ["XX-Small", "X-Small", "Small", "Medium", "Large", "X-Large", "XX-Large", "3X-Large", "4X-Large"];
const STYLES = ["Casual", "Formal", "Party", "Gym"];

export default function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get("min_price") || "0"),
    parseInt(searchParams.get("max_price") || "500")
  ]);
  const [selectedColor, setSelectedColor] = useState(searchParams.get("color") || "");
  const [selectedSize, setSelectedSize] = useState(searchParams.get("size") || "");

  const handleApplyFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.set("min_price", priceRange[0].toString());
    params.set("max_price", priceRange[1].toString());
    if (selectedColor) {
      params.set("color", selectedColor);
    } else {
      params.delete("color");
    }
    if (selectedSize) {
      params.set("size", selectedSize);
    } else {
      params.delete("size");
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="border border-gray-200 rounded-[20px] p-6 min-w-[295px]">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-6">
        <h3 className="font-bold text-xl flex items-center gap-2">Filters</h3>
        <SlidersHorizontal className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex flex-col gap-4 text-gray-600 border-b border-gray-200 pb-6 mb-6">
        {CATEGORIES.map((cat) => (
          <div key={cat} className="flex justify-between items-center cursor-pointer hover:text-black">
            <span>{cat}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        ))}
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">Price</h4>
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="500"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
          />
          <div className="flex justify-between text-sm font-medium mt-2">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">Colors</h4>
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedColor(color)}
              className={`w-9 h-9 rounded-full cursor-pointer border-2 ${color} ${selectedColor === color ? 'border-black opacity-100' : 'border-transparent opacity-80'}`}
            />
          ))}
        </div>
      </div>

      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">Size</h4>
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${selectedSize === size ? 'bg-black text-white' : 'bg-[#F0F0F0] text-gray-600 hover:bg-gray-200'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg">Dress Style</h4>
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-4 text-gray-600">
          {STYLES.map((style) => (
            <div key={style} className="flex justify-between items-center cursor-pointer hover:text-black">
              <span>{style}</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleApplyFilter} className="w-full bg-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors">
        Apply Filter
      </button>
    </div>
  );
}