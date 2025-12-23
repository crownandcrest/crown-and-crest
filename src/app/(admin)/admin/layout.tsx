import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AdminLayout from './AdminLayout'

// Admin UID allowlist
// To grant admin access: Add firebase_uid to this array
const ADMIN_UIDS = process.env.ADMIN_UIDS?.split(',') || []

async function checkAdminAuth() {
    const user = await getCurrentUser()

    if (!user) {
        return { isAuthenticated: false, isAdmin: false }
    }

    // Verify user UID is in admin allowlist
    const isAdmin = ADMIN_UIDS.includes(user.uid)

    return { isAuthenticated: true, isAdmin }
}

export default async function Layout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isAdmin } = await checkAdminAuth()

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        redirect('/auth/login?redirect=/admin')
    }

    // Authenticated but not admin → 403 forbidden
    if (!isAdmin) {
        return (
            <html>
                <body>
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h1>403 Forbidden</h1>
                        <p>You do not have permission to access this resource.</p>
                    </div>
                </body>
            </html>
        )
    }

    return <AdminLayout>{children}</AdminLayout>
}
