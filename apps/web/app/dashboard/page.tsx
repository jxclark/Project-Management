import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Plus, TrendingUp, Clock, Users } from 'lucide-react'

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user.firstName || 'there'}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
        <Button variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Invite Team
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Projects</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
            </div>
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Tasks</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">0</div>
            </div>
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Team Members</h3>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">1</div>
            </div>
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Account created successfully</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
              <span className="text-slate-600 text-sm">2</span>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Create your first project</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center">
              <span className="text-slate-600 text-sm">3</span>
            </div>
            <span className="text-slate-600 dark:text-slate-300">Invite team members</span>
          </div>
        </div>
      </div>
    </div>
  )
}
