"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from 'convex/react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@workspace/backend/convex/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  Edit, 
  Settings,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { formatDistanceToNow } from 'date-fns'
import { ProjectModal } from '@/components/projects/project-modal'
import { StatusTracker } from '@/components/projects/status-tracker'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskModal } from '@/components/tasks/task-modal'
import { TaskInviteModal } from '@/components/team/task-invite-modal'
import { useProjects } from '@/hooks/use-projects'
import { useTasks } from '@/hooks/use-tasks'
import { CreateProjectData, ProjectStatus } from '@/types/projectTypes'
import { CreateTaskData, UpdateTaskData, TaskWithAssignee, TaskStatus as TaskStatusType } from '@/types/taskTypes'
import { toast } from 'sonner'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskInviteModalOpen, setTaskInviteModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithAssignee | undefined>()
  const [invitingTask, setInvitingTask] = useState<{ id: string; title: string; projectName?: string } | undefined>()
  
  const projectId = params.id as Id<"projects">
  
  // Get project details
  const project = useQuery(
    api.projects.getProjectById,
    isSignedIn && isLoaded ? { projectId } : "skip"
  )
  
  // Get project members
  const members = useQuery(
    api.projects.getProjectMembers,
    isSignedIn && isLoaded ? { projectId } : "skip"
  )

  // Get project tasks
  const { tasks, createTask, updateTask, updateTaskStatus, deleteTask, isLoading: tasksLoading } = useTasks(projectId)

  // Get project update functions
  const { updateProject, updateProjectStatus, isLoading } = useProjects()

  const handleEditProject = async (data: CreateProjectData) => {
    if (!project) return
    
    try {
      await updateProject(project.id, data)
      setEditModalOpen(false)
      toast.success('Project updated successfully!')
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  const handleStatusChange = async (status: ProjectStatus) => {
    if (!project) return
    
    try {
      await updateProjectStatus(project.id, status)
      toast.success(`Project status updated to ${status.replace('-', ' ')}`)
    } catch (error) {
      toast.error('Failed to update project status')
    }
  }

  // Task handlers
  const handleCreateTask = async (data: CreateTaskData) => {
    try {
      await createTask(data)
      setTaskModalOpen(false)
      toast.success('Task created successfully!')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleEditTask = (task: TaskWithAssignee) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleUpdateTask = async (data: UpdateTaskData) => {
    if (!editingTask) return
    
    try {
      await updateTask(editingTask._id, data)
      setTaskModalOpen(false)
      setEditingTask(undefined)
      toast.success('Task updated successfully!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleTaskStatusChange = async (taskId: string, status: TaskStatusType) => {
    try {
      await updateTaskStatus(taskId, status)
      toast.success(`Task marked as ${status.replace('-', ' ')}`)
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast.success('Task deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleInviteToTask = (taskId: string, taskTitle: string) => {
    setInvitingTask({
      id: taskId,
      title: taskTitle,
      projectName: project?.name
    })
    setTaskInviteModalOpen(true)
  }

  const openEditModal = () => {
    setEditModalOpen(true)
  }

  const openTaskModal = () => {
    setEditingTask(undefined)
    setTaskModalOpen(true)
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">Project not found</p>
          <Button onClick={() => router.push('/dashboard/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'planning': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditModal}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {project.name}
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {project.description}
            </p>
            
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
              </Badge>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Progress
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {project.progress}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Start Date</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(project.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {project.endDate && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">End Date</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tasks</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {project.completedTasks}/{project.taskCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Members</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {members?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Tracker */}
        <div className="lg:col-span-2">
          <StatusTracker 
            project={{
              ...project,
              startDate: new Date(project.startDate),
              endDate: project.endDate ? new Date(project.endDate) : undefined,
              members: members?.map(member => ({
                id: member.userId,
                name: member.name,
                email: member.email,
                role: member.role,
                avatar: member.avatar,
              })) || [],
              createdAt: new Date(project.createdAt),
              updatedAt: new Date(project.updatedAt),
            }}
            onStatusChange={handleStatusChange}
            showTimeline={true}
          />
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              People working on this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {members?.map((member) => (
              <div key={member.userId} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {member.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <p className="text-sm text-slate-900 dark:text-white">
                    Project created
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {formatDistanceToNow(new Date(project.createdAt))} ago
                  </p>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No recent activity
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common project tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Project Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Tasks</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage project tasks and track progress
            </p>
          </div>
          <Button onClick={openTaskModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Tasks Grid */}
        {tasksLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-600 dark:text-slate-400">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-12 h-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No tasks yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                Create your first task to start tracking work and progress.
              </p>
              <Button onClick={openTaskModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => {
              // Find assignee info from members
              const assignee = members?.find(m => m.userId === task.assignedTo)
              const taskWithAssignee: TaskWithAssignee = {
                ...task,
                assigneeName: assignee?.name,
                assigneeAvatar: assignee?.avatar,
              }
              
              return (
                <TaskCard
                  key={task._id}
                  task={taskWithAssignee}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                  onInviteToTask={handleInviteToTask}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <ProjectModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleEditProject}
        project={project ? {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          startDate: new Date(project.startDate),
          endDate: project.endDate ? new Date(project.endDate) : undefined,
          color: project.color,
          progress: project.progress,
          taskCount: project.taskCount,
          completedTasks: project.completedTasks,
          createdBy: project.createdBy,
          members: members?.map(member => ({
            id: member.userId,
            name: member.name,
            email: member.email,
            role: member.role,
            avatar: member.avatar,
          })) || [],
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
        } : undefined}
        isLoading={isLoading}
      />

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSubmit={async (data) => {
          if (editingTask) {
            await handleUpdateTask(data as UpdateTaskData)
          } else {
            await handleCreateTask(data as CreateTaskData)
          }
        }}
        task={editingTask}
        isLoading={tasksLoading}
        projectMembers={members?.map(m => ({
          userId: m.userId,
          name: m.name,
          email: m.email,
          avatar: m.avatar,
        })) || []}
      />

      {/* Task Invite Modal */}
      {invitingTask && (
        <TaskInviteModal
          open={taskInviteModalOpen}
          onOpenChange={setTaskInviteModalOpen}
          taskId={invitingTask.id as any}
          taskTitle={invitingTask.title}
          projectName={invitingTask.projectName}
        />
      )}
    </div>
  )
}
