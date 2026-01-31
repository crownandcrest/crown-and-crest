'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Heart,
    Share2,
    Star,
    ChevronRight,
    Truck,
    ShieldCheck,
    RefreshCw,
    ChevronDown,
    Minus,
    Plus,
    AlertTriangle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addToGuestCart } from '@/lib/cart/guestCart'
import { addToCart } from '@/lib/cart/actions'
import { useToast } from '@/hooks/useToast'
import { computeSizeRecommendation } from '@/lib/recommendation'
import SizeRecommendation from '@/components/product/SizeRecommendation'
import SizeGuideModal from '@/components/product/SizeGuideModal'

interface ProductVariant {
    id: string
    title: string
    price: number
    stock: number
    available_to_sell: number
    is_out_of_stock: boolean
    options: Record<string, unknown> // JSONB
    images?: string[] // Variant-specific images
}

interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    base_price: number
    image_url: string | null
    images?: unknown  //  Product media pool
    category: string | null
    product_variants: ProductVariant[]
}

interface RelatedProduct {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
}

interface SizeChart {
    id: string
    name: string
    measurements: any
    fit_type: string | null
}

interface UserSizebook {
    id: string
    user_uid: string
    gender: string | null
    height_cm: number | null
    weight_kg: number | null
    measurements: any
    fit_preference: string | null
}

