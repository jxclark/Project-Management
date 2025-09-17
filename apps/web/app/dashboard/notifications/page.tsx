"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { 
  Bell, 
  Search, 
  Filter,
  Check,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { NotificationList } from '@/components/notifications/notification-list'
import { useNotifications } from '@/hooks/use-notifications'

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllAsRead, isLoading } = useNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter notifications based on search and filters
  const filteredNotifications = notifications?.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && notification.read) ||
                         (statusFilter === 'unread' && !notification.read)
    
    return matchesSearch && matchesType && matchesStatus
  }) || []

  // Get statistics
  const stats = notifications ? {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    invitations: notifications.filter(n => n.type.includes('invitation')).length,
    tasks: notifications.filter(n => n.type === 'task_assigned').length,
  } : { total: 0, unread: 0, read: 0, invitations: 0, tasks: 0 }

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead()
    } catch (error) {
      // Error handled in hook
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated with your team activities and invitations
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unread</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.unread}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Read</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.read}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Invitations</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.invitations}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tasks</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.tasks}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Notifications
          </CardTitle>
          <CardDescription>
            Search and filter your notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="read">Read Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="invitation_accepted">Invitation Accepted</SelectItem>
                <SelectItem value="invitation_declined">Invitation Declined</SelectItem>
                <SelectItem value="invitation_expired">Invitation Expired</SelectItem>
                <SelectItem value="task_assigned">Task Assigned</SelectItem>
                <SelectItem value="project_invitation">Project Invitation</SelectItem>
                <SelectItem value="workspace_invitation">Workspace Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Your Notifications
            {filteredNotifications.length > 0 && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Click on notifications to view details and take actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-600 dark:text-slate-400">Loading notifications...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No matching notifications' 
                  : 'No notifications'
                }
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You\'re all caught up! New notifications will appear here.'
                }
              </p>
            </div>
          ) : (
            <NotificationList showActions={true} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
