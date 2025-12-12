"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkReviewEligibility } from "@/lib/reviews"; // Import helper
import ReviewForm from "@/components/reviews/ReviewForm";
import { Loader2, AlertTriangle } from "lucide-react";

export default function WriteReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [productName, setProductName] = useState("");

  useEffect(() => {
    const verify = async () => {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // 2. Check Product Existence & Name
      const { data: product } = await supabase
        .from('products')
        .select('name')
        .eq('id', productId)
        .single();
        
      if (product) setProductName(product.name);

      // 3. Check Eligibility (Bought > 2 days ago)
      const isEligible = await checkReviewEligibility(user.id, productId);
      
      if (!isEligible) {
        // Redirect unauthorized users
        setTimeout(() => router.push("/shop"), 3000); // 3s delay to read message
      } else {
        setEligible(true);
      }
      setLoading(false);
    };

    verify();
  }, [productId, router]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!eligible) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-6 rounded-full mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Not Eligible for Review</h1>
        <p className="text-gray-500 max-w-md mt-2">
          You can only review products you have purchased more than 48 hours ago.
        </p>
        <p className="text-sm text-gray-400 mt-4">Redirecting you to the shop...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-20 px-6">
        <h1 className="text-3xl font-black mb-2">Write a Review</h1>
        <p className="text-gray-500 mb-8">Tell us what you think about <span className="font-bold text-black">{productName}</span></p>
        
        {/* We reuse the form component we built earlier */}
        <ReviewForm productId={productId} onSuccess={() => router.push('/account/orders')} />
    </div>
  );
}