export default function ProductDetailClient({
    product,
    relatedProducts = [],
    sizeChart = null,
    userSizebook = null,
    isAuthenticated = false
}: {
    product: Product
    relatedProducts?: RelatedProduct[]
    sizeChart?: SizeChart | null
    userSizebook?: UserSizebook | null
    isAuthenticated?: boolean
}) {
    const router = useRouter()
    const { showSuccess, showError } = useToast()
    // Compute unique sizes and colors from actual variants
    const uniqueSizes = Array.from(new Set(product.product_variants.map(v => v.options?.Size).filter(Boolean))) as string[]
    const uniqueColors = Array.from(new Set(product.product_variants.map(v => v.options?.Color).filter(Boolean))) as string[]

    const [selectedSize, setSelectedSize] = useState<string>(uniqueSizes[0] || '')
    const [selectedColor, setSelectedColor] = useState<string>(uniqueColors[0] || '')
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>('description')
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [showSizeGuide, setShowSizeGuide] = useState(false)

    // Compute size recommendation
    const sizeRecommendation = useMemo(() => {
        if (!userSizebook || !sizeChart) return null

        return computeSizeRecommendation({
            user_measurements: userSizebook.measurements,
            size_chart: sizeChart.measurements
        })
    }, [userSizebook, sizeChart])

    // Pre-select recommended size (UI state only, user can override)
    useEffect(() => {
        if (sizeRecommendation && uniqueSizes.includes(sizeRecommendation.size_label)) {
            setSelectedSize(sizeRecommendation.size_label)
        }
    }, [sizeRecommendation, uniqueSizes])

    // Pincode check state
    const [pincode, setPincode] = useState('')
    const [pincodeResult, setPincodeResult] = useState<{
        serviceable: boolean
        cod_available: boolean
        estimated_days: number
    } | null>(null)
    const [checkingPincode, setCheckingPincode] = useState(false)

    // Helper to find hex for color name (simple map or fallback)
    const getColorHex = (name: string) => {
        const map: Record<string, string> = {
            'Black': '#000000', 'Midnight Black': '#000000',
            'White': '#FFFFFF', 'Ivory': '#F5F5DC',
            'Red': '#FF0000', 'Dusty Rose': '#DCAE96',
            'Blue': '#0000FF', 'Navy': '#000080',
            'Green': '#008000', 'Olive': '#808000',
            'Beige': '#F5F5DC'
        }
        return map[name] || '#CCCCCC'
    }

    const getSelectedVariantId = () => {
        const match = product.product_variants.find(v =>
            v.options?.Size === selectedSize && v.options?.Color === selectedColor
        )
        return match ? match.id : null
    }

    const getSelectedVariant = () => {
        return product.product_variants.find(v =>
            v.options?.Size === selectedSize && v.options?.Color === selectedColor
        )
    }

    const selectedVariant = getSelectedVariant()
    const isOutOfStock = !selectedVariant || selectedVariant.is_out_of_stock

    const handleAddToCart = async () => {
        if (isOutOfStock) return

        setIsAddingToCart(true)
        try {
            const variantId = getSelectedVariantId()

            if (!variantId) {
                console.warn('No matching variant found for selection')
                showError("Selected combination is unavailable.")
                return
            }

            // HARD GUARD: Route to correct cart based on authentication
            if (isAuthenticated) {
                // AUTHENTICATED: Use server action (writes to cart_items table)
                const formData = new FormData()
                formData.append('productId', product.id)
                formData.append('variantId', variantId)
                formData.append('quantity', '1')

                const result = await addToCart(null, formData)

                if (result.success) {
                    showSuccess(`${product.name} (${selectedSize}, ${selectedColor}) has been added.`)
                } else {
                    showError(result.error || "Failed to add to cart. Please try again.")
                }
            } else {
                // GUEST: Use guest cart (writes to localStorage)
                const success = addToGuestCart(product.id, variantId, 1)

                if (success) {
                    showSuccess(`${product.name} (${selectedSize}, ${selectedColor}) has been added.`)
                } else {
                    showError("Failed to add to cart. Please try again.")
                }
            }
        } catch (error) {
            console.error(error)
            showError("An unexpected error occurred.")
        } finally {
            setIsAddingToCart(false)
        }
    }

    const handleBuyNow = async () => {
        await handleAddToCart()
        router.push('/checkout')
    }

    const handleCheckPincode = async () => {
        if (!pincode || pincode.length !== 6) {
            showError('Please enter a valid 6-digit pincode')
            return
        }

        setCheckingPincode(true)
        setPincodeResult(null)

        try {
            const response = await fetch('/api/shipping/pincode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pincode }),
            })

            const data = await response.json()

            if (response.ok) {
                setPincodeResult(data)
                if (!data.serviceable) {
                    showError('Delivery not available for this pincode')
                } else {
                    showSuccess(`Delivery available in ${data.estimated_days} days!`)
                }
            } else {
                showError('Failed to check pincode. Please try again.')
            }
        } catch (error) {
            console.error('Pincode check error:', error)
            showError('Network error. Please try again.')
        } finally {
            setCheckingPincode(false)
        }
    }

    // Build image gallery: Show ALL images, but reorder based on variant selection
    // Using useMemo to ensure it recomputes when variant selection changes
    const images = useMemo(() => {

        let allImages: string[] = []

        // 1. Collect all product media pool images
        if (product.images && Array.isArray(product.images)) {
            const productImages = product.images
                .map((img: any) => typeof img === 'string' ? img : img.url)
                .filter((url: string) => url)
            allImages = [...productImages]

        }

        // 2. Add main product image if not already included
        if (product.image_url && !allImages.includes(product.image_url)) {
            allImages.push(product.image_url)
        }

        // 3. Collect ALL variant images from all variants
        const allVariantImages = product.product_variants
            .flatMap(v => v.images || [])
            .filter((img, index, self) => self.indexOf(img) === index) // Remove duplicates

        // 4. Add variant images that aren't already in the list
        allVariantImages.forEach(img => {
            if (!allImages.includes(img)) {
                allImages.push(img)
            }
        })

        // 5. Reorder: If a variant is selected and has an image, move it to first position
        let finalImages: string[] = [...allImages]
        const selectedVariant = getSelectedVariant()

        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            const variantImage = selectedVariant.images[0]

            if (finalImages.includes(variantImage)) {
                // Remove variant image from current position
                finalImages = finalImages.filter(img => img !== variantImage)
                // Add it to the front
                finalImages = [variantImage, ...finalImages]
            }
        }

        // Fallback: if no images at all, use product image
        if (finalImages.length === 0 && product.image_url) {
            finalImages = [product.image_url]
        }


        return finalImages
    }, [selectedSize, selectedColor, product.images, product.image_url, product.product_variants])

    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Reset image index ONLY when variant changes, not when images array updates
    useEffect(() => {

        setCurrentImageIndex(0)
    }, [selectedSize, selectedColor])  // Removed 'images' dependency!

    const toggleAccordion = (id: string) => {
        setExpandedAccordion(expandedAccordion === id ? null : id)
    }

    return (
        <div className="bg-white min-h-screen pb-24 md:pb-0">
            {/* Mobile Header - Usually Layout handles this but this is a specific overlay style if needed */}
            {/* Using standard layout header for now, maybe add breadcrumbs */}

            <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:py-8">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-16">

                    {/* Left Column: Images - Myntra Style */}
                    <div className="w-full md:w-1/2 lg:w-[55%]">
                        {/* Desktop: Vertical Scrolling Gallery (Myntra Style) */}
                        <div className="hidden md:block space-y-2">
                            {images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="relative w-full aspect-[3/4] bg-gray-100 overflow-hidden"
                                >
                                    <Image
                                        src={img}
                                        alt={`${product.name} - Image ${idx + 1}`}
                                        fill
                                        priority={idx === 0}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                    />
                                    {isOutOfStock && idx === 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="bg-red-500 text-white text-lg font-bold px-6 py-3 rounded">OUT OF STOCK</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile: Carousel with Thumbnails */}
                        <div className="md:hidden">
                            <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                                <AnimatePresence mode='wait'>
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={images[currentImageIndex] || '/placeholder.png'}
                                            alt={product.name}
                                            fill
                                            priority
                                            className="object-cover"
                                        />
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded">OUT OF STOCK</span>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Pagination Dots */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                    {images.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-white w-4' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Thumbnails */}
                            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 px-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentImageIndex(idx)}
                                        style={{ backgroundImage: `url(${img})` }}
                                        className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all bg-cover bg-center ${currentImageIndex === idx ? 'border-black' : 'border-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Wishlist Button - Fixed for both */}
                        <button
                            onClick={() => setIsWishlisted(!isWishlisted)}
                            className="fixed top-20 md:top-24 right-4 md:right-8 lg:right-16 p-3 rounded-full bg-white shadow-lg z-50 hover:scale-110 transition-transform"
                        >
                            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} />
                        </button>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-1/2 lg:w-[45%] px-4 md:px-0 md:sticky md:top-24 h-fit">
                        <div className="mb-6 mt-6 md:mt-0">
                            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">{product.category || 'Collection'}</p>
                            <h1 className="text-3xl font-display text-gray-900 mb-2">{product.name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-black text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                    4.8 <Star className="w-3 h-3 fill-current" />
                                </span>
                                <span className="text-sm text-gray-500 underline decoration-gray-300 underline-offset-4">124 Ratings</span>
                            </div>

                            <div className="flex items-baseline gap-3 mb-1">
                                <span className="text-2xl font-bold text-gray-900">₹{product.base_price.toLocaleString('en-IN')}</span>
                                <span className="text-lg text-gray-400 line-through">₹{(product.base_price * 1.3).toLocaleString('en-IN')}</span>
                                <span className="text-red-600 font-medium bg-red-50 px-2 py-1 rounded text-sm">24% OFF</span>
                            </div>
                            {isOutOfStock ? (
                                <p className="text-sm text-red-600 font-bold flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" />
                                    Out of Stock
                                </p>
                            ) : (
                                <p className="text-xs text-green-600 font-medium">Inclusive of all taxes • Free Shipping</p>
                            )}
                        </div>

                        {/* Pincode Check */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
                                <Truck className="w-4 h-4" /> Check Delivery
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter Pincode"
                                    value={pincode || ''}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCheckPincode()}
                                    className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-lg text-sm focus:ring-black focus:border-black"
                                    maxLength={6}
                                />
                                <button
                                    onClick={handleCheckPincode}
                                    disabled={checkingPincode || pincode.length !== 6}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-black px-3 py-1.5 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {checkingPincode ? 'CHECKING...' : 'CHECK'}
                                </button>
                            </div>
                            {/* Result Display */}
                            {pincodeResult && (
                                <div className={`mt-3 p-3 rounded-lg text-sm ${pincodeResult.serviceable
                                    ? 'bg-green-50 text-green-800'
                                    : 'bg-red-50 text-red-800'
                                    }`}>
                                    {pincodeResult.serviceable ? (
                                        <>
                                            <p className="font-semibold">✓ Delivery Available</p>
                                            <p className="text-xs mt-1">
                                                Expected by: {new Date(Date.now() + (pincodeResult.estimated_days + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                                {pincodeResult.cod_available && ' • COD Available'}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="font-semibold">✗ Delivery not available for this pincode</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-700 mb-2">Color: <span className="text-gray-900 font-medium">{selectedColor}</span></p>
                            {uniqueColors.length > 0 ? (
                                <div className="flex gap-3">
                                    {uniqueColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-black ring-1 ring-black ring-offset-2' : 'border-transparent'
                                                }`}
                                        >
                                            <div
                                                className="w-full h-full rounded-full border border-gray-200"
                                                style={{ backgroundColor: getColorHex(color) }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No colors available</p>
                            )}
                        </div>

                        {/* Size Selection */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-gray-700">Select Size</p>
                                <button
                                    onClick={() => setShowSizeGuide(true)}
                                    className="text-xs font-medium text-gray-900 underline decoration-gray-400 underline-offset-4 hover:text-gray-700 transition-colors"
                                >
                                    Size Guide
                                </button>
                            </div>
                            {uniqueSizes.length > 0 ? (
                                <div className="grid grid-cols-5 gap-3">
                                    {uniqueSizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-10 rounded-lg text-sm font-medium border flex items-center justify-center transition-all ${selectedSize === size
                                                ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                                                : 'border-gray-200 text-gray-900 hover:border-gray-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No sizes available</p>
                            )}
                        </div>

                        {/* Size Recommendation */}
                        <SizeRecommendation
                            recommendation={sizeRecommendation}
                            hasUserSizebook={!!userSizebook}
                            isAuthenticated={isAuthenticated}
                            sizeChartExists={!!sizeChart}
                        />

                        {/* Desktop Actions */}
                        <div className="hidden md:flex gap-4 mb-8">
                            <button
                                onClick={handleBuyNow}
                                disabled={isAddingToCart}
                                className="flex-1 bg-white border border-gray-900 text-gray-900 font-bold text-sm tracking-widest rounded uppercase py-4 hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Buy Now
                            </button>
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="flex-1 bg-black text-white font-bold text-sm tracking-widest rounded uppercase py-4 shadow-lg shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-gray-100">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 text-gray-700" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Easy Returns</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-gray-700" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">COD Available</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4 text-gray-700" />
                                </div>
                                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wide">Secure Payment</span>
                            </div>
                        </div>

                        {/* Accordions */}
                        <div className="space-y-4">
                            {['Product Description', 'Delivery & Returns', 'Materials & Care'].map((section) => (
                                <div key={section} className="border-b border-gray-100 last:border-0 pb-4">
                                    <button
                                        onClick={() => toggleAccordion(section.toLowerCase().split(' ')[0])}
                                        className="w-full flex justify-between items-center py-2"
                                    >
                                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">{section}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedAccordion === section.toLowerCase().split(' ')[0] ? 'rotate-180' : ''}`} />
                                    </button>
                                    <AnimatePresence>
                                        {expandedAccordion === section.toLowerCase().split(' ')[0] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div
                                                    className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{
                                                        __html: product.description || "Experience luxury with this premium piece from Lumière. Crafted with attention to detail and designed for the modern aesthetic."
                                                    }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Reviews Teaser */}
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Reviews <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs ml-1">120</span></h3>
                                <button className="text-xs underline text-gray-500">View all</button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <div className="flex gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-black text-black" />)}
                                </div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Stunning quality</p>
                                <p className="text-xs text-gray-600 italic">"The fabric is incredibly soft and the fit is true to size. I've worn it to three events already!"</p>
                                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">— Sarah J., Verified Buyer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete The Look Section */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-16 md:mt-24 border-t border-gray-100 pt-16">
                        <h2 className="text-xl font-display text-gray-900 mb-8 uppercase tracking-widest">Complete The Look</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {relatedProducts.map(related => (
                                <Link key={related.id} href={`/product/${related.slug}`} className="group block">
                                    <div className="aspect-[3/4] relative bg-gray-100 rounded-lg overflow-hidden mb-3">
                                        <Image
                                            src={related.image_url || '/placeholder.png'}
                                            alt={related.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 group-hover:underline decoration-1 underline-offset-4">{related.name}</h3>
                                    <p className="text-sm text-gray-500">₹{related.base_price.toLocaleString('en-IN')}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Bottom Bar (Mobile) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:hidden z-50 flex gap-4 backdrop-blur-md bg-white/95">
                <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">₹{product.base_price.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-red-600 font-medium">Inclusive of taxes</p>
                </div>
                <button
                    onClick={handleBuyNow}
                    disabled={isAddingToCart}
                    className="flex-1 bg-white border border-gray-900 text-gray-900 font-bold text-sm tracking-widest rounded uppercase py-3 disabled:opacity-50"
                >
                    Buy Now
                </button>
                <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 bg-black text-white font-bold text-sm tracking-widest rounded uppercase py-3 shadow-lg shadow-black/20 disabled:opacity-50"
                >
                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
            </div>

            {/* Desktop Action Bar (Placeholder, normally sticky side but integrated above) */}
            <div className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
                {/* Can add a floating bar for desktop if scrolled past summary */}
            </div>

            {/* Size Guide Modal */}
            <SizeGuideModal
                sizeChart={sizeChart?.measurements || null}
                productName={product.name}
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
            />
        </div>
    )
}

