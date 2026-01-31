import { supabaseServer } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopClient from '../ShopClient'

interface Props {
    params: Promise<{ category: string }>
    searchParams: Promise<{
        sort?: string
        minPrice?: string
        maxPrice?: string
        size?: string
    }>
}

interface Product {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
    is_out_of_stock?: boolean
}

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    meta_title: string | null
    meta_description: string | null
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabaseServer
        .from('categories')
        .select('id, name, slug, description, meta_title, meta_description')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    if (error || !data) {
        console.error('Category not found:', slug, error)
        return null
    }

    return data as Category
}

async function getProductsByCategory(categoryId: string, searchParams: Awaited<Props['searchParams']>) {
    // Build query
    let query

    // Size filter requires join - rebuild query separately
    if (searchParams.size) {
        query = supabaseServer
            .from('products')
            .select('id, name, slug, base_price, image_url, category, product_variants!inner(size)')
            .eq('category_id', categoryId)
            .eq('product_variants.size', searchParams.size)

        // Apply price filters
        if (searchParams.minPrice) {
            query = query.gte('base_price', Number(searchParams.minPrice))
        }
        if (searchParams.maxPrice) {
            query = query.lte('base_price', Number(searchParams.maxPrice))
        }
    } else {
        // Standard query without size filter
        query = supabaseServer
            .from('products')
            .select('id, name, slug, base_price, image_url, category')
            .eq('category_id', categoryId)

        // Filters
        if (searchParams.minPrice) {
            query = query.gte('base_price', Number(searchParams.minPrice))
        }
        if (searchParams.maxPrice) {
            query = query.lte('base_price', Number(searchParams.maxPrice))
        }
    }

    // Sorting
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
        default:
            query = query.order('created_at', { ascending: false })
            break
    }

    const { data: products, error } = await query.limit(50)

    if (error) {
        console.error('Failed to fetch products for category:', error)
        return []
    }

    if (!products) return []

    // Get stock flags
    const productIds = products.map((p: any) => p.id)
    const stockFlagsMap = new Map<string, boolean>()

    if (productIds.length > 0) {
        const { data: stockFlags } = await supabaseServer
            .rpc('get_product_stock_flags', { product_ids: productIds })

        if (stockFlags) {
            stockFlags.forEach((sf: { product_id: string; is_out_of_stock: boolean }) => {
                stockFlagsMap.set(sf.product_id, sf.is_out_of_stock)
            })
        }
    }

    // Map products, stripping out variant data if present from size filter
    return products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        base_price: p.base_price,
        image_url: p.image_url,
        category: p.category,
        is_out_of_stock: stockFlagsMap.get(p.id) ?? false
    })) as Product[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { category: categorySlug } = await params
    const category = await getCategoryBySlug(categorySlug)

    if (!category) {
        return {
            title: 'Category Not Found | Crown & Crest'
        }
    }

    return {
        title: category.meta_title || `${category.name} | Crown & Crest`,
        description: category.meta_description || `Shop our ${category.name} collection at Crown & Crest`,
    }
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const { category: categorySlug } = await params
    const filters = await searchParams

    const category = await getCategoryBySlug(categorySlug)

    if (!category) {
        notFound()
    }

    const products = await getProductsByCategory(category.id, filters)

    return (
        <div>
            {/* Category Hero Section */}
            <div className="bg-gray-50 py-12 px-4 md:px-8 mb-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-display text-gray-900 mb-4">
                        {category.name}
                    </h1>
                    {category.description && (
                        <p className="text-lg text-gray-600 max-w-2xl">
                            {category.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Products Grid */}
            <ShopClient
                initialProducts={products}
                categoryName={category.name}
            />
        </div>
    )
}

// Generate static params for known categories (optional, for SSG)
export async function generateStaticParams() {
    const { data: categories } = await supabaseServer
        .from('categories')
        .select('slug')
        .eq('is_active', true)
        .limit(20)

    if (!categories) return []

    return categories.map((cat: { slug: string }) => ({
        category: cat.slug
    }))
}

export const revalidate = 1800 // 30 minutes ISR
