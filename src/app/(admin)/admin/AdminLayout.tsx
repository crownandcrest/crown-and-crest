'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingCart,
    Settings,
    Search,
    Bell,
    Menu,
    X,
    Home,
    ChevronDown
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay Sidebar */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
                        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-lg">L</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight">LUMIÈRE</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${isActive
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>
                        <div className="p-4 border-t border-gray-100">
                            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl">
                                <Home className="w-5 h-5" />
                                Back to Store
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Always Visible on lg+ screens */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 lg:flex lg:flex-col">
                <div className="flex flex-col flex-1 bg-white border-r border-gray-200">
                    {/* Logo */}
                    <div className="flex items-center h-16 px-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-gray-800 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-white font-bold text-lg">L</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">LUMIÈRE</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all group ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Bottom */}
                    <div className="p-4 border-t border-gray-100">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                        >
                            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Back to Store
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content - Uses Tailwind responsive padding */}
            <div className="lg:pl-64 transition-all duration-300">
                {/* Top Bar */}
                <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
                    <div className="flex items-center h-16 px-6 gap-4">
                        {/* Mobile Hamburger - Only visible on mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Search */}
                        <div className="flex-1 max-w-2xl">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products, orders, customers..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-gray-800 rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-white text-sm font-bold">A</span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-gray-900">Admin</p>
                                    <p className="text-xs text-gray-500">Super Admin</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-8">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
