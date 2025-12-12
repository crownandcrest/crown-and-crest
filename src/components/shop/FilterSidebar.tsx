"use client";

import { useState } from "react";
import { ChevronDown, Check, X } from "lucide-react";

export default function FilterSidebar({ isOpen, onClose, filters, setFilters }: any) {
    // Accordion State
    const [expanded, setExpanded] = useState<any>({ category: true, size: true, price: true });

    const toggle = (section: string) => setExpanded((prev: any) => ({ ...prev, [section]: !prev[section] }));

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev: any) => {
            const current = prev[key] || [];
            if (current.includes(value)) {
                return { ...prev, [key]: current.filter((i: string) => i !== value) };
            }
            return { ...prev, [key]: [...current, value] };
        });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

            <aside className={`fixed inset-y-0 left-0 w-[300px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:block lg:z-0 border-r border-gray-100 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="p-6 border-b border-gray-100 flex justify-between items-center lg:hidden">
                    <h2 className="font-bold uppercase">Filters</h2>
                    <button onClick={onClose}><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Category Filter */}
                    <div>
                        <button onClick={() => toggle('category')} className="flex items-center justify-between w-full font-bold text-sm uppercase mb-4">
                            Category <ChevronDown className={`w-4 h-4 transition ${expanded.category ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded.category && (
                            <div className="space-y-2 animate-in slide-in-from-top-2">
                                {['T-Shirts', 'Hoodies', 'Bottoms', 'Jackets'].map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${filters.category?.includes(cat) ? 'bg-black border-black' : 'group-hover:border-black'}`}>
                                            {filters.category?.includes(cat) && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="text-sm text-gray-600 group-hover:text-black">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Size Filter */}
                    <div>
                        <button onClick={() => toggle('size')} className="flex items-center justify-between w-full font-bold text-sm uppercase mb-4">
                            Size <ChevronDown className={`w-4 h-4 transition ${expanded.size ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded.size && (
                            <div className="grid grid-cols-4 gap-2 animate-in slide-in-from-top-2">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                    <button 
                                        key={size}
                                        onClick={() => handleFilterChange('size', size)}
                                        className={`py-2 text-xs font-bold border transition ${filters.size?.includes(size) ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Range */}
                    <div>
                        <button onClick={() => toggle('price')} className="flex items-center justify-between w-full font-bold text-sm uppercase mb-4">
                            Price Range <ChevronDown className={`w-4 h-4 transition ${expanded.price ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded.price && (
                            <div className="space-y-4">
                                <input type="range" min="500" max="5000" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between text-xs font-bold font-mono">
                                    <span>₹500</span>
                                    <span>₹5000+</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}