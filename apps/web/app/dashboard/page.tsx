"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Plus, Users, CheckSquare, BarChart3, Calendar, Bell, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useInitUser } from "@/hooks/use-init-user"
import { useProjects } from "@/hooks/use-projects"
import { useMyTasks } from "@/hooks/use-tasks"
import { ProjectModal } from "@/components/projects/project-modal"
import { InviteModal } from "@/components/team/invite-modal"
import { CreateProjectData } from "@/types/projectTypes"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { projects, isLoading: projectsLoading, createProject } = useProjects()
  const { tasks, isLoading: tasksLoading } = useMyTasks()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  
  // Initialize user data in Convex
  useInitUser()

  // Get invitations to calculate team member count
  const invitations = useQuery(
    api.invitations.getMyInvitations,
    user && isLoaded ? {} : "skip"
  ) || []

  // Calculate active tasks (not completed or cancelled)
  const activeTasks = tasks.filter(task => 
    task.status !== "completed" && task.status !== "cancelled"
  )

  // Calculate team member count (current user + accepted invitations)
  const acceptedInvitations = invitations.filter(inv => inv.status === "accepted")
  const teamMemberCount = acceptedInvitations.length + 1 // +1 for current user

  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      await createProject(data)
      setCreateModalOpen(false)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user.firstName || 'there'}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        <Link href="/dashboard/tasks">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </Link>
        <Button 
          variant="outline"
          onClick={() => setInviteModalOpen(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          Invite Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Projects</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {projectsLoading ? "..." : projects.length}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Tasks</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {tasksLoading ? "..." : activeTasks.length}
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Team Members</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {teamMemberCount}
              </div>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Account created successfully</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              projects.length > 0 
                ? 'bg-green-500' 
                : 'bg-slate-300'
            }`}>
              <span className={`text-sm ${
                projects.length > 0 
                  ? 'text-white' 
                  : 'text-slate-600'
              }`}>
                {projects.length > 0 ? '✓' : '2'}
              </span>
            </div>
            <span className={`${
              projects.length > 0 
                ? 'text-slate-600 dark:text-slate-300' 
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              Create your first project {projects.length > 0 && `(${projects.length} created)`}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              teamMemberCount > 1 
                ? 'bg-green-500' 
                : 'bg-slate-300'
            }`}>
              <span className={`text-sm ${
                teamMemberCount > 1 
                  ? 'text-white' 
                  : 'text-slate-600'
              }`}>
                {teamMemberCount > 1 ? '✓' : '3'}
              </span>
            </div>
            <span className={`${
              teamMemberCount > 1 
                ? 'text-slate-600 dark:text-slate-300' 
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              Invite team members {teamMemberCount > 1 && `(${teamMemberCount} members)`}
            </span>
          </div>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateProject}
        isLoading={projectsLoading}
      />

      {/* Invite Modal */}
      <InviteModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  )
}
