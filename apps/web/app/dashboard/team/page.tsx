"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { 
  Plus, 
  Users, 
  Mail, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Trash2
} from "lucide-react"
import { InviteModal } from "@/components/team/invite-modal"
import { format } from "date-fns"
import { toast } from "sonner"

export default function TeamPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  
  const invitations = useQuery(
    api.invitations.getMyInvitations,
    isSignedIn && isLoaded ? {} : "skip"
  ) || []

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in to view team management</div>
  }

  const pendingInvitations = invitations.filter(inv => inv.status === "pending")
  const acceptedInvitations = invitations.filter(inv => inv.status === "accepted")
  const expiredInvitations = invitations.filter(inv => inv.status === "expired" || inv.status === "declined")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "declined":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "expired":
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "expired":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Invite team members and manage access to your projects
          </p>
        </div>
        <Button 
          onClick={() => setInviteModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Invitations</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {pendingInvitations.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Members</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {acceptedInvitations.length + 1} {/* +1 for current user */}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Invitations</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {invitations.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invitations</CardTitle>
          <CardDescription>
            Track the status of invitations you've sent
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No invitations sent yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start building your team by sending your first invitation
              </p>
              <Button 
                onClick={() => setInviteModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation._id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {invitation.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {invitation.email}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {invitation.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(invitation.createdAt, "MMM dd, yyyy")}
                        </div>
                        {invitation.projectId && (
                          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            Project Invitation
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      <Badge className={getStatusColor(invitation.status)}>
                        {invitation.status}
                      </Badge>
                    </div>

                    {invitation.status === "pending" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              // TODO: Implement cancel invitation
                              toast.info("Cancel invitation functionality coming soon")
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel Invitation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  )
}
