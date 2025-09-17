"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { TaskForm } from "./task-form"
import { CreateTaskData, UpdateTaskData, TaskWithAssignee, TaskStatus } from "@/types/taskTypes"

interface TaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateTaskData | UpdateTaskData) => Promise<void>
  task?: TaskWithAssignee
  isLoading?: boolean
  projectMembers?: Array<{
    userId: string
    name: string
    email: string
    avatar?: string
  }>
  projectEndDate?: Date
}

export function TaskModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  task, 
  isLoading = false,
  projectMembers = [],
  projectEndDate
}: TaskModalProps) {
  const isEditing = !!task
  
  const handleSubmit = async (data: CreateTaskData | UpdateTaskData) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const initialData = task ? {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status as TaskStatus,
    assignedTo: task.assignedTo,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
  } : undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the task details and settings.'
              : 'Create a new task to track work and assign to team members.'
            }
          </DialogDescription>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          isLoading={isLoading}
          projectMembers={projectMembers}
          projectEndDate={projectEndDate}
        />
      </DialogContent>
    </Dialog>
  )
}
