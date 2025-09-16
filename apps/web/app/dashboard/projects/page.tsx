"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Plus, Grid3X3, List, LayoutGrid } from 'lucide-react'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectModal } from '@/components/projects/project-modal'
import { ProjectFilters } from '@/components/projects/project-filters'
import { useProjects } from '@/hooks/use-projects'
import { CreateProjectData, ProjectFilters as ProjectFiltersType, Project } from '@/types/projectTypes'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@workspace/ui/components/alert-dialog'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'

export default function ProjectsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<ProjectFiltersType>({})
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const { 
    projects, 
    isLoading, 
    error, 
    createProject, 
    updateProject, 
    deleteProject, 
    filterProjects 
  } = useProjects()

  const filteredProjects = filterProjects(filters)

  const handleCreateProject = async (data: CreateProjectData) => {
    try {
      await createProject(data)
      setCreateModalOpen(false)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error('Failed to create project')
    }
  }

  const handleEditProject = async (data: CreateProjectData) => {
    if (!selectedProject) return
    
    try {
      await updateProject(selectedProject.id, data)
      setEditModalOpen(false)
      setSelectedProject(null)
      toast.success('Project updated successfully!')
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    
    try {
      await deleteProject(selectedProject.id)
      setDeleteDialogOpen(false)
      setSelectedProject(null)
      toast.success('Project deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete project')
    }
  }

  const openEditModal = (project: Project) => {
    setSelectedProject(project)
    setEditModalOpen(true)
  }

  const openDeleteDialog = (project: Project) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const handleViewProject = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage and track your team's projects
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="px-3"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Create Project Button */}
          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters */}
      <ProjectFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {filters.search || filters.status?.length || filters.priority?.length
              ? 'No projects match your filters'
              : 'No projects yet'
            }
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {filters.search || filters.status?.length || filters.priority?.length
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first project to get started with organizing your work'
            }
          </p>
          {!filters.search && !filters.status?.length && !filters.priority?.length && (
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
              onView={handleViewProject}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateProject}
        isLoading={isLoading}
      />

      {/* Edit Project Modal */}
      <ProjectModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSubmit={handleEditProject}
        project={selectedProject || undefined}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
              All tasks and data associated with this project will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
