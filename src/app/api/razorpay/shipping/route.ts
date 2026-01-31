import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { checkPincodeServiceability } from '@/lib/shiprocket/pincode'
import { getShippingRates, selectBestCourier } from '@/lib/shiprocket/shipping'

/**
 * Razorpay Magic Checkout: Shipping Options API
 * 
 * Called by Razorpay to determine:
 * - Whether a pincode is serviceable (AUTHORITATIVE via Shiprocket)
 * - Shipping charges (calculated via Shiprocket rates)
 * - Delivery estimates (from Shiprocket courier ETAs)
 * - COD availability (Shiprocket serviceability + Razorpay risk)
 * 
 * Request from Razorpay:
 * {
 *   "pincode": "400001",
 *   "cod": true,
 *   "order_id": "order_xxx"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const { pincode, cod, order_id } = await req.json()
    
    console.log('[SHIPPING_API] Razorpay request for pincode:', pincode, 'COD:', cod, 'Order:', order_id)

    // Validate pincode format (6 digits)
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      console.log('[SHIPPING_API] Invalid pincode format')
      return NextResponse.json({
        serviceable: false,
        cod: false,
        error: 'Invalid pincode format'
      })
    }

    // 1️⃣ CHECK SHIPROCKET SERVICEABILITY (AUTHORITATIVE)
    const serviceability = await checkPincodeServiceability(pincode)
    
    if (!serviceability.serviceable) {
      console.log('[SHIPPING_API] Pincode not serviceable:', pincode)
      return NextResponse.json({
        serviceable: false,
        cod: false,
        shipping_fee: 0,
        estimated_delivery_days: 0,
      })
    }

    console.log('[SHIPPING_API] Pincode serviceable:', {
      cod: serviceability.codAvailable,
      days: serviceability.estimatedDays
    })

    // 2️⃣ FETCH ORDER TO GET WEIGHT & VALUE
    let orderWeight = 0.5 // Default 500g
    let orderValue = 0
    
    if (order_id) {
      try {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select(`
            amount,
            razorpay_order_id,
            order_items (
              quantity,
              variants:variant_id (
                products:product_id (
                  shipping_weight
                )
              )
            )
          `)
          .eq('razorpay_order_id', order_id)
          .single()

        if (order) {
          orderValue = order.amount
          
          // Calculate total weight from items
          const items = order.order_items || []
          interface OrderItem {
            quantity: number
            variants?: {
              products?: {
                shipping_weight?: number
              } |  {
                shipping_weight?: number
              }[]
            } | {
              products?: {
                shipping_weight?: number  
              } | {
                shipping_weight?: number
              }[]
            }[]
          }
          orderWeight = items.reduce((total: number, item: unknown) => {
            const orderItem = item as OrderItem
            const variantsArray = Array.isArray(orderItem.variants) ? orderItem.variants : [orderItem.variants]
            const productsData = variantsArray[0]?.products
            const productsArray = Array.isArray(productsData) ? productsData : [productsData]
            const weight = productsArray[0]?.shipping_weight || 0.5
            return total + (weight * orderItem.quantity)
          }, 0)
          
          orderWeight = Math.max(orderWeight, 0.5) // Minimum 500g
          console.log('[SHIPPING_API] Order weight:', orderWeight, 'kg, Value:', orderValue)
        }
      } catch (error) {
        console.warn('[SHIPPING_API] Could not fetch order details:', error)
      }
    }

    // 3️⃣ GET SHIPPING RATES FROM SHIPROCKET
    const pickupPincode = process.env.WAREHOUSE_PINCODE || '110001' // Default Delhi
    const codAmount = cod ? orderValue : undefined
    
    const courierOptions = await getShippingRates({
      pickupPincode,
      deliveryPincode: pincode,
      weight: orderWeight,
      codAmount,
      declaredValue: orderValue || 1000, // Fallback value,
    })

    // 4️⃣ SELECT BEST COURIER
    const bestCourier = selectBestCourier(courierOptions)
    
    if (!bestCourier) {
      console.warn('[SHIPPING_API] No courier options available, using fallback')
      return NextResponse.json({
        serviceable: true,
        cod: serviceability.codAvailable,
        shipping_fee: 20, // Fallback flat rate
        estimated_delivery_days: serviceability.estimatedDays,
      })
    }

    // 5️⃣ COD VALIDATION (Shiprocket + Razorpay)
    // Razorpay's 'cod' param indicates if COD is allowed by their risk engine
    // We combine with Shiprocket's COD availability for this pincode
    const codAllowed = cod && serviceability.codAvailable && bestCourier.supportsCod

    console.log('[SHIPPING_API] Final shipping:', {
      courier: bestCourier.courierName,
      fee: bestCourier.rate,
      days: bestCourier.estimatedDays,
      cod: codAllowed
    })

    return NextResponse.json({
      serviceable: true,
      cod: codAllowed,
      shipping_fee: Math.round(bestCourier.rate),
      estimated_delivery_days: bestCourier.estimatedDays,
    })

  } catch (error) {
    console.error('[SHIPPING_API] Error:', error)
    
    // Graceful fallback on error
    return NextResponse.json({
      serviceable: true,
      cod: true,
      shipping_fee: 20, // Flat ₹20 fallback
      estimated_delivery_days: 7,
    })
  }
}
