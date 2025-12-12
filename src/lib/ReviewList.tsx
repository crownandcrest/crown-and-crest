"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import StarRating from "@/components/ui/StarRating";
import { User } from "lucide-react";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null; // Joined data
}

export default function ReviewList({ productId }: { productId: string }) {
  const supabase = createClient();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          profiles (full_name)
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        // @ts-ignore
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [productId]);

  if (loading) return <div className="text-gray-400 text-sm">Loading reviews...</div>;

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-2xl">
        <p className="text-gray-500">No reviews yet. Be the first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-bold text-sm">
                {review.profiles?.full_name || "Verified Customer"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mb-2">
            <StarRating rating={review.rating} />
          </div>
          
          <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
        </div>
      ))}
    </div>
  );
}