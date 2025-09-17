"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { Input } from '@workspace/ui/components/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { 
  Mail, 
  Search, 
  Filter,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { InvitationList } from '@/components/invitations/invitation-list'
import { SendInvitationModal } from '@/components/invitations/send-invitation-modal'
import { useInvitations } from '@/hooks/use-invitations'

export default function InvitationsPage() {
  const { invitations, isLoading } = useInvitations()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showSendModal, setShowSendModal] = useState(false)

  // Filter invitations based on search and filters
  const filteredInvitations = invitations?.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    const matchesType = typeFilter === 'all' || invitation.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  }) || []

  // Get statistics
  const stats = invitations ? {
    total: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    declined: invitations.filter(inv => inv.status === 'declined').length,
    expired: invitations.filter(inv => inv.status === 'expired').length,
  } : { total: 0, pending: 0, accepted: 0, declined: 0, expired: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Invitations
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage invitations you've sent to team members
          </p>
        </div>
        <Button onClick={() => setShowSendModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.pending}
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Accepted</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.accepted}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Declined</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.declined}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Expired</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {stats.expired}
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
            Filter Invitations
          </CardTitle>
          <CardDescription>
            Search and filter your sent invitations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by email address..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
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

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sent Invitations
            {filteredInvitations.length > 0 && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({filteredInvitations.length} {filteredInvitations.length === 1 ? 'invitation' : 'invitations'})
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Manage and track the status of your sent invitations
          </CardDescription>
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
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No matching invitations' 
                  : 'No invitations sent'
                }
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t sent any invitations yet. Invite team members to collaborate on projects.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <Card key={invitation._id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          {invitation.type === 'task' ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          ) : invitation.type === 'project' ? (
                            <Users className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Mail className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {invitation.email}
                            </h4>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              invitation.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                : invitation.status === 'accepted'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                : invitation.status === 'declined'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                : invitation.status === 'expired'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            }`}>
                              {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-2">
                            <span className="capitalize">{invitation.type} invitation</span>
                            <span>•</span>
                            <span className="capitalize">{invitation.role} role</span>
                          </div>
                          
                          {invitation.message && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">
                              "{invitation.message}"
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                            <span>Sent {new Date(invitation.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>
                              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Invitation Modal */}
      <SendInvitationModal 
        open={showSendModal} 
        onOpenChange={setShowSendModal} 
      />
    </div>
  )
}
