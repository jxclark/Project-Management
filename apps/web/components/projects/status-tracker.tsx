"use client"

import { useState } from 'react'
import { Project, ProjectStatus } from '@/types/projectTypes'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Progress } from '@workspace/ui/components/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  XCircle, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'

interface StatusTrackerProps {
  project: Project
  onStatusChange?: (status: ProjectStatus) => void
  showTimeline?: boolean
}

const statusConfig = {
  planning: {
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    description: 'Project is in planning phase',
    nextActions: ['active']
  },
  active: {
    icon: Play,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    description: 'Project is actively being worked on',
    nextActions: ['on-hold', 'completed']
  },
  'on-hold': {
    icon: Pause,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    description: 'Project is temporarily paused',
    nextActions: ['active', 'cancelled']
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    description: 'Project has been completed successfully',
    nextActions: []
  },
  cancelled: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    description: 'Project has been cancelled',
    nextActions: ['planning']
  }
}

export function StatusTracker({ project, onStatusChange, showTimeline = true }: StatusTrackerProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  
  const currentStatus = statusConfig[project.status]
  const StatusIcon = currentStatus.icon

  // Calculate project health metrics
  const today = new Date()
  const daysRemaining = project.endDate ? differenceInDays(project.endDate, today) : null
  const isOverdue = project.endDate ? isAfter(today, project.endDate) : false
  const isNearDeadline = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0

  const getHealthStatus = () => {
    if (project.status === 'completed') return 'completed'
    if (project.status === 'cancelled') return 'cancelled'
    if (isOverdue) return 'overdue'
    if (isNearDeadline) return 'warning'
    if (project.progress < 25 && daysRemaining !== null && daysRemaining < 30) return 'behind'
    return 'on-track'
  }

  const healthStatus = getHealthStatus()
  const healthConfig = {
    'on-track': { color: 'text-green-600', icon: TrendingUp, label: 'On Track' },
    'warning': { color: 'text-yellow-600', icon: AlertTriangle, label: 'Near Deadline' },
    'behind': { color: 'text-orange-600', icon: Clock, label: 'Behind Schedule' },
    'overdue': { color: 'text-red-600', icon: AlertTriangle, label: 'Overdue' },
    'completed': { color: 'text-blue-600', icon: CheckCircle2, label: 'Completed' },
    'cancelled': { color: 'text-slate-600', icon: XCircle, label: 'Cancelled' }
  }

  const health = healthConfig[healthStatus]
  const HealthIcon = health.icon

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (onStatusChange) {
      setIsChangingStatus(true)
      try {
        await onStatusChange(newStatus)
      } finally {
        setIsChangingStatus(false)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Project Status
        </CardTitle>
        <CardDescription>
          Track progress and manage project lifecycle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", currentStatus.color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-'))}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <Badge className={currentStatus.color}>
                {project.status.replace('-', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {currentStatus.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <HealthIcon className={cn("w-4 h-4", health.color)} />
            <span className={cn("text-sm font-medium", health.color)}>
              {health.label}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {project.progress}%
            </span>
          </div>
          <Progress value={project.progress} className="h-3" />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{project.completedTasks} completed</span>
            <span>{project.taskCount} total tasks</span>
          </div>
        </div>

        {/* Timeline Info */}
        {showTimeline && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Start Date</p>
              <p className="font-medium">{format(project.startDate, 'MMM dd, yyyy')}</p>
            </div>
            {project.endDate && (
              <div>
                <p className="text-slate-600 dark:text-slate-400">Due Date</p>
                <p className={cn("font-medium", isOverdue ? "text-red-600" : "")}>
                  {format(project.endDate, 'MMM dd, yyyy')}
                </p>
                {daysRemaining !== null && (
                  <p className={cn("text-xs", 
                    isOverdue ? "text-red-600" : 
                    isNearDeadline ? "text-yellow-600" : "text-slate-500"
                  )}>
                    {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : 
                     daysRemaining === 0 ? 'Due today' :
                     `${daysRemaining} days remaining`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Quick Status Actions */}
        {currentStatus.nextActions.length > 0 && onStatusChange && (
          <div>
            <p className="text-sm font-medium mb-2">Quick Actions</p>
            <div className="flex gap-2 flex-wrap">
              {currentStatus.nextActions.map((status) => {
                const config = statusConfig[status as ProjectStatus]
                const ActionIcon = config.icon
                return (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(status as ProjectStatus)}
                    disabled={isChangingStatus}
                    className="flex items-center gap-2"
                  >
                    <ActionIcon className="w-3 h-3" />
                    Mark as {status.replace('-', ' ')}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Status History Placeholder */}
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-2">Recent Activity</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span>Status changed to {project.status}</span>
              <span className="text-xs">
                {format(project.updatedAt, 'MMM dd, HH:mm')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
