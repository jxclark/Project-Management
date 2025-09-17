"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { 
  Users, 
  Crown,
  Shield,
  User,
  Eye,
  MoreHorizontal,
  UserPlus,
  Activity,
  Settings,
  UserX,
  UserCheck
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useWorkspaceMembers } from '@/hooks/use-workspace-members'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@workspace/ui/components/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'

interface MemberOverviewProps {
  showFullView?: boolean
}

export function MemberOverview({ showFullView = false }: MemberOverviewProps) {
  const { members, isLoading, updateMemberRole, removeMember, updateMemberStatus } = useWorkspaceMembers()
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState('')

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-600" />
      case 'manager': return <Shield className="w-3 h-3 text-blue-600" />
      case 'member': return <User className="w-3 h-3 text-green-600" />
      case 'viewer': return <Eye className="w-3 h-3 text-gray-600" />
      default: return <User className="w-3 h-3 text-green-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: 'bg-yellow-100 text-yellow-800',
      manager: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <Badge variant="secondary" className={roleConfig[role as keyof typeof roleConfig] || roleConfig.member}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </Badge>
    )
  }

  const openRoleDialog = (member: any) => {
    setSelectedMember(member)
    setNewRole(member.role)
    setIsRoleDialogOpen(true)
  }

  const handleRoleChange = async () => {
    if (!selectedMember?._id || !newRole) return
    
    try {
      await updateMemberRole(selectedMember._id as string, newRole)
      setIsRoleDialogOpen(false)
      setSelectedMember(null)
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleStatusToggle = async (member: any) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active'
    
    if (!member._id) return
    
    try {
      await updateMemberStatus(member._id!, newStatus)
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleRemoveMember = async (member: any) => {
    if (!member._id) return
    
    if (confirm(`Are you sure you want to remove ${member.name || member.email} from the workspace?`)) {
      try {
        await removeMember(member._id!)
      } catch (error) {
        // Error handled in hook
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-600 dark:text-slate-400">Loading members...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayMembers = showFullView ? members : members?.slice(0, 6)
  const recentMembers = members?.filter(m => m.joinedAt && 
    new Date(m.joinedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ) || []

  return (
    <div className="space-y-6">
      {/* Member Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
                {members && (
                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    ({members.length})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {showFullView ? 'All workspace members' : 'Recent team members and activity'}
              </CardDescription>
            </div>
            {!showFullView && (
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!displayMembers || displayMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No members found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                Invite team members to get started with collaboration.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {member.name || 'Unknown'}
                        </h4>
                        {getRoleBadge(member.role)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {member.email}
                      </p>
                      {member.lastActiveAt && (
                        <p className="text-xs text-slate-500">
                          Active {formatDistanceToNow(new Date(member.lastActiveAt))} ago
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status || 'active'}
                    </Badge>
                    {showFullView && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Change Role
                          </DropdownMenuItem>
                          {member.status === 'active' ? (
                            <DropdownMenuItem onClick={() => handleStatusToggle(member)}>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusToggle(member)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveMember(member)}>
                            <UserX className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
              
              {!showFullView && members && members.length > 6 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Members ({members.length - 6} more)
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity - Only show in overview mode */}
      {!showFullView && recentMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Additions
            </CardTitle>
            <CardDescription>
              New members who joined this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">
                        {member.name || 'Unknown'}
                      </span>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Joined {formatDistanceToNow(new Date(member.joinedAt!))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for {selectedMember?.name || selectedMember?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      Manager - Project management
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      Member - Standard access
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-600" />
                      Viewer - Read-only access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Role Permissions:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                {newRole === 'admin' && (
                  <>
                    <li>• Full workspace management</li>
                    <li>• User and role management</li>
                    <li>• Billing and settings</li>
                  </>
                )}
                {newRole === 'manager' && (
                  <>
                    <li>• Create and manage projects</li>
                    <li>• Invite team members</li>
                    <li>• View analytics</li>
                  </>
                )}
                {newRole === 'member' && (
                  <>
                    <li>• Create and edit tasks</li>
                    <li>• Collaborate on projects</li>
                    <li>• View team content</li>
                  </>
                )}
                {newRole === 'viewer' && (
                  <>
                    <li>• View projects and tasks</li>
                    <li>• Read-only access</li>
                    <li>• Cannot edit content</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
