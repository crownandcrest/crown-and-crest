import { supabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { addToCart } from '@/lib/cart/actions'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: PageProps) {
  // ✅ NEXT.JS 16 FIX
  const { slug } = await params

  const { data: product, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    return <div className="p-6">Product not found</div>
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  return (
    <div className="p-6 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
      {/* IMAGE */}
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-96 object-cover rounded"
      />

      {/* DETAILS */}
      <div>
        <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
        <p className="text-xl mb-6">₹{product.price}</p>

        {!session ? (
          <a
            href="/auth/login"
            className="inline-block bg-black text-white px-6 py-3 rounded"
          >
            Login to Add to Cart
          </a>
        ) : (
          <form action={addToCart}>
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded"
            >
              Add to Cart
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
