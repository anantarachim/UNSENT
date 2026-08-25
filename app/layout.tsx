import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from '@/context/AppContext'
import AppLayout from '@/components/layout/AppLayout'

export const metadata: Metadata = {
  title: 'UNSENT — Healing Journal',
  description: 'A private space to process, heal, and grow after a long relationship.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </AppProvider>
      </body>
    </html>
  )
}
