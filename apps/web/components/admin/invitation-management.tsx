"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { 
  Search, 
  Filter,
  MoreHorizontal,
  Mail,
  Check,
  X,
  Clock,
  RefreshCw,
  Trash2,
  Send,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAdminInvitations } from '@/hooks/use-admin-invitations'

export function InvitationManagement() {
  const { invitations, bulkActions, isLoading } = useAdminInvitations()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filter invitations
  const filteredInvitations = invitations?.filter((invitation: any) => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invitation.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesType = typeFilter === 'all' || invitation.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvitations(filteredInvitations.map((inv: any) => inv._id))
    } else {
      setSelectedInvitations([])
    }
  }

  const handleSelectInvitation = (invitationId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvitations(prev => [...prev, invitationId])
    } else {
      setSelectedInvitations(prev => prev.filter(id => id !== invitationId))
    }
  }

  const handleBulkAction = async (action: 'resend' | 'cancel' | 'delete') => {
    if (selectedInvitations.length === 0) return
    
    setActionLoading(action)
    try {
      await bulkActions[action](selectedInvitations)
      setSelectedInvitations([])
    } catch (error) {
      // Error handled in hook
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-200">Accepted</Badge>
      case 'declined':
        return <Badge variant="outline" className="text-red-600 border-red-200">Declined</Badge>
      case 'expired':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      workspace: 'bg-blue-100 text-blue-800',
      project: 'bg-purple-100 text-purple-800',
      task: 'bg-green-100 text-green-800'
    }
    
    return (
      <Badge variant="secondary" className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Bulk Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Invitation Management
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all workspace invitations
          </p>
        </div>
        
        {selectedInvitations.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {selectedInvitations.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('resend')}
              disabled={actionLoading === 'resend'}
            >
              <Send className="w-4 h-4 mr-2" />
              Resend
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('cancel')}
              disabled={actionLoading === 'cancel'}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              disabled={actionLoading === 'delete'}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by email or type..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workspace">Workspace</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            All Invitations
            {filteredInvitations.length > 0 && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({filteredInvitations.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-600 dark:text-slate-400">Loading invitations...</div>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Mail className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No invitations found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No invitations have been sent yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedInvitations.length === filteredInvitations.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvitations.map((invitation: any) => (
                    <TableRow key={invitation._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedInvitations.includes(invitation._id)}
                          onCheckedChange={(checked) => 
                            handleSelectInvitation(invitation._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(invitation.type)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {invitation.inviterName || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {formatDistanceToNow(new Date(invitation.createdAt))} ago
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {invitation.expiresAt 
                          ? formatDistanceToNow(new Date(invitation.expiresAt))
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {invitation.status === 'pending' && (
                              <>
                                <DropdownMenuItem>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
