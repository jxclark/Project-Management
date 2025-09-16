"use client"

import { Project, ProjectStatus, ProjectPriority } from '@/types/projectTypes'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { cn } from '@workspace/ui/lib/utils'
import { format } from 'date-fns'

interface ProjectCardProps {
  project: Project
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  onView?: (project: Project) => void
}

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  'on-hold': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
}

const priorityColors: Record<ProjectPriority, string> = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
}

export function ProjectCard({ project, onEdit, onDelete, onView }: ProjectCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white line-clamp-1">
              {project.name}
            </h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-3">
            {project.description}
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={() => onView(project)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(project)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-2 mb-4">
        <Badge className={cn("text-xs", statusColors[project.status])}>
          {project.status.replace('-', ' ')}
        </Badge>
        <Badge variant="outline" className={cn("text-xs", priorityColors[project.priority])}>
          {project.priority}
        </Badge>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Progress
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {project.progress}%
          </span>
        </div>
        <Progress value={project.progress} className="h-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {project.completedTasks}/{project.taskCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {project.members.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {project.endDate ? format(project.endDate, 'MMM dd') : 'No due date'}
          </span>
        </div>
      </div>

      {/* Team Members */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member, index) => (
            <div
              key={member.id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-800"
              title={member.name}
            >
              {member.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {project.members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-medium border-2 border-white dark:border-slate-800">
              +{project.members.length - 3}
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onView?.(project)}
          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Project
        </Button>
      </div>
    </div>
  )
}
