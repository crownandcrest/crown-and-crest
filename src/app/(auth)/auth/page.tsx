import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AuthClient from './AuthClient'

export const dynamic = 'force-dynamic'

export default async function AuthPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return <AuthClient />
}