'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase/server'
import type { CartItem } from '@/types/cart'

/* =========================
   AUTH HELPER
========================= */
async function getUserUid(): Promise<string> {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  if (!session?.value) {
    throw new Error('Unauthorized')
  }

  return session.value
}

/* =========================
   GET CART
========================= */
export async function getCart(): Promise<CartItem[]> {
  const uid = await getUserUid()

  const { data, error } = await supabaseServer
    .from('cart_items')
    .select(`
      id,
      quantity,
      products:product_id (
        id,
        name,
        slug,
        price,
        image_url,
        active,
        created_at
      )
    `)
    .eq('firebase_uid', uid)

  if (error || !data) {
    return []
  }

  return data
    .map((item) => {
      const product = Array.isArray(item.products)
        ? item.products[0]
        : item.products

      if (!product) return null

      return {
        id: item.id,
        quantity: item.quantity,
        products: product,
      }
    })
    .filter((item): item is CartItem => item !== null)
}


/* =========================
   ADD TO CART
========================= */
export async function addToCart(formData: FormData): Promise<void> {
  const productId = formData.get('productId') as string
  const uid = await getUserUid()

  if (!productId) {
    throw new Error('Invalid product')
  }

  const { error } = await supabaseServer
    .from('cart_items')
    .upsert(
      {
        firebase_uid: uid,
        product_id: productId,
        quantity: 1,
      },
      {
        onConflict: 'firebase_uid,product_id',
      }
    )

  if (error) {
    console.error('addToCart error:', error)
    throw new Error('Failed to add item to cart')
  }

  revalidatePath('/cart')
}

/* =========================
   REMOVE FROM CART
========================= */
export async function removeFromCart(formData: FormData): Promise<void> {
  const cartItemId = formData.get('cartItemId') as string
  const uid = await getUserUid()

  if (!cartItemId) {
    throw new Error('Invalid cart item')
  }

  const { error } = await supabaseServer
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('firebase_uid', uid)

  if (error) {
    console.error('removeFromCart error:', error)
    throw new Error('Failed to remove item')
  }

  revalidatePath('/cart')
}
