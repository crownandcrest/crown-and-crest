import { createServerSupabaseClient } from '@/lib/supabase/server';
import ShopClient from '@/components/shop/ShopClient';

export default async function ShopPage() {
    const supabase = await createServerSupabaseClient();
    
    // Fetch products with variants for price calculation
    const { data: products } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (
                id,
                selling_price,
                cost_price,
                size,
                color,
                stock_quantity
            )
        `)
        .order('created_at', { ascending: false });

    return <ShopClient initialProducts={products || []} />;
}