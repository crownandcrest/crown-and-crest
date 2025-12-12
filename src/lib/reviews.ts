import { createClient } from "@/lib/supabase/client";

export async function checkReviewEligibility(userId: string, productId: string) {
  const supabase = createClient();

  // 1. Calculate the date 2 days ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // 2. Check for a valid purchase
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      order_items!inner(product_id) 
    `)
    .eq('user_id', userId) // Must belong to user
    .eq('order_items.product_id', productId) // Must contain the product
    .lt('created_at', twoDaysAgo.toISOString()) // Must be older than 2 days
    .limit(1);

  if (error) {
    console.error("Eligibility Check Error:", error);
    return false;
  }

  // 3. Check if they already reviewed it (Optional: Prevent duplicate reviews)
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  // Eligible if they bought it AND haven't reviewed it yet
  return orders && orders.length > 0 && !existingReview;
}