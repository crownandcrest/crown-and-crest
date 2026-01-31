import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import CartClient from './CartClient'

export const metadata: Metadata = {
    title: 'Shopping Cart | Lumière',
    description: 'Review your selected items and proceed to secure checkout.',
}

export default async function CartPage() {
    const user = await getCurrentUser()
    return <CartClient user={user ?? undefined} />
}
