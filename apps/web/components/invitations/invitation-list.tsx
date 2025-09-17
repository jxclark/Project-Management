"use client"

import { useState } from 'react'
import { useInvitations } from '@/hooks/use-invitations'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@workspace/ui/components/dropdown-menu'
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal,
  RefreshCw,
  Trash2,
  Calendar,
  User,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { toast } from 'sonner'

interface InvitationListProps {
  projectId?: Id<"projects">
}

export function InvitationList({ projectId }: InvitationListProps) {
  const { invitations, cancelInvitation, resendInvitation, isLoading } = useInvitations()
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleCancel = async (invitationId: Id<"invitations">) => {
    setActionLoading(invitationId)
    try {
      await cancelInvitation(invitationId)
    } catch (error) {
      // Error already handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  const handleResend = async (invitationId: Id<"invitations">) => {
    setActionLoading(invitationId)
    try {
      await resendInvitation(invitationId)
    } catch (error) {
      // Error already handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'expired':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case 'project':
        return <Users className="w-4 h-4 text-purple-600" />
      case 'workspace':
        return <User className="w-4 h-4 text-green-600" />
      default:
        return <Mail className="w-4 h-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-slate-600 dark:text-slate-400">Loading invitations...</div>
        </CardContent>
      </Card>
    )
  }

  if (!invitations || invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Mail className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No invitations sent
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-center">
            You haven't sent any invitations yet. Invite team members to collaborate on projects.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Filter by project if projectId is provided
  const filteredInvitations = projectId 
    ? invitations.filter(inv => inv.projectId === projectId)
    : invitations

  return (
    <div className="space-y-4">
      {filteredInvitations.map((invitation) => (
        <Card key={invitation._id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  {getTypeIcon(invitation.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {invitation.email}
                    </h4>
                    <Badge className={getStatusColor(invitation.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(invitation.status)}
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="capitalize">{invitation.type}</span>
                      {invitation.type !== 'workspace' && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{invitation.role}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {invitation.message && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">
                      "{invitation.message}"
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Sent {formatDistanceToNow(new Date(invitation.createdAt))} ago</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        Expires {formatDistanceToNow(new Date(invitation.expiresAt))} 
                        {invitation.expiresAt > Date.now() ? ' from now' : ' ago'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {invitation.status === 'pending' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={actionLoading === invitation._id}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleResend(invitation._id)}
                      disabled={actionLoading === invitation._id}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCancel(invitation._id)}
                      disabled={actionLoading === invitation._id}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
