import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suno Proposals | Neonblue',
  description: 'Campaign test proposals for Suno',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
