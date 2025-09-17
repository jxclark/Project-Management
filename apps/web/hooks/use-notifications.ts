import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

export function useNotifications() {
  const { isSignedIn, isLoaded } = useUser()
  
  // Only query notifications if user is authenticated
  const shouldQuery = isLoaded && isSignedIn
  
  // Get all notifications for current user
  const notifications = useQuery(
    api.notifications.getMyNotifications, 
    shouldQuery ? {
      limit: 50,
      unreadOnly: false
    } : "skip"
  )
  
  // Get unread notifications only
  const unreadNotifications = useQuery(
    api.notifications.getMyNotifications, 
    shouldQuery ? {
      limit: 20,
      unreadOnly: true
    } : "skip"
  )
  
  // Get unread count
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    shouldQuery ? {} : "skip"
  )
  
  // Mutations
  const markAsReadMutation = useMutation(api.notifications.markAsRead)
  const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead)
  const deleteNotificationMutation = useMutation(api.notifications.deleteNotification)

  const markAsRead = async (notificationId: Id<"notifications">) => {
    try {
      await markAsReadMutation({ notificationId })
    } catch (error) {
      toast.error('Failed to mark notification as read')
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      const count = await markAllAsReadMutation({})
      if (count > 0) {
        toast.success(`Marked ${count} notifications as read`)
      }
      return count
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
      throw error
    }
  }

  const deleteNotification = async (notificationId: Id<"notifications">) => {
    try {
      await deleteNotificationMutation({ notificationId })
      toast.success('Notification deleted')
    } catch (error) {
      toast.error('Failed to delete notification')
      throw error
    }
  }


  return {
    notifications,
    unreadNotifications,
    unreadCount: unreadCount || 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isLoading: !isLoaded || (shouldQuery && notifications === undefined),
  }
}
