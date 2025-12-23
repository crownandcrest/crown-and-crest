'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import BrandLogo from './BrandLogo'

const ShoppingBagIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z"
    />
  </svg>
)

const AccountIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0L12 21m-4.017-2.275A5.963 5.963 0 0 1 12 15.75v-1.5"
    />
  </svg>
)

const MenuIcon = ({ className = 'w-7 h-7' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
  </svg>
)


const links = [
  { href: '/shop', label: 'Shop' },
  { href: '/new', label: 'New Arrivals' },
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/collections', label: 'Collections' },
  { href: '/about', label: 'About' },
]

export default function HeaderClient({
  isLoggedIn,
  cartCount,
  firstName,
  categories = [],
}: {
  isLoggedIn: boolean
  cartCount: number
  firstName?: string
  categories?: string[]
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (href: string) => pathname?.startsWith(href)

  // Combined links: Static + Dynamic Categories
  const navLinks = [
    { href: '/shop', label: 'Shop' },
    { href: '/new', label: 'New Arrivals' },
    ...categories.map(cat => ({ href: `/shop?category=${encodeURIComponent(cat)}`, label: cat })),
    { href: '/about', label: 'About' },
  ]

  return (
    <header className="w-full border-b border-neutral-200 sticky top-0 bg-white z-50">
      <nav aria-label="Primary" className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 text-neutral-900 hover:text-accent transition-colors duration-200" aria-label="Home">
            <BrandLogo priority />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-8 font-inter text-sm font-medium text-neutral-900">
            {navLinks.map(({ href, label }) => (
              <li key={label}>
                <Link
                  href={href}
                  className={`relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${isActive(href) ? 'font-semibold' : ''
                    }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Desktop Account Link */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <Link
                  href="/account"
                  className="font-inter text-sm font-medium text-neutral-900 hover:text-accent transition-colors duration-200"
                >
                  {firstName ? `Hi, ${firstName}` : 'Account'}
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="font-inter text-sm font-medium text-neutral-900 hover:text-accent transition-colors duration-200"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Account Icon */}
            <Link
              href={isLoggedIn ? '/account' : '/auth/login'}
              className="md:hidden text-neutral-900 hover:text-accent transition-colors duration-200"
              aria-label={isLoggedIn ? 'Account' : 'Sign In'}
            >
              <AccountIcon />
            </Link>

            {/* Shopping Bag */}
            <Link
              href="/cart"
              className="relative text-neutral-900 hover:text-accent transition-colors duration-200"
              aria-label={`Cart with ${cartCount} items`}
            >
              <ShoppingBagIcon />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-neutral-900 hover:text-accent transition-colors duration-200 p-1"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-neutral-200 pt-4" id="mobile-menu">
            <ul className="space-y-2">
              {navLinks.map(({ href, label }) => (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-2 font-inter text-[15px] font-medium text-neutral-900 hover:text-accent transition-colors duration-200 ${isActive(href) ? 'font-semibold text-accent' : ''
                      }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
