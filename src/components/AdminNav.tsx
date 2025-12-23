"use client"

import Link from "next/link"
import { Search } from 'lucide-react'
import { useState } from 'react'
// import NotificationBell from './admin/NotificationBell'
// import CommandMenu from './admin/CommandMenu'

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/media", label: "Media" },
]

export default function AdminNav() {
  const [showCommandMenu, setShowCommandMenu] = useState(false)

  // Listen for CMD+K to open menu
  const handleSearchClick = () => {
    setShowCommandMenu(true)
  }

  return (
    <>
      {/* Command Menu */}
      {/* {showCommandMenu && <CommandMenu onClose={() => setShowCommandMenu(false)} />} */}

      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <nav aria-label="Admin" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <ul className="flex flex-wrap gap-4 font-inter text-black">
              {adminLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="font-medium hover:text-brand nav-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right Side Actions */}
            <div className="ml-auto flex items-center gap-3">
              {/* Search Trigger */}
              <button
                onClick={handleSearchClick}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:text-brand-black bg-neutral-50 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors group"
              >
                <Search className="w-4 h-4" strokeWidth={1.5} />
                <span>Search</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-neutral-200 rounded group-hover:border-neutral-300">
                  ⌘K
                </kbd>
              </button>

              {/* Notification Bell */}
              {/* <NotificationBell /> */}
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
