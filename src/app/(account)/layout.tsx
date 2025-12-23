import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Header from '@/components/Header.server'
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

/**
 * Account Layout
 * 
 * - Shared layout for protected account pages (/account/*)
 * - Server component: performs authentication check at layout level
 * - Redirects to /auth/login if not authenticated
 * - Includes Header and Footer (same as storefront)
 * - Each account page only receives authenticated users
 */

export const revalidate = 0 // Disable caching to ensure fresh auth check

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: verify user is authenticated at layout level
  const user = await getCurrentUser()

  if (!user) {
    // Redirect to login with redirect parameter to return after auth
    redirect('/auth/login?redirect=/account')
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Toaster />
    </>
  );
}
