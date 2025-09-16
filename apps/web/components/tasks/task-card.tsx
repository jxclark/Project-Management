"use client"

import { useState } from "react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  MoreHorizontal,
  Calendar,
  User,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react"
import { TaskWithAssignee, TaskStatus, TaskPriority, TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "@/types/taskTypes"
import { format, isAfter, isToday, isTomorrow } from "date-fns"

interface TaskCardProps {
  task: TaskWithAssignee
  onEdit?: (task: TaskWithAssignee) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, status: TaskStatus) => void
  compact?: boolean
}

export function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  compact = false 
}: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const statusOption = TASK_STATUS_OPTIONS.find(s => s.value === task.status)
  const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === task.priority)

  const handleStatusToggle = async () => {
    if (!onStatusChange) return
    
    setIsLoading(true)
    try {
      const newStatus: TaskStatus = task.status === "completed" ? "todo" : "completed"
      await onStatusChange(task._id, newStatus)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Circle className="w-4 h-4 text-slate-400" />
    }
  }

  const getDueDateInfo = () => {
    if (!task.dueDate) return null
    
    const dueDate = new Date(task.dueDate)
    const isOverdue = isAfter(new Date(), dueDate) && task.status !== "completed"
    
    let dateText = format(dueDate, "MMM dd")
    if (isToday(dueDate)) dateText = "Today"
    if (isTomorrow(dueDate)) dateText = "Tomorrow"
    
    return {
      text: dateText,
      isOverdue,
      className: isOverdue 
        ? "text-red-600 bg-red-50" 
        : isToday(dueDate) || isTomorrow(dueDate)
        ? "text-orange-600 bg-orange-50"
        : "text-slate-600 bg-slate-50"
    }
  }

  const dueDateInfo = getDueDateInfo()

  return (
    <Card className={`transition-all hover:shadow-md ${
      task.status === "completed" ? "opacity-75" : ""
    } ${compact ? "p-3" : ""}`}>
      <CardContent className={compact ? "p-0" : "p-4"}>
        <div className="flex items-start gap-3">
          {/* Status Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={handleStatusToggle}
            disabled={isLoading}
          >
            {getStatusIcon()}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-medium text-sm ${
                task.status === "completed" 
                  ? "line-through text-slate-500" 
                  : "text-slate-900 dark:text-white"
              }`}>
                {task.title}
              </h3>
              
              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(task._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Task
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Description */}
            {task.description && !compact && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Badges and Meta */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Status Badge */}
              <Badge variant="secondary" className={`text-xs ${statusOption?.color}`}>
                {statusOption?.label}
              </Badge>

              {/* Priority Badge */}
              <Badge variant="outline" className={`text-xs ${priorityOption?.color}`}>
                {priorityOption?.label}
              </Badge>

              {/* Due Date */}
              {dueDateInfo && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${dueDateInfo.className}`}>
                  <Calendar className="w-3 h-3" />
                  {dueDateInfo.text}
                </div>
              )}

              {/* Assignee */}
              {task.assignedTo && (
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  {task.assigneeAvatar ? (
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={task.assigneeAvatar} />
                      <AvatarFallback className="text-xs">
                        {task.assigneeName?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  <span className="truncate max-w-20">
                    {task.assigneeName || "Assigned"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
