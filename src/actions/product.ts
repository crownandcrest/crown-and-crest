// src/actions/product.ts
import { supabase } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache'; // Required for revalidation

// Define a type for the product data based on your database schema
interface ProductData {
  name: string;
  price: number;
  stock_quantity: number;
  images: string[]; // Array of Cloudinary secure_urls
}

export async function createProductAction(productData: ProductData) {
  // In a real application, you would perform server-side validation here
  if (!productData.name || productData.price <= 0 || productData.stock_quantity < 0 || productData.images.length === 0) {
    return { success: false, message: 'Invalid product data provided.' };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        price: productData.price,
        stock_quantity: productData.stock_quantity,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-'), // Generate a simple slug
        images: productData.images,
      })
      .select(); // Return the inserted data

    if (error) {
      console.error('Error inserting product:', error);
      return { success: false, message: error.message || 'Failed to create product.' };
    }

    // Revalidate the products listing page to show the new product
    revalidatePath('/admin/products');

    return { success: true, message: 'Product created successfully!', product: data[0] };
  } catch (e: any) {
    console.error('Exception creating product:', e);
    return { success: false, message: e.message || 'An unexpected error occurred.' };
  }
}
