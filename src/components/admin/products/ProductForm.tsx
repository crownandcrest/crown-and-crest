'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Upload, X, HelpCircle, GripVertical, Trash2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/useToast'
import { uploadProductImage } from '@/lib/cloudinary/actions'
import { upsertProduct } from '@/app/(admin)/admin/products/actions'
import VariantImageSelector from './VariantImageSelector'


type ProductOptions = {
    id: string
    name: string
    values: string[]
}

type ProductVariant = {
    id: string
    title: string
    price: number
    stock: number
    sku: string
    options: Record<string, string>
    images?: string[]
}

type ProductImage = {
    id: string
    url: string
    isPrimary?: boolean
}

type ProductFormProps = {
    initialData?: any
    isEditing?: boolean
}

export default function ProductForm({ initialData, isEditing = false }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [hasVariants, setHasVariants] = useState(isEditing ? (initialData?.variants?.length > 0) : false)

    // Form State
    const [title, setTitle] = useState(initialData?.title || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [price, setPrice] = useState(initialData?.price || '')
    const [compareAtPrice, setCompareAtPrice] = useState(initialData?.compareAtPrice || '')
    const [costPerItem, setCostPerItem] = useState(initialData?.costPerItem || '')
    const [sku, setSku] = useState(initialData?.sku || '')
    const [barcode, setBarcode] = useState(initialData?.barcode || '')

    // Images State
    const [images, setImages] = useState<ProductImage[]>(initialData?.images || [])
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Variants State
    // Variants State
    // Force Size and Color to exist
    const defaultOptions = [
        { id: crypto.randomUUID(), name: 'Size', values: [] },
        { id: crypto.randomUUID(), name: 'Color', values: [] }
    ]

    const mergedOptions = initialData?.options && initialData.options.length > 0
        ? [
            // Find existing or use default
            initialData.options.find((o: any) => o.name === 'Size') || defaultOptions[0],
            initialData.options.find((o: any) => o.name === 'Color') || defaultOptions[1]
        ]
        : defaultOptions

    const [options, setOptions] = useState<ProductOptions[]>(mergedOptions)
    const [variants, setVariants] = useState<ProductVariant[]>(initialData?.variants || [])

    // --- Image Handling Logic ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newImages: ProductImage[] = Array.from(e.target.files).map(file => ({
                id: crypto.randomUUID(),
                url: URL.createObjectURL(file), // Create local preview URL
                isPrimary: false
            }))

            // If it's the first image being added, make it primary
            if (images.length === 0 && newImages.length > 0) {
                newImages[0].isPrimary = true
            }

            setImages([...images, ...newImages])
        }
    }

    const removeImage = (id: string) => {
        const newImages = images.filter(img => img.id !== id)
        // Reassign primary if the primary image was deleted
        if (images.find(img => img.id === id)?.isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true
        }
        setImages(newImages)
    }

    const setPrimaryImage = (id: string) => {
        setImages(images.map(img => ({
            ...img,
            isPrimary: img.id === id
        })))
    }

    // --- Variants Logic ---
    useEffect(() => {
        if (!hasVariants) return

        const generateVariants = () => {
            const validOptions = options.filter(opt => opt.name && opt.values.length > 0)
            if (validOptions.length === 0) return []

            const cartesian = (sets: string[][]) => {
                return sets.reduce<string[][]>((acc, set) => {
                    return acc.flatMap(x => set.map(y => [...x, y]))
                }, [[]])
            }

            const combinations = cartesian(validOptions.map(opt => opt.values))

            return combinations.map(combo => {
                const variantOptions: Record<string, string> = {}
                validOptions.forEach((opt, idx) => {
                    variantOptions[opt.name] = combo[idx]
                })

                // Create a unique key for this combination to check for existing data
                const comboKey = combo.join(' / ')
                const existing = variants.find(v => v.title === comboKey)

                return {
                    id: existing?.id || crypto.randomUUID(),
                    title: comboKey,
                    price: existing?.price || Number(price) || 0,
                    stock: existing?.stock || 0,
                    sku: existing?.sku || '',
                    options: variantOptions
                }
            })
        }

        const newVariants = generateVariants()
        if (JSON.stringify(newVariants?.map(v => v.title)) !== JSON.stringify(variants.map(v => v.title))) {
            setVariants(newVariants || [])
        }
    }, [options, hasVariants, price])

    const addOption = () => setOptions([...options, { id: crypto.randomUUID(), name: '', values: [] }])
    const removeOption = (id: string) => setOptions(options.filter(opt => opt.id !== id))

    const updateOptionName = (id: string, name: string) => {
        setOptions(options.map(opt => opt.id === id ? { ...opt, name } : opt))
    }

    const addOptionValue = (id: string, value: string) => {
        if (!value.trim()) return
        setOptions(options.map(opt => {
            if (opt.id === id && !opt.values.includes(value.trim())) {
                return { ...opt, values: [...opt.values, value.trim()] }
            }
            return opt
        }))
    }

    const removeOptionValue = (id: string, valueToRemove: string) => {
        setOptions(options.map(opt => {
            if (opt.id === id) {
                return { ...opt, values: opt.values.filter(v => v !== valueToRemove) }
            }
            return opt
        }))
    }

    const updateVariant = (id: string, field: keyof ProductVariant, value: any) => {
        setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
    }

    const { showSuccess, showError, showLoading } = useToast()
    const router = useRouter()

    const handleSave = async () => {
        if (!title) {
            showError('Please enter a product title')
            return
        }

        setIsLoading(true)
        const toastId = showLoading('Saving product...')

        try {
            // 1. Upload new images
            const uploadedImages = await Promise.all(images.map(async (img) => {
                if (img.url.startsWith('blob:')) {
                    const file = await fetch(img.url).then(r => r.blob())
                    const formData = new FormData()
                    formData.append('file', file)

                    // Use Server Action for upload
                    const data = await uploadProductImage(formData)

                    if (!data || !data.secure_url) {
                        throw new Error('Failed to upload image')
                    }

                    return { ...img, url: data.secure_url }
                }
                return img
            }))

            // 2. Prepare Product Data
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
            const productData = {
                name: title,
                slug,
                description,
                base_price: Number(price),
                // compare_at_price: compareAtPrice ? Number(compareAtPrice) : null,
                // cost_per_item: costPerItem ? Number(costPerItem) : null,
                // sku, 
                is_active: true,
                images: uploadedImages, // JSONB array
                image_url: uploadedImages.find(i => i.isPrimary)?.url || uploadedImages[0]?.url || null
            }

            // 3. Call Server Action
            const result = await upsertProduct(productData, variants, isEditing, initialData?.id)

            if (!result.success) {
                throw new Error(result.error)
            }

            showSuccess('Product saved successfully')
            router.push('/admin/products')
            router.refresh()
        } catch (error: any) {
            console.error('Error saving product:', error)
            showError(error.message || 'Failed to save product')
        } finally {
            setIsLoading(false)
            // toast.dismiss(toastId) // useToast dismiss might be needed if showLoading doesn't auto-dismiss
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-4 z-10 bg-gray-50/80 backdrop-blur-sm p-4 -mx-4 rounded-xl border border-gray-200/50 shadow-sm transition-all">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/products"
                        className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditing ? 'Edit Product' : 'Add Product'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/products"
                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-white hover:text-gray-900 rounded-lg transition-colors border border-transparent hover:border-gray-300"
                    >
                        Discard
                    </Link>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Short Sleeve T-Shirt"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Description</label>
                            <div className="relative">
                                <textarea
                                    rows={6}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your product..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                                />
                                <div className="absolute bottom-3 right-3 flex gap-2">
                                    <button type="button" className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors text-xs font-medium px-2">
                                        ✨ AI Generate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media Handling */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">Media</label>
                            <button className="text-xs font-semibold text-primary hover:underline">Add from URL</button>
                        </div>

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {images.length === 0 ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:bg-gray-50 transition-colors cursor-pointer group text-center"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Upload className="w-5 h-5 text-gray-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img) => (
                                    <div key={img.id} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                        {/* Image Preview */}
                                        <img src={img.url} alt="Product media" className="w-full h-full object-cover" />

                                        {/* Primary Badge */}
                                        {img.isPrimary && (
                                            <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                                Primary
                                            </div>
                                        )}

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            {!img.isPrimary && (
                                                <button
                                                    onClick={() => setPrimaryImage(img.id)}
                                                    className="px-3 py-1 bg-white text-xs font-bold rounded-full hover:bg-gray-100"
                                                >
                                                    Set as Primary
                                                </button>
                                            )}
                                            <button
                                                onClick={() => removeImage(img.id)}
                                                className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                                    <span className="text-xs font-semibold text-gray-500">Add</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <label className="text-sm font-bold text-gray-700 mb-4 block">Pricing</label>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-serif">₹</span>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compare-at price</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-serif">₹</span>
                                    <input
                                        type="number"
                                        value={compareAtPrice}
                                        onChange={(e) => setCompareAtPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cost per item</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-serif">₹</span>
                                    <input
                                        type="number"
                                        value={costPerItem}
                                        onChange={(e) => setCostPerItem(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Customers won't see this</p>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <label className="text-sm font-bold text-gray-700">Inventory</label>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={(e) => setSku(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Barcode (ISBN, UPC, GTIN)</label>
                                <input
                                    type="text"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">Variants</label>
                            {!hasVariants && (
                                <button
                                    onClick={() => setHasVariants(true)}
                                    className="text-xs font-semibold text-primary hover:underline"
                                >
                                    + Add options like size or color
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {!hasVariants ? (
                                <p className="text-sm text-gray-500">
                                    This product currently has no variants. Add options to create variants.
                                </p>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Options Management */}
                                    <div className="border border-gray-200 rounded-xl p-4 space-y-4 bg-gray-50/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-sm font-bold text-gray-800">Options</h3>
                                        </div>

                                        {options.map((option, idx) => (
                                            <div key={option.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option Name</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={option.name}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm font-medium cursor-not-allowed"
                                                />
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option Values</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {option.values.map(val => (
                                                            <span key={val} className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 group">
                                                                {val}
                                                                <button onClick={() => removeOptionValue(option.id, val)} className="text-gray-400 hover:text-gray-600">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault()
                                                                const input = e.currentTarget.elements.namedItem('valInput') as HTMLInputElement
                                                                if (input.value) {
                                                                    addOptionValue(option.id, input.value)
                                                                    input.value = ''
                                                                }
                                                            }}
                                                            className="inline-flex"
                                                        >
                                                            <input
                                                                name="valInput"
                                                                type="text"
                                                                placeholder={`Add ${option.name}...`}
                                                                className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-w-[100px]"
                                                                onBlur={(e) => {
                                                                    if (e.target.value) {
                                                                        addOptionValue(option.id, e.target.value)
                                                                        e.target.value = ''
                                                                    }
                                                                }}
                                                            />
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Variants Table Preview */}
                                    {variants.length > 0 && (
                                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="text-sm font-bold text-gray-800">Preview Variants ({variants.length})</h3>
                                            </div>
                                            <div className="overflow-x-auto max-w-full">
                                                <table className="w-full text-sm text-left whitespace-nowrap">
                                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-3 min-w-[150px]">Variant</th>
                                                            <th className="px-4 py-3 w-[200px]">Images</th>
                                                            <th className="px-4 py-3 w-[150px]">Price</th>
                                                            <th className="px-4 py-3 w-[120px]">Quantity</th>
                                                            <th className="px-4 py-3 min-w-[150px]">SKU</th>
                                                            <th className="px-4 py-3 text-right w-[80px]">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {variants.map((variant) => (
                                                            <tr key={variant.id} className="bg-white hover:bg-gray-50 group transition-colors">
                                                                <td className="px-4 py-3 font-medium text-gray-900">{variant.title}</td>
                                                                <td className="px-4 py-3">
                                                                    <VariantImageSelector
                                                                        variantId={variant.id}
                                                                        variantLabel={variant.title}
                                                                        currentImages={variant.images || []}
                                                                        availableImages={images.map(img => img.url)}
                                                                        onUpdate={(newImages) => updateVariant(variant.id, 'images', newImages)}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                                        <input
                                                                            type="number"
                                                                            value={variant.price}
                                                                            onChange={(e) => updateVariant(variant.id, 'price', Number(e.target.value))}
                                                                            className="w-full pl-6 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="number"
                                                                        value={variant.stock}
                                                                        onChange={(e) => updateVariant(variant.id, 'stock', Number(e.target.value))}
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <input
                                                                        type="text"
                                                                        value={variant.sku}
                                                                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                                                                        placeholder="SKU"
                                                                        className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Search Engine Listing */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-700">Search engine listing</label>
                            <button className="text-xs font-semibold text-primary hover:underline">Edit</button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Add a title and description to see how this product might appear in a search engine listing.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="text-blue-600 text-sm font-medium hover:underline cursor-pointer truncate">
                                {title || 'Short Sleeve T-Shirt'}
                            </h4>
                            <p className="text-green-700 text-xs mt-0.5 truncate">
                                https://crownandcrest.com/products/{initialData?.id || 'short-sleeve-t-shirt'}
                            </p>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                                {description || 'Describe your product...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Organization */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                        <label className="text-sm font-bold text-gray-700">Status</label>
                        <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium appearance-none">
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                        </select>
                        <p className="text-xs text-gray-500">
                            This product will be hidden from all sales channels.
                        </p>
                    </div>

                    {/* Organization */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <label className="text-sm font-bold text-gray-700">Product Organization</label>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Category</label>
                            <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium">
                                <option>Apparel & Accessories</option>
                                <option>Home & Garden</option>
                                <option>Electronics</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Type</label>
                            <input
                                type="text"
                                placeholder="e.g. T-Shirt"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</label>
                            <input
                                type="text"
                                placeholder="e.g. Nike"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Collections</label>
                            <input
                                type="text"
                                placeholder="Search collections..."
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</label>
                            <input
                                type="text"
                                placeholder="Vintage, Cotton, Summer"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
