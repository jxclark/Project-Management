"use client"

import { useState } from 'react'
import { type ProjectFilters, ProjectStatus, ProjectPriority } from '@/types/projectTypes'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Badge } from '@workspace/ui/components/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover'
import { Search, Filter, X } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

interface ProjectFiltersProps {
  filters: ProjectFilters
  onFiltersChange: (filters: ProjectFilters) => void
}

const statusOptions: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'planning', label: 'Planning', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const priorityOptions: { value: ProjectPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-600' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

export function ProjectFilters({ filters, onFiltersChange }: ProjectFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)

  const updateFilters = (updates: Partial<ProjectFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleStatus = (status: ProjectStatus) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    
    updateFilters({ status: newStatuses.length > 0 ? newStatuses : undefined })
  }

  const togglePriority = (priority: ProjectPriority) => {
    const currentPriorities = filters.priority || []
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority]
    
    updateFilters({ priority: newPriorities.length > 0 ? newPriorities : undefined })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = filters.status?.length || filters.priority?.length || filters.search

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Search projects..."
          value={filters.search || ''}
          onChange={(e) => updateFilters({ search: e.target.value || undefined })}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {(filters.status?.length || 0) + (filters.priority?.length || 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((option) => {
                    const isSelected = filters.status?.includes(option.value)
                    return (
                      <Badge
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? option.color : "hover:bg-slate-100"
                        )}
                        onClick={() => toggleStatus(option.value)}
                      >
                        {option.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-3">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((option) => {
                    const isSelected = filters.priority?.includes(option.value)
                    return (
                      <Badge
                        key={option.value}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? option.color : "hover:bg-slate-100"
                        )}
                        onClick={() => togglePriority(option.value)}
                      >
                        {option.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {hasActiveFilters && (
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
