import { supabaseServer } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/types/product'

export const dynamic = 'force-dynamic'

export default async function ShopPage() {
  const { data: products, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="p-6">Failed to load products</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Shop</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
