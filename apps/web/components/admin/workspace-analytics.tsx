"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { useWorkspaceAnalytics } from '@/hooks/use-workspace-analytics'

export function WorkspaceAnalytics() {
  const { analytics, isLoading } = useWorkspaceAnalytics()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Workspace Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-600 dark:text-slate-400">Loading analytics...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = analytics || {
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamActivity: 0,
    monthlyGrowth: 0,
    weeklyActivity: []
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Workspace Analytics
        </CardTitle>
        <CardDescription>
          Key metrics and performance indicators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Activity className="w-4 h-4" />
              Active Projects
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalProjects}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              +{stats.monthlyGrowth}% this month
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4" />
              Tasks Completed
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.completedTasks}
            </div>
            <div className="text-xs text-slate-500">
              {stats.activeTasks} active
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="space-y-3">
          <h4 className="font-medium text-slate-900 dark:text-white">Weekly Activity</h4>
          <div className="space-y-2">
            {stats.weeklyActivity.map((day: any, index: number) => (
              <div key={day.day} className="flex items-center gap-3">
                <div className="w-8 text-xs text-slate-600 dark:text-slate-400">
                  {day.day}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((day.tasks / 20) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 w-8">
                    {day.tasks}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900 dark:text-white">Team Activity Score</h4>
            <span className="text-sm font-medium text-green-600">{stats.teamActivity}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${stats.teamActivity}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Based on member engagement and task completion rates
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
