"use client"

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Shield, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const makeCurrentUserAdmin = useMutation(api.users.makeCurrentUserAdmin)

  const handleMakeAdmin = async () => {
    setIsLoading(true)
    try {
      await makeCurrentUserAdmin({})
      setIsAdmin(true)
      toast.success('You are now an admin! You can access the admin dashboard.')
    } catch (error) {
      toast.error('Failed to make you an admin')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Admin Setup Complete
            </CardTitle>
            <CardDescription>
              You now have admin privileges and can access all admin features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              You can now access the admin dashboard to manage workspace members, invitations, and view analytics.
            </p>
            <div className="flex gap-4">
              <Button onClick={() => window.location.href = '/dashboard/admin'}>
                Go to Admin Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Admin Setup Required
          </CardTitle>
          <CardDescription>
            You need admin privileges to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              What happens when you become an admin?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Access to workspace management features</li>
              <li>• Ability to manage user roles and permissions</li>
              <li>• View and manage all workspace invitations</li>
              <li>• Access to workspace analytics and insights</li>
              <li>• Bulk invitation management capabilities</li>
            </ul>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
            <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              Development Note
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              This is a one-time setup for development purposes. In production, admin roles would be assigned through proper user management workflows.
            </p>
          </div>

          <Button 
            onClick={handleMakeAdmin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Setting up admin access...' : 'Make Me Admin'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
