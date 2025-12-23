import { supabaseServer } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

export const metadata = {
  title: 'Lumière - Premium Fashion',
  description: 'Discover our curated collection of premium fashion and accessories',
}

export const revalidate = 1800 // 30 minutes

interface Product {
  id: string
  name: string
  slug: string
  base_price: number
  image_url: string | null
  category: string | null
}

async function getNewArrivals() {
  const { data } = await supabaseServer
    .from('products')
    .select('id, name, slug, base_price, image_url, category')
    .eq('active', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return (data || []) as Product[]
}

async function getBestsellers() {
  const { data } = await supabaseServer
    .from('products')
    .select('id, name, slug, base_price, image_url, category')
    .eq('active', true)
    .eq('published', true)
    .limit(3)

  return (data || []) as Product[]
}

export default async function HomePage() {
  const [newArrivals, bestsellers] = await Promise.all([
    getNewArrivals(),
    getBestsellers(),
  ])

  return <HomeClient newArrivals={newArrivals} bestsellers={bestsellers} />
}
