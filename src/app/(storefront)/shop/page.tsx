import { supabaseServer } from '@/lib/supabase/server'
import { Metadata } from 'next'
import ShopClient from './ShopClient'

export const metadata: Metadata = {
    title: 'Shop | Crown & Crest',
    description: 'Browse our premium collection of fashion and accessories',
}

export const revalidate = 1800 // 30 minutes ISR

interface Product {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
    is_out_of_stock?: boolean
}

interface SearchParams {
    category?: string | string[]
    sort?: string
    minPrice?: string
    maxPrice?: string
    size?: string
}

async function getProducts(searchParams: SearchParams) {
    // Determine if we need to filter by size (requires inner join on variants)
    const filterBySize = !!searchParams.size

    // Build the select string
    let selectString = 'id, name, slug, base_price, image_url, category'

    if (filterBySize) {
        selectString += ', variants!inner(size)'
    }

    let query = supabaseServer
        .from('products')
        .select(selectString)
    // .eq('is_active', true)
    // .eq('published', true)

    // 1. Category Filter
    if (searchParams.category) {
        const categories = Array.isArray(searchParams.category)
            ? searchParams.category
            : searchParams.category.split(',')
        query = query.in('category', categories)
    }

    // 2. Price Filter
    if (searchParams.minPrice) {
        query = query.gte('base_price', Number(searchParams.minPrice))
    }
    if (searchParams.maxPrice) {
        query = query.lte('base_price', Number(searchParams.maxPrice))
    }

    // 3. Size Filter
    if (searchParams.size) {
        // Filter by size column in variants table
        query = query.eq('variants.size', searchParams.size)
    }

    // 4. Sorting
    switch (searchParams.sort) {
        case 'price_asc':
            query = query.order('base_price', { ascending: true })
            break
        case 'price_desc':
            query = query.order('base_price', { ascending: false })
            break
        case 'newest':
            query = query.order('created_at', { ascending: false })
            break
        default: // 'recommended'
            query = query.order('created_at', { ascending: false })
            break
    }

    // execute
    const { data: products, error } = await query.limit(50)

    if (error) {
        console.error('Failed to fetch filtered products details:', JSON.stringify(error, null, 2))
        return []
    }

    // Get stock flags for all products
    interface ProductBasic {
        id: string
        name: string
        slug: string
        base_price: number
        image_url: string | null
        category: string | null
    }
    interface StockFlag {
        product_id: string
        is_out_of_stock: boolean
    }

    if (!products) {
        return []
    }

    const productIds = (products as unknown as ProductBasic[]).map((p) => p.id)
    const stockFlagsMap = new Map<string, boolean>()

    if (productIds.length > 0) {
        const { data: stockFlags, error: stockError } = await supabaseServer
            .rpc('get_product_stock_flags', { product_ids: productIds })

        if (!stockError && stockFlags) {
            stockFlags.forEach((sf: StockFlag) => {
                stockFlagsMap.set(sf.product_id, sf.is_out_of_stock)
            })
        } else {
            console.error('Error fetching product stock flags:', stockError)
        }
    }

    // Map to Product interface with stock flags
    return (products as unknown as ProductBasic[]).map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        base_price: p.base_price,
        image_url: p.image_url,
        category: p.category,
        is_out_of_stock: stockFlagsMap.get(p.id) ?? false
    })) as Product[]
}

export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>
}) {
    // Next.js 15+ searchParams is a promise
    const params = await searchParams
    const products = await getProducts(params)

    return <ShopClient initialProducts={products} />
}
