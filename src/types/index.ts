import { Database } from "@/lib/database.types";

export type Product = Database['public']['Tables']['products']['Row'] & {
    size_chart_id?: string | null;
    size_chart?: SizeChart; // For joined queries
    variants: Variant[];
};
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type Variant = Database['public']['Tables']['product_variants']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];
export type OrderRequest = Database['public']['Tables']['order_requests']['Row'];
export type OrderRequestInsert = Database['public']['Tables']['order_requests']['Insert'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];

// Complex type for UI (Review + User Name)
export interface ReviewWithUser extends Review {
    user: {
        full_name: string;
    } | null;
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Address = Database['public']['Tables']['user_addresses']['Row'];
export type AddressInsert = Database['public']['Tables']['user_addresses']['Insert'];

export type MeasurementProfile = Database['public']['Tables']['user_measurements']['Row'];
export type MeasurementProfileInsert = Database['public']['Tables']['user_measurements']['Insert'];
export type MeasurementProfileUpdate = Database['public']['Tables']['user_measurements']['Update'];

export type Analytics = Database['public']['Tables']['analytics']['Row'];
export type AnalyticsInsert = Database['public']['Tables']['analytics']['Insert'];

// Add this interface
export interface SizeChart {
    id: string;
    name: string;
    description: string | null;
    measurements: Record<string, {
        chest: number;
        shoulder: number;
        length: number;
        sleeve?: number;
    }>;
    created_at: string;
}

// 2. Complex Types (Joins)
export interface VariantWithProduct extends Variant {
    product: {
        name: string;
        images: string[] | null;
    } | null;
}