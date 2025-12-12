"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ productId, onSuccess }: { productId: string, onSuccess?: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      router.refresh(); // Default behavior
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login to write a review.");
      router.push("/login");
      return;
    }

    if (rating === 0) {
      alert("Please select a star rating.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      comment,
    });

    if (error) {
      alert("Error submitting review: " + error.message);
    } else {
      setRating(0);
      setComment("");
      alert("Review submitted!");
      handleSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
      <h3 className="font-bold text-lg mb-4">Write a Review</h3>
      
      {/* Star Rating Input */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-black transition"
        placeholder="Share your thoughts on the product..."
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition"
      >
        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
        Submit Review
      </button>
    </form>
  );
}