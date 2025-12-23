import BrandLogo from './BrandLogo'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex justify-center">
          <BrandLogo />
        </div>
        <p className="mb-2">Crafted for the bold.</p>
        <p>&copy; {new Date().getFullYear()} Crown And Crest. All rights reserved.</p>
      </div>
    </footer>
  )
}
