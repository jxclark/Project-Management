"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { 
  Search, 
  Shield,
  MoreHorizontal,
  UserCheck,
  UserX,
  Settings,
  Crown,
  User,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useWorkspaceMembers } from '@/hooks/use-workspace-members'

interface RoleChangeDialogProps {
  member: any
  isOpen: boolean
  onClose: () => void
  onConfirm: (memberId: string, newRole: string) => void
}

function RoleChangeDialog({ member, isOpen, onClose, onConfirm }: RoleChangeDialogProps) {
  const [newRole, setNewRole] = useState(member?.role || 'member')

  const handleConfirm = () => {
    onConfirm(member._id, newRole)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Update the role for {member?.name || member?.email}
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
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function UserRoleManagement() {
  const { members, updateMemberRole, removeMember, isLoading } = useWorkspaceMembers()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)

  // Filter members
  const filteredMembers = members?.filter((member: any) => {
    const matchesSearch = member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    
    return matchesSearch && matchesRole
  }) || []

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-yellow-100 text-yellow-800', icon: Crown },
      manager: { color: 'bg-blue-100 text-blue-800', icon: Shield },
      member: { color: 'bg-green-100 text-green-800', icon: User },
      viewer: { color: 'bg-gray-100 text-gray-800', icon: Eye }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member
    const Icon = config.icon
    
    return (
      <Badge variant="secondary" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    )
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRole(memberId, newRole)
    } catch (error) {
      // Error handled in hook
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the workspace?')) {
      try {
        await removeMember(memberId)
      } catch (error) {
        // Error handled in hook
      }
    }
  }

  const openRoleDialog = (member: any) => {
    setSelectedMember(member)
    setIsRoleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          User Role Management
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Manage user roles and permissions in your workspace
        </p>
      </div>

      {/* Role Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Admins</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {members?.filter((m: any) => m.role === 'admin').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Managers</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {members?.filter((m: any) => m.role === 'manager').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {members?.filter((m: any) => m.role === 'member').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Viewers</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {members?.filter((m: any) => m.role === 'viewer').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Members
            {filteredMembers.length > 0 && (
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                ({filteredMembers.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-600 dark:text-slate-400">Loading members...</div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Shield className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No members found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                {searchQuery || roleFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No members in this workspace yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member: any) => (
                    <TableRow key={member._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.imageUrl} />
                            <AvatarFallback>
                              {member.name?.charAt(0) || member.email?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {member.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(member.role)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                          {member.status || 'active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {member.joinedAt 
                          ? formatDistanceToNow(new Date(member.joinedAt)) + ' ago'
                          : 'Unknown'
                        }
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {member.lastActiveAt 
                          ? formatDistanceToNow(new Date(member.lastActiveAt)) + ' ago'
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
                            <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            {member.status === 'active' ? (
                              <DropdownMenuItem>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleRemoveMember(member._id)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Remove Member
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

      {/* Role Change Dialog */}
      <RoleChangeDialog
        member={selectedMember}
        isOpen={isRoleDialogOpen}
        onClose={() => setIsRoleDialogOpen(false)}
        onConfirm={handleRoleChange}
      />
    </div>
  )
}
