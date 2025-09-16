"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { TaskCard } from "@/components/tasks/task-card"
import { TaskModal } from "@/components/tasks/task-modal"
import { useMyTasks, useTasks } from "@/hooks/use-tasks"
import { useProjects } from "@/hooks/use-projects"
import { CreateTaskData, UpdateTaskData, TaskWithAssignee, TaskStatus, TaskPriority, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "@/types/taskTypes"
import { toast } from "sonner"
import { format, isToday, isTomorrow, isThisWeek } from "date-fns"

export default function TasksPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { tasks, isLoading } = useMyTasks()
  const { projects } = useProjects()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskWithAssignee | undefined>()
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in to view tasks</div>
  }

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === "todo")
  const inProgressTasks = filteredTasks.filter(task => task.status === "in-progress")
  const completedTasks = filteredTasks.filter(task => task.status === "completed")

  // Get tasks by due date
  const todayTasks = filteredTasks.filter(task => 
    task.dueDate && isToday(new Date(task.dueDate)) && task.status !== "completed"
  )
  const tomorrowTasks = filteredTasks.filter(task => 
    task.dueDate && isTomorrow(new Date(task.dueDate)) && task.status !== "completed"
  )
  const thisWeekTasks = filteredTasks.filter(task => 
    task.dueDate && isThisWeek(new Date(task.dueDate)) && task.status !== "completed"
  )

  const handleEditTask = (task: TaskWithAssignee) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleTaskSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    if (!selectedProjectId && !editingTask) {
      toast.error('Please select a project first')
      return
    }

    try {
      if (editingTask) {
        // Handle task update - use the project's task management
        const project = projects.find(p => p.id === editingTask.projectId)
        if (project) {
          // For now, show info message since we need project-specific task management
          toast.info('Task editing from this page will be implemented soon. Please edit tasks from the project details page.')
        }
      } else {
        // Handle task creation - redirect to project details with task creation
        if (selectedProjectId) {
          window.location.href = `/dashboard/projects/${selectedProjectId}?createTask=true`
        }
      }
      setTaskModalOpen(false)
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task')
    }
  }

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      // This would need the task status update functionality
      toast.error('Task status updates from this page are not yet implemented')
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // This would need the task delete functionality
      toast.error('Task deletion from this page is not yet implemented')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const openTaskModal = () => {
    setEditingTask(undefined)
    setTaskModalOpen(true)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPriorityFilter("all")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track all your assigned tasks across projects
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Task in Project
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {projects.length === 0 ? (
              <DropdownMenuItem disabled>
                No projects available
              </DropdownMenuItem>
            ) : (
              projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => window.location.href = `/dashboard/projects/${project.id}`}
                >
                  {project.name}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">To Do</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todoTasks.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {inProgressTasks.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Due Today</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {todayTasks.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {completedTasks.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {TASK_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || statusFilter !== "all" || priorityFilter !== "all") && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-600 dark:text-slate-400">Loading tasks...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {tasks.length === 0 ? "No tasks assigned" : "No tasks match your filters"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
              {tasks.length === 0 
                ? "Tasks will appear here when they are assigned to you in projects. To create tasks, go to a project and add them there."
                : "Try adjusting your search or filter criteria."
              }
            </p>
            {tasks.length === 0 && (
              <Button onClick={openTaskModal}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Due Today Section */}
          {todayTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Due Today ({todayTasks.length})
              </h2>
              <div className="grid gap-4">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Tasks Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              All Tasks ({filteredTasks.length})
            </h2>
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleTaskStatusChange}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        onSubmit={handleTaskSubmit}
        task={editingTask}
        isLoading={isLoading}
        projectMembers={[]} // No project context in this view
      />
    </div>
  )
}
