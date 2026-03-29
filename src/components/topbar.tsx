'use client'

import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, Bell, Search } from 'lucide-react'

export function Topbar() {
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-border bg-brand-card/80 backdrop-blur-sm px-6">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search deals, contacts, tasks..."
          className="bg-transparent text-sm text-white placeholder:text-gray-500 outline-none w-full"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-primary" />
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-brand-primary">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.email || 'Loading...'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}