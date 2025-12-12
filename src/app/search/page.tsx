"use client";
import React, { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase"; 
import Filters from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images: string[] | null;
  category?: string;
  stock?: number;
  discount_percentage?: number | null;
  rating?: number | null;
};

type RpcParams = {
  query_text: string;
  limit_rows: number;
  offset_rows: number;
  category_filter: string | null;
  min_price: number | null;
  max_price: number | null;
};

function SearchContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);

      if (!searchParams) {
        setLoading(false);
        return;
      }

      const q = searchParams.get("q") || "";
      const category = searchParams.get("category") || null;
      
      const paramMin = searchParams.get("min_price");
      const min = paramMin ? Number(paramMin) : null;
      
      const paramMax = searchParams.get("max_price");
      const max = paramMax ? Number(paramMax) : null;

      const sort = searchParams.get("sort") || "relevance";
      const pageStr = searchParams.get("page");
      const page = pageStr ? Math.max(1, Number(pageStr)) : 1;
      
      const pageSize = 12;
      const offset = (page - 1) * pageSize;

      let fetchedProducts: Product[] = [];
      let fetchedCount = 0;

      try {
        if (q) {
          const rpcArgs: RpcParams = {
            query_text: q,
            limit_rows: pageSize,
            offset_rows: offset,
            category_filter: category,
            min_price: min,
            max_price: max,
          };
    
          const { data: rows, error: rowsErr } = await supabase.rpc("search_products_extended", rpcArgs);
          if (rowsErr) throw rowsErr;
          
          fetchedProducts = (rows as unknown as Product[]) || [];
    
          const { data: countData, error: countErr } = await supabase.rpc("search_products_extended_count", {
            query_text: q,
            category_filter: category,
            min_price: min,
            max_price: max,
          });
          if (countErr) throw countErr;
          fetchedCount = Number(countData ?? 0);

        } else {
          let query = supabase
            .from("products")
            .select("id, slug, title, description, price, currency, images, category, stock, discount_percentage, rating", { count: 'exact' });

          if (category) query = query.eq("category", category);
          if (min !== null) query = query.gte("price", min);
          if (max !== null) query = query.lte("price", max);

          if (sort === "price_asc") query = query.order("price", { ascending: true });
          else if (sort === "price_desc") query = query.order("price", { ascending: false });
          else if (sort === "rating") query = query.order("rating", { ascending: false });
          else query = query.order("created_at", { ascending: false });

          const { data, error, count } = await query.range(offset, offset + pageSize - 1);
          
          if (error) throw error;
          fetchedProducts = (data as unknown as Product[]) || [];
          fetchedCount = Number(count ?? 0);
        }
      } catch (err: any) {
        console.error("Search error:", err);
        fetchedProducts = [];
        fetchedCount = 0;
      } finally {
        setProducts(fetchedProducts);
        setTotalCount(fetchedCount);
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams]);

  const currentPage = searchParams?.get("page") ? Math.max(1, Number(searchParams?.get("page"))) : 1;
  const totalPages = Math.ceil(totalCount / 12);

  const getPageLink = (pageNum: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set('page', pageNum.toString());
    return `/search?${params.toString()}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="hidden lg:block w-[295px] flex-shrink-0">
        <Filters />
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-end mb-6">
           <h1 className="text-3xl font-bold capitalize">
             {searchParams?.get('q') ? `Results for "${searchParams?.get('q')}"` : "Search Results"}
           </h1>
           <div className="text-sm text-gray-500">
              Showing {products.length} of {totalCount} Products
           </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading products...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
            {products.length > 0 ? (
              products.map((p) => {
                const hasDiscount = p.discount_percentage !== null && p.discount_percentage !== undefined && p.discount_percentage > 0;
                const safeRating = p.rating !== null && p.rating !== undefined ? Number(p.rating) : 0;
                const safeImages = p.images && p.images.length > 0 ? p.images : ["/images/placeholder.png"];

                return (
                  <ProductCard key={p.id} p={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    price: p.price,
                    currency: p.currency || "₹",
                    images: safeImages,
                    rating: safeRating,
                    originalPrice: hasDiscount 
                      ? Math.round(p.price / (1 - (p.discount_percentage! / 100))) 
                      : undefined,
                    discountPercentage: hasDiscount ? p.discount_percentage! : undefined
                  }} />
                );
              })
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                No products found matching your search.
              </div>
            )}
          </div>
        )}

        {totalCount > 12 && (
          <div className="flex justify-center mt-8 gap-2">
            {currentPage > 1 && (
              <Link href={getPageLink(currentPage - 1)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Previous
              </Link>
            )}
            <span className="px-4 py-2 text-gray-500">Page {currentPage} of {totalPages}</span>
            {currentPage < totalPages && (
              <Link href={getPageLink(currentPage + 1)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 md:px-10 py-8 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <span>Home</span><ChevronRight className="w-4 h-4" /><span>Search</span>
      </div>
      <Suspense fallback={<div>Loading search results...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}