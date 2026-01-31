
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import ProductDetailClient from './ProductDetailClient'

// Revalidate every 30 minutes
export const revalidate = 1800

interface Props {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
    console.log('Fetching product for slug:', slug)
    const { data: product, error } = await supabaseServer
        .from('products')
        .select(`
id,
    name,
    slug,
    description,
    base_price,
    image_url,
    images,
    category,
    variants(
        id,
        stock_quantity,
        size,
        color,
        images
    )
        `)
        .eq('slug', slug)
        // .eq('is_active', true)
        .single()

    if (error) {
        console.error('Error fetching product:', JSON.stringify(error, null, 2))
        return null
    }

    if (!product) {
        console.error('Product not found (null data)')
        return null
    }

    // Get reservation-aware availability for all variants
    interface Variant {
        id: string
        size: string
        color: string
        stock_quantity: number
        images?: unknown
    }
    interface AvailabilityData {
        variant_id: string
        available_to_sell: number
        is_out_of_stock: boolean
    }
    const variantIds = product.variants?.map((v: Variant) => v.id) || []
    const availabilityMap = new Map<string, AvailabilityData>()

    if (variantIds.length > 0) {
        const { data: availabilityData, error: availError } = await supabaseServer
            .rpc('get_variant_availability', { variant_ids: variantIds })

        if (!availError && availabilityData) {
            availabilityData.forEach((av: AvailabilityData) => {
                availabilityMap.set(av.variant_id, av)
            })
        } else {
            console.error('Error fetching variant availability:', availError)
        }
    }

    // Transform variants with reservation-aware stock
    const transformedProduct = {
        ...product,
        product_variants: product.variants?.map((v: Variant) => {
            const availability = availabilityMap.get(v.id)
            return {
                id: v.id,
                title: `${v.size || ''} / ${v.color || ''}`,
                price: product.base_price,
                stock: v.stock_quantity,
                available_to_sell: availability?.available_to_sell ?? v.stock_quantity,
                is_out_of_stock: availability?.is_out_of_stock ?? false,
                images: Array.isArray(v.images) ? v.images as string[] : [],  // Ensure string array type
                options: { Size: v.size, Color: v.color }
            }
        }) || []
    }
    delete (transformedProduct as Record<string, unknown>).variants

    console.log('Product fetched successfully:', product.name)
    return transformedProduct
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) {
        return {
            title: 'Product Not Found',
        }
    }

    return {
        title: `${product.name} | Crown & Crest`,
        description: product.description?.substring(0, 160) || 'Premium fashion by Crown & Crest',
        openGraph: {
            images: product.image_url ? [product.image_url] : [],
        },
    }
}

interface RelatedProduct {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
}

async function getRelatedProducts(category: string | null, currentId: string): Promise<RelatedProduct[]> {
    if (!category) return []

    const { data: products } = await supabaseServer
        .from('products')
        .select('id, name, slug, base_price, image_url, category')
        .eq('category', category)
        .neq('id', currentId)
        // .eq('is_active', true) 
        .limit(4)

    return (products || []) as RelatedProduct[]
}

interface SizeChart {
    id: string
    name: string
    measurements: unknown
    fit_type: string | null
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) {
        notFound()
    }

    const relatedProducts = await getRelatedProducts(product.category, product.id)

    // Fetch size chart for recommendation engine
    let sizeChartData = null
    const { data: productSizeChart } = await supabaseServer
        .from('product_size_charts')
        .select(`
            size_chart_id,
            size_charts (
                id,
                name,
                measurements,
                fit_type
            )
        `)
        .eq('product_id', product.id)
        .single()

    if (productSizeChart && productSizeChart.size_charts) {
        sizeChartData = productSizeChart.size_charts as unknown as SizeChart
    }

    // Fetch user's sizebook (if authenticated)
    let userSizebookData = null
    let isAuthenticated = false

    const { data: { user } } = await supabaseServer.auth.getUser()
    if (user) {
        isAuthenticated = true
        const { data: sizebook } = await supabaseServer
            .from('user_sizebook')
            .select('*')
            .eq('user_uid', user.id)
            .single()

        if (sizebook) {
            userSizebookData = sizebook
        }
    }

    return (
        <ProductDetailClient
            product={product}
            relatedProducts={relatedProducts}
            sizeChart={sizeChartData}
            userSizebook={userSizebookData}
            isAuthenticated={isAuthenticated}
        />
    )
}

