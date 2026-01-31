'use client'

// ============================================
// SIZE GUIDE MODAL
// ============================================
// Displays garment measurements (brand data only)
// Never shows user body measurements
// Always accessible (no auth required)
// ============================================

import { useState } from 'react'
import { X } from 'lucide-react'
import { SizeChartMeasurements } from '@/lib/size-charts/types'

interface Props {
    sizeChart: SizeChartMeasurements | null
    productName: string
    isOpen: boolean
    onClose: () => void
}

export default function SizeGuideModal({ sizeChart, productName, isOpen, onClose }: Props) {
    if (!isOpen || !sizeChart) return null

    const sizeLabels = Object.keys(sizeChart.sizes)
    const measurementFields = sizeLabels.length > 0
        ? Object.keys(sizeChart.sizes[sizeLabels[0]])
        : []

    // Format field names for display
    const formatFieldName = (field: string): string => {
        const labels: Record<string, string> = {
            chest_cm: 'Chest',
            bust_cm: 'Bust',
            waist_cm: 'Waist',
            hip_cm: 'Hip',
            shoulder_cm: 'Shoulder',
            length_cm: 'Length',
            inseam_cm: 'Inseam',
            rise_cm: 'Rise',
            sleeve_cm: 'Sleeve'
        }
        return labels[field] || field.replace('_cm', '').replace('_', ' ')
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50">
                <div className="bg-white rounded-t-2xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] md:max-h-[80vh] overflow-auto shadow-2xl">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Size Guide</h2>
                            <p className="text-xs text-gray-500">{productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">
                            Garment Measurements ({sizeChart.unit})
                        </p>

                        {/* Measurements Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="text-left py-2 px-2 font-bold text-gray-900">Size</th>
                                        {measurementFields.map(field => (
                                            <th key={field} className="text-left py-2 px-2 font-bold text-gray-900">
                                                {formatFieldName(field)}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sizeLabels.map((sizeLabel, idx) => (
                                        <tr key={sizeLabel} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                                            <td className="py-2 px-2 font-semibold text-gray-900">{sizeLabel}</td>
                                            {measurementFields.map(field => (
                                                <td key={field} className="py-2 px-2 text-gray-700">
                                                    {sizeChart.sizes[sizeLabel][field] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Note:</strong> These are garment measurements (what the product measures),
                                not body measurements. For the best fit, compare these with a similar garment you own.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
