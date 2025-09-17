"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Bell, Check } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { NotificationList } from './notification-list'
import { useUser } from '@clerk/nextjs'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { isSignedIn, isLoaded } = useUser()
  const { unreadCount, markAllAsRead } = useNotifications()

  // Don't render if user is not authenticated
  if (!isLoaded || !isSignedIn) {
    return null
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      // Error already handled in hook
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          <NotificationList 
            limit={10} 
            showActions={false}
            onNotificationClick={() => setOpen(false)}
          />
        </div>
        <div className="p-3 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => {
              setOpen(false)
              // Navigate to notifications page
              window.location.href = '/dashboard/notifications'
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
