import "./globals.css";
import type { Metadata } from "next";

// Manrope font is loaded via Google Fonts CDN in globals.css

export const metadata: Metadata = {
  title: "Crown and Crest – Premium Products",
  description: "Discover our curated collection of fine goods. Premium products for discerning customers.",
  keywords: ["products", "shop", "premium", "fine goods"],
  creator: "Crown and Crest",
  openGraph: {
    type: "website",
    url: "https://crownandcrest.com",
    title: "Crown and Crest – Premium Products",
    description: "Discover our curated collection of fine goods.",
    siteName: "Crown and Crest",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crown and Crest – Premium Products",
    description: "Discover our curated collection of fine goods.",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

/**
 * Root Layout
 * 
 * Minimal layout with Inter font only
 * Clean design system from mobile mockups
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans bg-background-light text-primary antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}