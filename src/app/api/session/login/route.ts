import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase/admin'

export async function POST(req: Request) {
  const { idToken } = await req.json()

  if (!idToken) {
    return NextResponse.json(
      { error: 'Missing token' },
      { status: 400 }
    )
  }

  const decoded = await adminAuth.verifyIdToken(idToken)

  const cookieStore = await cookies()

  cookieStore.set('session', decoded.uid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return NextResponse.json({ success: true })
}