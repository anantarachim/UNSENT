'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import ToastContainer from '@/components/ui/ToastContainer'
import { useApp } from '@/context/AppContext'
import SetupModal from '@/components/ui/SetupModal'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, hydrated } = useApp()

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-600">Loading your space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area — offset by sidebar on lg */}
      <div className="lg:pl-[240px] flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1200px] w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      <ToastContainer />

      {/* First-time setup */}
      {!user.setupComplete && <SetupModal />}
    </div>
  )
}
