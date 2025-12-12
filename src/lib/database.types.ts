export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: string
          total_amount: number
          payment_method: 'cod' | 'prepaid'
          payment_status: string | null
          shipping_address: Json | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          secondary_phone: string | null
          is_phone_verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          status?: string
          total_amount: number
          payment_method?: 'cod' | 'prepaid'
          payment_status?: string | null
          shipping_address?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          secondary_phone?: string | null
          is_phone_verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          status?: string
          total_amount?: number
          payment_method?: 'cod' | 'prepaid'
          payment_status?: string | null
          shipping_address?: Json | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          secondary_phone?: string | null
          is_phone_verified?: boolean
          created_at?: string
        }
      }
      /* --- OTHER TABLES REMAIN UNCHANGED (Keep previous definitions) --- */
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          is_featured: boolean
          images: string[] | null
          fit_type: string | null
          seo_title: string | null
          hsn_code: string | null
          gst_rate: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          is_featured?: boolean
          images?: string[] | null
          fit_type?: string | null
          seo_title?: string | null
          hsn_code?: string | null
          gst_rate?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          is_featured?: boolean
          images?: string[] | null
          fit_type?: string | null
          seo_title?: string | null
          hsn_code?: string | null
          gst_rate?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          size: string
          color: string
          stock_quantity: number
          cost_price: number
          selling_price: number
          image_urls: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          size: string
          color: string
          stock_quantity?: number
          cost_price?: number
          selling_price?: number
          image_urls?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          size?: string
          color?: string
          stock_quantity?: number
          cost_price?: number
          selling_price?: number
          image_urls?: string[] | null
          created_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          street: string
          city: string
          zip: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          street: string
          city: string
          zip: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          street?: string
          city?: string
          zip?: string
          is_default?: boolean
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          product_id: string | null
          quantity: number
          price_at_purchase: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          variant_id?: string | null
          product_id?: string | null
          quantity?: number
          price_at_purchase: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          variant_id?: string | null
          product_id?: string | null
          quantity?: number
          price_at_purchase?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: string | null
          created_at?: string | null
        }
      }
      user_measurements: {
        Row: {
          id: string
          user_id: string
          profile_name: string
          gender: string | null
          age: number | null
          height_cm: number | null
          weight_kg: number | null
          body_type: string | null
          chest_cm: number | null
          waist_cm: number | null
          shoulder_cm: number | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_name: string
          gender?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          body_type?: string | null
          chest_cm?: number | null
          waist_cm?: number | null
          shoulder_cm?: number | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_name?: string
          gender?: string | null
          age?: number | null
          height_cm?: number | null
          weight_kg?: number | null
          body_type?: string | null
          chest_cm?: number | null
          waist_cm?: number | null
          shoulder_cm?: number | null
          is_default?: boolean
          created_at?: string
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}