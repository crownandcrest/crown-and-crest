"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Package, ShoppingCart, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'
import { useState } from 'react'

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

// Crown & Crest Logo Component
function CrownCrestLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Crown */}
      <path
        d="M20 35 L25 45 L30 35 L35 45 L40 35 L45 45 L50 35 L55 45 L60 35 L65 45 L70 35 L75 45 L80 35 L80 55 L20 55 Z"
        fill="url(#crownGradient)"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      {/* Crest Shield */}
      <path
        d="M30 55 L30 75 Q50 85 70 75 L70 55 Z"
        fill="url(#shieldGradient)"
        stroke="#1a1a1a"
        strokeWidth="1.5"
      />
      {/* C&C Monogram */}
      <text x="50" y="72" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="serif">
        C&C
      </text>

      {/* Gradients */}
      <defs>
        <linearGradient id="crownGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ffb800" />
        </linearGradient>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function AdminNav() {
  const [showCommandMenu, setShowCommandMenu] = useState(false)
  const pathname = usePathname()

  const handleSearchClick = () => {
    setShowCommandMenu(true)
  }

  // Improved active state detection
  const isActive = (href: string) => {
    if (!pathname) return false

    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin'
    }

    // For other routes, check if pathname starts with the href
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Command Menu */}
      {/* {showCommandMenu && <CommandMenu onClose={() => setShowCommandMenu(false)} />} */}

      <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
        <nav aria-label="Admin" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link href="/admin" className="flex items-center gap-3 group">
                {/* Crown & Crest Logo */}
                <div className="w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CrownCrestLogo className="w-11 h-11" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight">
                    Crown & Crest
                  </h1>
                  <p className="text-xs text-gray-500 -mt-0.5">Admin Portal</p>
                </div>
              </Link>

              {/* Navigation Links */}
              <ul className="hidden md:flex items-center gap-1">
                {adminLinks.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${active
                            ? 'bg-gray-900 text-white shadow-md ring-2 ring-gray-900 ring-offset-1'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'animate-none' : ''}`} strokeWidth={2.5} />
                        <span>{label}</span>
                        {active && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white ml-1 animate-pulse" />
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={handleSearchClick}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all group"
              >
                <Search className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-gray-200 rounded group-hover:border-gray-300">
                  ⌘K
                </kbd>
              </button>

              {/* Logout */}
              <Link
                href="/api/auth/logout"
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden border-t py-3">
            <ul className="flex items-center gap-1 overflow-x-auto pb-1">
              {adminLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all
                        ${active
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
      </header>
    </>
  )
}
