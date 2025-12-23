import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="w-full border-b border-neutral-200">
      <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-accent flex-shrink-0">
              <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M44 11.2727C44 14.0109 39.8386 16.3957 33.69 17.6364C39.8386 18.877 44 21.2618 44 24C44 26.7382 39.8386 29.123 33.69 30.3636C39.8386 31.6043 44 33.9891 44 36.7273C44 40.7439 35.0457 44 24 44C12.9543 44 4 40.7439 4 36.7273C4 33.9891 8.16144 31.6043 14.31 30.3636C8.16144 29.123 4 26.7382 4 24C4 21.2618 8.16144 18.877 14.31 17.6364C8.16144 16.3957 4 14.0109 4 11.2727C4 7.25611 12.9543 4 24 4C35.0457 4 44 7.25611 44 11.2727Z" />
              </svg>
            </div>
            <h2 className="text-neutral-900 text-lg font-semibold">Crown And Crest</h2>
          </div>
          
          {/* Help Link */}
          <Link
            className="font-inter text-sm font-medium text-neutral-600 hover:text-accent transition-colors duration-200"
            href="#"
          >
            Need Help?
          </Link>
        </div>
      </nav>
    </header>
  );
}
