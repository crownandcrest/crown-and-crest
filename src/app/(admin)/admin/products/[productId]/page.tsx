'use client'

import { use, useEffect, useState } from 'react'
import ProductForm from '@/components/admin/products/ProductForm'

export default function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
    // In React 19/Next 15+, params is a promise we need to unwrap
    const { productId } = use(params)
    const [isLoading, setIsLoading] = useState(true)
    const [productData, setProductData] = useState<any>(null)

    useEffect(() => {
        const fetchProduct = async () => {
            const { supabase } = await import('@/lib/supabase/client')
            // supabase is the client instance

            // Fetch product
            const { data: product, error: prodError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single()

            if (prodError || !product) {
                console.error('Error fetching product:', prodError)
                return
            }

            // Fetch variants
            const { data: variants, error: varError } = await supabase
                .from('variants')
                .select('*')
                .eq('product_id', productId)

            if (varError) {
                console.error('Error fetching variants:', varError)
                return
            }

            // Transform for Form
            // Unique options
            const uniqueSizes = Array.from(new Set(variants?.map(v => v.size).filter(Boolean))) as string[]
            const uniqueColors = Array.from(new Set(variants?.map(v => v.color).filter(Boolean))) as string[]

            const options = []
            if (uniqueSizes.length > 0) options.push({ id: crypto.randomUUID(), name: 'Size', values: uniqueSizes })
            if (uniqueColors.length > 0) options.push({ id: crypto.randomUUID(), name: 'Color', values: uniqueColors })

            const transformedVariants = variants?.map(v => ({
                id: v.id,
                title: `${v.size || ''} / ${v.color || ''}`,
                price: v.price_override || product.base_price,
                stock: v.stock_quantity,
                sku: v.sku,
                images: v.images || [],
                options: {
                    ...(v.size && { Size: v.size }),
                    ...(v.color && { Color: v.color })
                }
            })) || []

            // Ensure images have IDs (migrated data might not)
            const images = (product.images || []).map((img: any) => ({
                id: img.id || crypto.randomUUID(),
                url: img.url,
                isPrimary: img.isPrimary || false
            }))

            console.log('Fetched product data:', { product, variants, images })

            setProductData({
                id: product.id,
                title: product.name,
                description: product.description,
                price: product.base_price,
                images,
                variants: transformedVariants,
                options
            })
            setIsLoading(false)
        }

        fetchProduct()
    }, [productId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return <ProductForm initialData={productData} isEditing={true} />
}
