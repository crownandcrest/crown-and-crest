// src/app/admin/products/page.tsx
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Plus, Search, Edit, Trash2, MoreHorizontal } from 'lucide-react';

export default async function ProductsPage() {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch Products with their Variant counts
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            *,
            product_variants (count)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
    }

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <p className="text-gray-500 text-sm">Manage your catalog and inventory</p>
                </div>
                <Link 
                    href="/admin/products/new" 
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </Link>
            </div>

            {/* Search & Filter Bar (Visual only for now) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Variants</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {products?.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {/* Image Thumbnail */}
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img 
                                                        src={product.images[0]} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <span className="text-xs">No Img</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Product Name & ID */}
                                            <div>
                                                <p className="font-semibold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[150px]">{product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-500">
                                        {product.product_variants?.[0]?.count || 0}
                                    </td>
                                    <td className="px-6 py-4">
                                        {product.is_featured ? (
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                                Featured
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link 
                                                href={`/admin/products/${product.id}`}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Edit Product"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete Product"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {products?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <p>No products found in your catalog.</p>
                                        <Link href="/admin/products/new" className="text-indigo-600 font-medium hover:underline mt-2 inline-block">
                                            Create your first product
                                        </Link>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}