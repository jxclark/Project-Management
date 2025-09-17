"use client"

import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { 
  Users, 
  Mail, 
  Shield, 
  BarChart3,
  Settings,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { InvitationManagement } from '@/components/admin/invitation-management'
import { UserRoleManagement } from '@/components/admin/user-role-management'
import { WorkspaceAnalytics } from '@/components/admin/workspace-analytics'
import { MemberOverview } from '@/components/admin/member-overview'
import { useWorkspaceMembers } from '@/hooks/use-workspace-members'
import { useWorkspaceAnalytics } from '@/hooks/use-workspace-analytics'
import { useAdminInvitations } from '@/hooks/use-admin-invitations'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const { members } = useWorkspaceMembers()
  const { analytics } = useWorkspaceAnalytics()
  const { invitations } = useAdminInvitations()

  // Calculate real stats
  const totalMembers = members?.length || 0
  const activeMembers = members?.filter(m => m.status === 'active').length || 0
  const pendingInvites = invitations?.filter(i => i.status === 'pending').length || 0
  const issues = members?.filter(m => m.status === 'suspended').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage workspace members, invitations, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Administrator
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quick Stats Cards */}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total Members</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {totalMembers}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Active Members</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {activeMembers}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pending Invites</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {pendingInvites}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Issues</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {issues}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics and Member Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WorkspaceAnalytics />
            <MemberOverview />
          </div>
        </TabsContent>

        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <InvitationManagement />
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members">
          <MemberOverview showFullView={true} />
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <UserRoleManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
