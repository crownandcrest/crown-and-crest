'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'

interface ProductVariant {
  id?: string
  size?: string | null
  color?: string | null
  sku: string
  price_override?: number | null
  stock_quantity: number
  low_stock_threshold?: number
  enabled?: boolean
  position?: number
  options?: Record<string, string>
  price?: number
  stock?: number
  images?: string[]
}

export async function upsertProduct(
  productdata: Record<string, unknown>, 
  variants: ProductVariant[], 
  isEditing: boolean, 
  productId?: string
) {
    try {
        // CRITICAL: Verify admin authorization before any operation
        await requireAdmin()
        
        console.log('upsertProduct started:', { isEditing, productId })

        // 1. Upsert Product
        const { data: savedProduct, error: productError } = await supabaseAdmin
            .from('products')
            .upsert({
                ...(isEditing && productId ? { id: productId } : {}),
                ...productdata,
                // updated_at: new Date().toISOString() // Column does not exist
            })
            .select()
            .single()

        if (productError) {
            console.error('Error saving product:', productError)
            throw new Error(`Product Save Failed: ${productError.message}`)
        }

        if (!savedProduct) throw new Error('Product saved but no data returned')

        const finalProductId = savedProduct.id

        // 2. Handle Variants
        // For simplicity in Admin, we can delete existing and re-insert, or upsert.
        // Re-insert is safer for sync if we want to remove deleted variants.
        
        if (variants && variants.length > 0) {
            // Transform variants for DB
            const variantsToInsert = variants.map(v => {
                const options = v.options || {}
                const sizeKey = Object.keys(options).find(k => k.toLowerCase() === 'size')
                const colorKey = Object.keys(options).find(k => k.toLowerCase() === 'color')

                const size = sizeKey ? options[sizeKey] : null
                const color = colorKey ? options[colorKey] : null

                // Auto-generate SKU if missing
                let sku = v.sku
                if (!sku || sku.trim() === '') {
                    const parts = [savedProduct.slug]
                    if (size) parts.push(size)
                    if (color) parts.push(color)
                    
                    // Fallback randomness if no options to distinguish
                    if (!size && !color) {
                        parts.push(Math.random().toString(36).substring(2, 6))
                    }
                    
                    sku = parts.join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '')
                }

                const mappedVariant = {
                    product_id: finalProductId,
                    size,
                    color,
                    stock_quantity: v.stock || 0,
                    price_override: v.price === savedProduct.base_price ? null : v.price,
                    sku,
                    enabled: true,
                    images: v.images || [], // Variant images from form
                }
                return mappedVariant
            })

            // Deduplicate variants to avoid unique constraint violations
            const uniqueVariants = new Map();
            for (const v of variantsToInsert) {
                const key = `${v.size || 'null'}-${v.color || 'null'}`;
                if (!uniqueVariants.has(key)) {
                    uniqueVariants.set(key, v);
                }
            }
            const finalVariantsToInsert = Array.from(uniqueVariants.values());

            // UPSERT variants to preserve IDs and avoid unique constraint violations
            // We match using the unique index on (product_id, size, COALESCE(color, ''))
            // Note: Supabase upsert doesn't support complex expressions, so we'll use a different approach
            
            // First, fetch existing variants for this product
            const { data: existingVariants } = await supabaseAdmin
                .from('variants')
                .select('id, product_id, size, color')
                .eq('product_id', finalProductId)

            const existingMap = new Map();
            if (existingVariants) {
                for (const v of existingVariants) {
                    const key = `${v.size || 'null'}-${v.color || ''}`;
                    existingMap.set(key, v.id);
                }
            }

            // Add IDs to matching variants for update, leave new ones without ID for insert
            const variantsToUpsert = finalVariantsToInsert.map(v => {
                const key = `${v.size || 'null'}-${v.color || ''}`;
                const existingId = existingMap.get(key);
                if (existingId) {
                    return { ...v, id: existingId }; // Update existing
                }
                return v; // Insert new
            });

            // Split into updates and inserts
            const variantsToUpdate = variantsToUpsert.filter(v => v.id)
            const newVariants = variantsToUpsert.filter(v => !v.id)

            // Update existing variants
            if (variantsToUpdate.length > 0) {
                const { error: updateError } = await supabaseAdmin
                    .from('variants')
                    .upsert(variantsToUpdate)

                if (updateError) {
                    console.error('Error updating variants:', updateError)
                    throw new Error(`Variant Update Failed: ${updateError.message}`)
                }
            }

            // Insert new variants
            if (newVariants.length > 0) {
                const { error: insertError } = await supabaseAdmin
                    .from('variants')
                    .insert(newVariants)

                if (insertError) {
                    console.error('Error inserting variants:', insertError)
                    throw new Error(`Variant Insert Failed: ${insertError.message}`)
                }
            }
        }

        revalidatePath('/admin/products')
        revalidatePath(`/admin/products/${finalProductId}`)
        revalidatePath('/shop')
        
        return { success: true, productId: finalProductId }
    } catch (error: unknown) {
        console.error('upsertProduct exception:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return { success: false, error: errorMessage }
    }
}

// Delete one or more products
export async function deleteProducts(productIds: string[]) {
    try {
        await requireAdmin()

        // Step 1: Get all variant IDs for these products
        const { data: variants } = await supabaseAdmin
            .from('variants')
            .select('id')
            .in('product_id', productIds)

        const variantIds = variants?.map(v => v.id) || []

        // Step 2: Clean up stock_reservations first (if any variants exist)
        if (variantIds.length > 0) {
            const { error: reservationError } = await supabaseAdmin
                .from('stock_reservations')
                .delete()
                .in('variant_id', variantIds)

            if (reservationError) {
                console.error('Error deleting stock reservations:', reservationError)
                // Continue anyway - reservations might have been cleaned up by expiry
            }
        }

        // Step 3: Delete variants (variants CASCADE to cart_items, media, etc.)
        const { error: variantError } = await supabaseAdmin
            .from('variants')
            .delete()
            .in('product_id', productIds)

        if (variantError) {
            console.error('Error deleting variants:', variantError)
            throw new Error(`Failed to delete product variants: ${variantError.message}`)
        }

        // Step 4: Delete products (will CASCADE to collections_products, homepage_products, etc.)
        const { error } = await supabaseAdmin
            .from('products')
            .delete()
            .in('id', productIds)

        if (error) {
            console.error('Error deleting products:', error)
            
            // Provide user-friendly error messages
            if (error.code === '23503') { // Foreign key violation
                throw new Error('Cannot delete products that have existing orders. Please archive them instead.')
            }
            throw new Error(`Delete failed: ${error.message}`)
        }

        revalidatePath('/admin/products')
        revalidatePath('/shop')
        
        return { success: true }
    } catch (error: unknown) {
        console.error('deleteProducts exception:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return { success: false, error: errorMessage }
    }
}

// Update product status (active/draft)
export async function updateProductStatus(productIds: string[], isActive: boolean) {
    try {
        await requireAdmin()

        const { error } = await supabaseAdmin
            .from('products')
            .update({ is_active: isActive })
            .in('id', productIds)

        if (error) {
            console.error('Error updating product status:', error)
            throw new Error(`Status update failed: ${error.message}`)
        }

        revalidatePath('/admin/products')
        revalidatePath('/shop')
        
        return { success: true }
    } catch (error: unknown) {
        console.error('updateProductStatus exception:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return { success: false, error: errorMessage }
    }
}
