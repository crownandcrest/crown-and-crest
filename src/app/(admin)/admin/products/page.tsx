import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import ProductsTable from './ProductsTable'

async function getProducts() {
    const { data } = await supabaseServer
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

    return data || []
}

export default async function ProductsPage() {
    const products = await getProducts()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        All Products
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        Active
                    </button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                        Draft
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <ProductsTable products={products} />
        </div>
    )
}
