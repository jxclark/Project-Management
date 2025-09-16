"use client"

import { useMutation, useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "@workspace/backend/convex/_generated/api"
import { CreateTaskData, UpdateTaskData, TaskStatus, Task } from '@/types/taskTypes'
import { Id } from "@workspace/backend/convex/_generated/dataModel"

export function useTasks(projectId?: Id<"projects">) {
  const { isSignedIn, isLoaded } = useAuth()
  
  // Only query when user is authenticated and projectId is provided
  const tasksData = useQuery(
    api.tasks.getProjectTasks, 
    isSignedIn && isLoaded && projectId ? { projectId } : "skip"
  ) || []

  // Keep tasks as-is since Task interface expects timestamps as numbers
  const tasks = tasksData

  const createTaskMutation = useMutation(api.tasks.createTask)
  const updateTaskMutation = useMutation(api.tasks.updateTask)
  const updateTaskStatusMutation = useMutation(api.tasks.updateTaskStatus)
  const deleteTaskMutation = useMutation(api.tasks.deleteTask)

  const createTask = async (data: CreateTaskData): Promise<void> => {
    if (!projectId) throw new Error("Project ID is required")
    
    try {
      await createTaskMutation({
        projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignedTo: data.assignedTo === "unassigned" ? undefined : data.assignedTo,
        dueDate: data.dueDate?.getTime(),
      })
    } catch (error) {
      console.error('Failed to create task:', error)
      throw new Error('Failed to create task')
    }
  }

  const updateTask = async (id: string, updates: UpdateTaskData): Promise<void> => {
    try {
      await updateTaskMutation({
        id: id as Id<"tasks">,
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        assignedTo: updates.assignedTo === "unassigned" ? undefined : updates.assignedTo,
        dueDate: updates.dueDate?.getTime(),
      })
    } catch (error) {
      console.error('Failed to update task:', error)
      throw new Error('Failed to update task')
    }
  }

  const updateTaskStatus = async (id: string, status: TaskStatus): Promise<void> => {
    try {
      await updateTaskStatusMutation({
        taskId: id as Id<"tasks">,
        status,
      })
    } catch (error) {
      console.error('Failed to update task status:', error)
      throw new Error('Failed to update task status')
    }
  }

  const deleteTask = async (id: string): Promise<void> => {
    try {
      await deleteTaskMutation({
        id: id as Id<"tasks">,
      })
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw new Error('Failed to delete task')
    }
  }

  return {
    tasks,
    isLoading: !isLoaded || (isSignedIn && projectId && tasksData === undefined),
    error: null, // Convex handles errors differently
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  }
}

export function useMyTasks() {
  const { isSignedIn, isLoaded } = useAuth()
  
  const tasksData = useQuery(
    api.tasks.getMyTasks, 
    isSignedIn && isLoaded ? {} : "skip"
  ) || []

  const tasks = tasksData

  return {
    tasks,
    isLoading: !isLoaded || (isSignedIn && tasksData === undefined),
    error: null,
  }
}
