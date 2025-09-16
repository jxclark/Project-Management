"use client"

import { useMutation, useQuery } from "convex/react"
import { useAuth } from "@clerk/nextjs"
import { api } from "@workspace/backend/convex/_generated/api"
import { Project, CreateProjectData, ProjectFilters, ProjectStatus } from '@/types/projectTypes'
import { Id } from "@workspace/backend/convex/_generated/dataModel"

export function useProjects() {
  const { isSignedIn, isLoaded } = useAuth()
  
  // Only query when user is authenticated and auth is loaded
  const projectsData = useQuery(
    api.projects.getProjects, 
    isSignedIn && isLoaded ? {} : "skip"
  ) || []
  
  // Convert timestamps to Date objects for frontend use
  const projects = projectsData.map(project => ({
    ...project,
    startDate: new Date(project.startDate),
    endDate: project.endDate ? new Date(project.endDate) : undefined,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }))
  const createProjectMutation = useMutation(api.projects.createProject)
  const updateProjectMutation = useMutation(api.projects.updateProject)
  const updateProjectStatusMutation = useMutation(api.projects.updateProjectStatus)
  const deleteProjectMutation = useMutation(api.projects.deleteProject)

  const createProject = async (data: CreateProjectData): Promise<void> => {
    try {
      await createProjectMutation({
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate.getTime(),
        endDate: data.endDate?.getTime(),
        color: data.color,
        memberIds: data.memberIds || [],
      })
    } catch (error) {
      console.error('Failed to create project:', error)
      throw new Error('Failed to create project')
    }
  }

  const updateProject = async (id: string, data: Partial<CreateProjectData>): Promise<void> => {
    try {
      const updates: any = {}
      
      if (data.name !== undefined) updates.name = data.name
      if (data.description !== undefined) updates.description = data.description
      if (data.status !== undefined) updates.status = data.status
      if (data.priority !== undefined) updates.priority = data.priority
      if (data.startDate !== undefined) updates.startDate = data.startDate.getTime()
      if (data.endDate !== undefined) updates.endDate = data.endDate?.getTime()
      if (data.color !== undefined) updates.color = data.color

      await updateProjectMutation({
        id: id as Id<"projects">,
        ...updates,
      })
    } catch (error) {
      console.error('Failed to update project:', error)
      throw new Error('Failed to update project')
    }
  }

  const updateProjectStatus = async (id: string, status: ProjectStatus): Promise<void> => {
    try {
      await updateProjectStatusMutation({
        projectId: id as Id<"projects">,
        status,
      })
    } catch (error) {
      console.error('Failed to update project status:', error)
      throw new Error('Failed to update project status')
    }
  }

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await deleteProjectMutation({
        id: id as Id<"projects">,
      })
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw new Error('Failed to delete project')
    }
  }

  const filterProjects = (filters: ProjectFilters): Project[] => {
    return projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          project.name.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(project.status)) return false
      }

      // Priority filter
      if (filters.priority && filters.priority.length > 0) {
        if (!filters.priority.includes(project.priority)) return false
      }

      // Members filter (if implemented)
      if (filters.members && filters.members.length > 0) {
        const hasMatchingMember = project.members.some(member => 
          filters.members!.includes(member.id)
        )
        if (!hasMatchingMember) return false
      }

      return true
    })
  }

  return {
    projects,
    isLoading: !isLoaded || (isSignedIn && projectsData === undefined),
    error: null, // Convex handles errors differently
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    filterProjects,
  }
}
