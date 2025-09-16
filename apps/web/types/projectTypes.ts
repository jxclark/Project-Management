export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ProjectMember {
  id: string
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  avatar?: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: Date
  endDate?: Date
  progress: number // 0-100
  color: string
  members: ProjectMember[]
  taskCount: number
  completedTasks: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateProjectData {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  startDate: Date
  endDate?: Date
  color: string
  memberIds: string[]
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string
}

export interface ProjectFilters {
  status?: ProjectStatus[]
  priority?: ProjectPriority[]
  search?: string
  members?: string[]
}
