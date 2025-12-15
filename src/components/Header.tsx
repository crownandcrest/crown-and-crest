import Link from 'next/link'

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const ProfileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const HamburgerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)


export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="font-bold text-2xl">
                Crown And Crest
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <nav className="ml-10 flex items-baseline space-x-4">
              <Link href="/shop/men" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Men</Link>
              <Link href="/shop/women" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Women</Link>
              <Link href="/shop/collections" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Collections</Link>
              <Link href="/sale" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sale</Link>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  name="search"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-100 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black sm:text-sm"
                  placeholder="Search products..."
                />
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black md:hidden">
                <SearchIcon />
              </button>
              <Link href="/cart" className="ml-4 relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black">
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white text-xs flex items-center justify-center">2</span>
                <CartIcon />
              </Link>
              <Link href="/auth/login" className="ml-4 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black">
                <ProfileIcon />
              </Link>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button type="button" className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black" aria-expanded="false">
                <span className="sr-only">Open main menu</span>
                <HamburgerIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
