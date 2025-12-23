import { Toaster } from 'react-hot-toast'
import HeaderServer from '@/components/Header.server'

export default function StorefrontLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <HeaderServer />
            {children}
            <Toaster position="bottom-center" />
        </>
    )
}
