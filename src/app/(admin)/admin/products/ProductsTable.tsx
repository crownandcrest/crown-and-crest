'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MoreVertical, Eye, EyeOff, Trash2, CheckSquare, Square } from 'lucide-react'
import { deleteProducts, updateProductStatus } from './actions'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/navigation'

interface Product {
    id: string
    name: string
    slug: string
    base_price: number
    image_url: string | null
    category: string | null
    is_active: boolean
    created_at: string
}

export default function ProductsTable({ products }: { products: Product[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const { showSuccess, showError } = useToast()
    const router = useRouter()

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(products.map(p => p.id))
        }
    }

    const clearSelection = () => setSelectedIds([])

    const handleDelete = async (ids: string[]) => {
        if (!confirm(`Delete ${ids.length} product${ids.length > 1 ? 's' : ''}?`)) return

        setIsDeleting(true)
        const result = await deleteProducts(ids)

        if (result.success) {
            showSuccess(`Deleted ${ids.length} product${ids.length > 1 ? 's' : ''}`)
            setSelectedIds([])
            router.refresh()
        } else {
            showError(result.error || 'Failed to delete')
        }
        setIsDeleting(false)
    }

    const handleStatusUpdate = async (ids: string[], isActive: boolean) => {
        const result = await updateProductStatus(ids, isActive)

        if (result.success) {
            showSuccess(`Updated ${ids.length} product${ids.length > 1 ? 's' : ''}`)
            setSelectedIds([])
            router.refresh()
        } else {
            showError(result.error || 'Failed to update status')
        }
    }

    if (products.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No products yet</p>
                <Link href="/admin/products/new" className="text-primary hover:underline text-sm mt-2 inline-block">
                    Create your first product
                </Link>
            </div>
        )
    }

    const allSelected = selectedIds.length === products.length && products.length > 0

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleDelete(selectedIds)}
                            disabled={isDeleting}
                            className="px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(selectedIds, true)}
                            className="px-3 py-1.5 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50"
                        >
                            Set Active
                        </button>
                        <button
                            onClick={() => handleStatusUpdate(selectedIds, false)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Set Draft
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left w-12">
                                <button
                                    onClick={toggleSelectAll}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    {allSelected ? (
                                        <CheckSquare className="w-5 h-5" />
                                    ) : (
                                        <Square className="w-5 h-5" />
                                    )}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => {
                            const isSelected = selectedIds.includes(product.id)
                            const isMenuOpen = openMenuId === product.id

                            return (
                                <tr key={product.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleSelection(product.id)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                {product.image_url ? (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                        No img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.is_active ? (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{product.base_price.toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.category || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Status Toggle */}
                                            <button
                                                onClick={() => handleStatusUpdate([product.id], !product.is_active)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title={product.is_active ? 'Set as Draft' : 'Set as Active'}
                                            >
                                                {product.is_active ? (
                                                    <Eye className="w-4 h-4" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4" />
                                                )}
                                            </button>

                                            {/* Edit Link */}
                                            <Link
                                                href={`/admin/products/${product.id}`}
                                                className="text-primary hover:text-gray-900"
                                            >
                                                Edit
                                            </Link>

                                            {/* 3-Dot Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(isMenuOpen ? null : product.id)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                {isMenuOpen && (
                                                    <>
                                                        {/* Backdrop */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        />

                                                        {/* Dropdown */}
                                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                                            <div className="py-1">
                                                                <Link
                                                                    href={`/product/${product.slug}`}
                                                                    target="_blank"
                                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    View on Store
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        handleStatusUpdate([product.id], !product.is_active)
                                                                        setOpenMenuId(null)
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    {product.is_active ? 'Set as Draft' : 'Set as Active'}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        handleDelete([product.id])
                                                                        setOpenMenuId(null)
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                                >
                                                                    Delete Product
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
