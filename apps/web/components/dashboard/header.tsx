"use client"

import { UserButton } from '@clerk/nextjs'
import { Search } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { NotificationBell } from '@/components/notifications/notification-bell'

export function DashboardHeader() {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400 ml-3" />
          <Input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 sm:text-sm bg-transparent"
            placeholder="Search projects, tasks, or team members..."
            type="search"
            name="search"
          />
        </form>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Notifications */}
        <NotificationBell />

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700" />

        {/* Profile dropdown */}
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "w-8 h-8"
            }
          }}
        />
      </div>
    </div>
  )
}
