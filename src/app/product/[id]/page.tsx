import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductDetailsClient from '@/components/product/ProductDetailsClient';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createServerSupabaseClient();
    const { id } = await params;

    // 1. Fetch Product + Linked Size Chart
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (
                id, size, color, stock_quantity, selling_price, cost_price
            ),
            size_chart:size_charts (
                id, name, measurements
            )
        `)
        .eq('id', id)
        .single();

    if (!product) return notFound();

    // 2. Fetch User's Measurements (if logged in)
    const { data: { user } } = await supabase.auth.getUser();
    let userProfiles = [];

    if (user) {
        const { data: measurements } = await supabase
            .from('user_measurements')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });
        
        if (measurements) userProfiles = measurements;
    }

    // 3. Fetch Related Products
    const { data: related } = await supabase
        .from('products')
        .select('*, product_variants(selling_price)')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4);

    return (
        <ProductDetailsClient 
            product={product} 
            relatedProducts={related || []} 
            sizeChart={product.size_chart} 
            userProfiles={userProfiles}
        />
    );
}