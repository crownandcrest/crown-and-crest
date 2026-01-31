import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AuthClient from './AuthClient'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ redirect?: string }>
}

export default async function AuthPage({ searchParams }: Props) {
  const user = await getCurrentUser()
  const params = await searchParams

  if (user) {
    // If user is already logged in, redirect to the target page
    const redirectUrl = params.redirect || '/'
    redirect(redirectUrl)
  }

  return <AuthClient />
}