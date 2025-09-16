import { Id } from "@workspace/backend/convex/_generated/dataModel"

export type TaskStatus = "todo" | "in-progress" | "completed" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  _id: Id<"tasks">
  _creationTime: number
  projectId: Id<"projects">
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  dueDate?: number
  createdBy: string
  updatedAt: number
}

export interface CreateTaskData {
  title: string
  description?: string
  priority: TaskPriority
  assignedTo?: string
  dueDate?: Date
}

export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  dueDate?: Date
}

export interface TaskWithAssignee extends Task {
  assigneeName?: string
  assigneeAvatar?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  search?: string
}

export const TASK_STATUS_OPTIONS = [
  { value: "todo", label: "To Do", color: "bg-slate-100 text-slate-700" },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const

export const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
] as const
