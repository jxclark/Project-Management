"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { 
  Bell, 
  Check, 
  X, 
  MoreHorizontal, 
  Mail, 
  Users, 
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '@/hooks/use-notifications'
import { Id } from '@workspace/backend/convex/_generated/dataModel'

interface NotificationListProps {
  limit?: number
  showActions?: boolean
  onNotificationClick?: () => void
}

export function NotificationList({ 
  limit = 50, 
  showActions = true,
  onNotificationClick 
}: NotificationListProps) {
  const router = useRouter()
  const { notifications, markAsRead, deleteNotification, isLoading } = useNotifications()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invitation_accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'invitation_declined':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'invitation_expired':
        return <Clock className="w-4 h-4 text-orange-600" />
      case 'invitation_cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />
      case 'task_assigned':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case 'project_invitation':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'workspace_invitation':
        return <Mail className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      setActionLoading(notification._id)
      try {
        await markAsRead(notification._id)
      } catch (error) {
        // Error handled in hook
      } finally {
        setActionLoading(null)
      }
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }

    // Call callback if provided
    onNotificationClick?.()
  }

  const handleMarkAsRead = async (notificationId: Id<"notifications">) => {
    setActionLoading(notificationId)
    try {
      await markAsRead(notificationId)
    } catch (error) {
      // Error handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (notificationId: Id<"notifications">) => {
    setActionLoading(notificationId)
    try {
      await deleteNotification(notificationId)
    } catch (error) {
      // Error handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-600 dark:text-slate-400">Loading notifications...</div>
      </div>
    )
  }

  const displayNotifications = notifications?.slice(0, limit) || []

  if (displayNotifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Bell className="w-12 h-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No notifications
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-center">
          You're all caught up! New notifications will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayNotifications.map((notification) => (
        <Card 
          key={notification._id} 
          className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
            !notification.read ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : ''
          }`}
          onClick={() => handleNotificationClick(notification)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {formatDistanceToNow(new Date(notification.createdAt))} ago
                    </span>
                    {notification.read && notification.readAt && (
                      <>
                        <span>•</span>
                        <span>Read</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {showActions && (
                <div className="flex-shrink-0 ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={actionLoading === notification._id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!notification.read && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification._id)
                          }}
                          disabled={actionLoading === notification._id}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Mark as read
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification._id)
                        }}
                        disabled={actionLoading === notification._id}
                        className="text-red-600 dark:text-red-400"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
