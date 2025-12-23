/**
 * Auth Layout
 * 
 * - Shared layout for all authentication pages (/auth/login, /auth/otp, /auth/forgot-password)
 * - NO header or footer (clean authentication interface)
 * - Minimal styling to focus on forms
 * - Does NOT render storefront navigation
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  );
}
