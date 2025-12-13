"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";

import ProductGallery from "@/components/ProductGallery";
import VariantSelector from "@/components/VariantSelector";
import SizeChartModal from "@/components/SizeChartModal";
import AddToCartBar from "@/components/AddToCartBar";
import Reviews from "@/components/Reviews";
import { useCart } from "@/context/CartContext";
import { Product, Variant } from "@/types";

export default function ClientProductPage({ product }: { product: Product & { variants: Variant[], related: any[] } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const variant = product.variants.find((v) => v.id === variantId)!;
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const inStock = variant.stock_quantity > 0;

  const price = variant.selling_price;
  const discount = variant.cost_price && variant.cost_price > variant.selling_price ? Math.round(((variant.cost_price - variant.selling_price) / variant.cost_price) * 100) : 0;

  const onAddToCart = () => {
    const currentVariant = product.variants.find(v => v.id === variantId);
    if (currentVariant) {
        addToCart(product.id, currentVariant.id, qty);
    }
  };

  const onBuyNow = () => {
    onAddToCart();
    router.push("/checkout");
  };

  const checkPincode = () => {
    if (pincode.trim().length === 6) alert("Delivery available in 3-5 days");
    else alert("Enter valid pincode");
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="w-5 h-5 text-[#FFC633] fill-current" />);
      } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
        stars.push(<StarHalf key={i} className="w-5 h-5 text-[#FFC633] fill-current" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <ProductGallery images={product.images || []} />
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
              <div className="text-sm text-gray-600 mt-1">{product.description}</div>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center">{renderStars(5)}</div>
                <span className="text-sm text-gray-500 ml-2">(0 reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">₹{price}</div>
              {discount > 0 && (
                <>
                  <div className="text-sm text-gray-500 line-through">₹{variant.cost_price}</div>
                  <div className="text-sm font-semibold text-green-600">{discount}% OFF</div>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <VariantSelector
              variants={product.variants}
              selectedVariantId={variantId}
              onSelectVariant={(id) => {
                setVariantId(id);
                setSelectedSize(null);
              }}
              selectedSize={selectedSize}
              onSelectSize={(s) => setSelectedSize(s)}
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-lg w-fit">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100 transition">−</button>
              <div className="px-4 py-2 border-l border-r text-sm font-medium">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2 hover:bg-gray-100 transition">+</button>
            </div>

            <button onClick={() => setSizeChartOpen(true)} className="text-sm text-cc-black hover:underline font-bold">
              Size chart
            </button>
          </div>

          <div className="mt-6 hidden md:flex gap-3">
            <button
              disabled={!inStock}
              onClick={onAddToCart}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition ${
                inStock ? "bg-cc-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {inStock ? "Add to Cart" : "Out of Stock"}
            </button>
            <button
              disabled={!inStock}
              onClick={onBuyNow}
              className={`flex-1 px-6 py-3 border-2 border-cc-black text-cc-black rounded-lg font-medium transition ${
                inStock ? "hover:bg-cc-gray" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Buy Now
            </button>
          </div>

          <div className="mt-6 border-t pt-6 space-y-3 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>SKU:</span>
              <span className="font-mono text-gray-900">{variant.sku}</span>
            </div>
            <div className="flex justify-between">
              <span>Stock:</span>
              <span className={variant.stock_quantity > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                {variant.stock_quantity > 0 ? `${variant.stock_quantity} in stock` : "Out of stock"}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                maxLength={6}
                className="px-3 py-2 border rounded flex-1 text-sm"
              />
              <button
                onClick={checkPincode}
                className="px-4 py-2 border border-cc-black text-cc-black rounded hover:bg-cc-gray transition font-medium"
              >
                Check
              </button>
            </div>

            <div className="text-xs text-gray-500 pt-2">Free returns within 7 days. Exchange available.</div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Highlights</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {(product.description || "").split("\\n").map((h: string) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Material & Care</h4>
              <div className="text-sm text-gray-700">{product.name}</div>
              <div className="text-sm text-gray-500 mt-1">Machine wash</div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-900 mb-1">Special Offer</h4>
              <div className="text-sm text-green-800">Use code CROWN10 for 10% off above ₹2000</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 border-t">
        <Reviews />
      </div>

      {/* Related Products */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">You may also like</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.related.map((r) => (
            <a key={r.id} href={`/product/${r.slug}`} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                <Image src={r.image} alt={r.title} fill style={{ objectFit: "cover" }} className="group-hover:scale-105 transition" />
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 line-clamp-2">{r.title}</div>
                <div className="text-sm font-semibold text-cc-black mt-2">₹{r.price}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <AddToCartBar
        productId={product.id}
        variantId={variant.id}
        size={selectedSize}
        price={price}
        disabled={!inStock}
        onBuyNow={onBuyNow}
        slug={product.id}
        title={product.name}
        images={product.images || []}
      />

      <SizeChartModal open={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </>
  );
}
