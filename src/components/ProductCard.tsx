'use client'

import Link from 'next/link'
import type { Product } from '@/types/product'

type Props = {
  product: Product
}

export default function ProductCard({ product }: Props) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="border rounded p-3 hover:shadow"
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-48 object-cover mb-3"
      />

      <h3 className="text-sm font-medium">{product.name}</h3>
      <p className="text-sm mt-1">₹{product.price}</p>
    </Link>
  )
}
