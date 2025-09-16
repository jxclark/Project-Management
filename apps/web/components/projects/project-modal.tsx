"use client"

import { CreateProjectData, Project } from '@/types/projectTypes'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ProjectForm } from './project-form'

interface ProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateProjectData) => void
  project?: Project
  isLoading?: boolean
}

export function ProjectModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  project, 
  isLoading 
}: ProjectModalProps) {
  const isEditing = !!project

  const handleSubmit = (data: CreateProjectData) => {
    onSubmit(data)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your project details and settings.'
              : 'Create a new project to organize your team\'s work and track progress.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={project}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
