import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { idToken } = await req.json()

  // Verify Firebase ID token
  const decoded = await adminAuth.verifyIdToken(idToken)

  // IMPORTANT: cookies() is async in Next 16
  const cookieStore = await cookies()

  cookieStore.set('session', decoded.uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ success: true })
}
