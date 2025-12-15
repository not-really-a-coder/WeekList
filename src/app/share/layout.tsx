import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'WeekList Snapshot',
}

export default function ShareLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
