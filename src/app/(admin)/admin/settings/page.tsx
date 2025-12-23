'use client'

import { useState } from 'react'
import { Sparkles, Settings, CreditCard, Bell, Truck, TrendingUp } from 'lucide-react'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'ai'>('general')

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your store preferences and AI configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-gray-100/80 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('general')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    General Settings
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ai'
                        ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    <Sparkles className="w-4 h-4" />
                    AI Configuration
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* General Settings Tab */}
                {activeTab === 'general' && (
                    <>
                        {/* Store Information */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Store Information</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Store Name</label>
                                    <input
                                        type="text"
                                        defaultValue="LUMIÈRE"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Store Email</label>
                                    <input
                                        type="email"
                                        defaultValue="contact@lumiere.com"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Currency</label>
                                    <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                                        <option>INR (₹)</option>
                                        <option>USD ($)</option>
                                        <option>EUR (€)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Bell className="w-5 h-5 text-gray-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Order notifications</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Low stock alerts</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Customer messages</span>
                                    <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                </label>
                            </div>
                        </div>

                        {/* Payment Settings */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Payment Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Razorpay Key ID</label>
                                    <input
                                        type="text"
                                        placeholder="rzp_test_xxxxxxxxxxxx"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Razorpay Key Secret</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••••••••••"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Truck className="w-5 h-5 text-gray-600" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900">Shipping</h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Standard Shipping Fee</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-serif">₹</span>
                                        <input
                                            type="number"
                                            defaultValue="0"
                                            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Free Shipping Above</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-serif">₹</span>
                                        <input
                                            type="number"
                                            defaultValue="1000"
                                            className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* AI Configuration Tab */}
                {activeTab === 'ai' && (
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                <Sparkles className="w-64 h-64 text-primary" />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                <div className="md:w-1/3 space-y-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Lumière AI Intelligence</h2>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        Configure your store's artificial intelligence capabilities. Enable automated descriptions, smart customer support, and market analysis.
                                    </p>

                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-xs border border-yellow-100">
                                        <strong>Note:</strong> API usage is billed directly by your provider (OpenAI/Google).
                                    </div>
                                </div>

                                <div className="md:w-2/3 space-y-6">
                                    {/* Main Toggle */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Enable AI Features</h3>
                                            <p className="text-xs text-gray-500 mt-1">Master switch for all AI capabilities</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    {/* API Key */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            OpenAI API Key
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                placeholder="sk-..."
                                                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-sm transition-all"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full hidden">
                                                Verified
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                            Securely stored and encrypted.
                                        </p>
                                    </div>

                                    {/* Feature Toggles */}
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-bold text-gray-900 mb-2">Active Features</h3>
                                        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Settings className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Auto-generate Descriptions</span>
                                                    <span className="text-xs text-gray-500">Generate SEO-friendly text for products</span>
                                                </div>
                                            </div>
                                            <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                    <Sparkles className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Smart Chatbot</span>
                                                    <span className="text-xs text-gray-500">Automated customer support responses</span>
                                                </div>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="block text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">Competitor Insight</span>
                                                    <span className="text-xs text-gray-500">Monitor prices and market trends</span>
                                                </div>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sticky Save Button */}
            <div className="fixed bottom-6 right-6 z-20">
                <button className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full shadow-2xl hover:bg-black transform hover:-translate-y-1 transition-all flex items-center gap-2">
                    Save Changes
                </button>
            </div>
        </div>
    )
}
