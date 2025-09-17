"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation } from 'convex/react'
import { useAuth, useUser } from '@clerk/nextjs'
import { api } from '@workspace/backend/convex/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { CheckCircle2, Clock, Users, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { isSignedIn, isLoaded } = useAuth()
  const { user } = useUser()
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  
  const token = params.token as string
  
  // Get invitation details
  const invitation = useQuery(
    api.invitations.getInvitationByToken,
    token ? { token } : "skip"
  )
  
  // Accept invitation mutation
  const acceptInvitation = useMutation(api.invitations.acceptInvitation)
  
  // Decline invitation mutation
  const declineInvitation = useMutation(api.invitations.declineInvitation)
  
  const handleAcceptInvitation = async () => {
    if (!invitation || !isSignedIn) return
    
    setIsAccepting(true)
    try {
      await acceptInvitation({ token })
      toast.success('Invitation accepted successfully!')
      
      // Redirect based on invitation type
      if (invitation.type === 'task' && invitation.taskId) {
        router.push(`/dashboard/tasks`)
      } else if (invitation.type === 'project' && invitation.projectId) {
        router.push(`/dashboard/projects/${invitation.projectId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Failed to accept invitation')
      console.error('Error accepting invitation:', error)
    } finally {
      setIsAccepting(false)
    }
  }
  
  const handleDeclineInvitation = async () => {
    if (!invitation) return
    
    setIsDeclining(true)
    try {
      await declineInvitation({ token })
      toast.success('Invitation declined')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to decline invitation')
      console.error('Error declining invitation:', error)
    } finally {
      setIsDeclining(false)
    }
  }
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }
  
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Invalid Invitation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              This invitation link is invalid or has expired.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Check if invitation is expired
  const isExpired = invitation.expiresAt < Date.now()
  
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Invitation Expired
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              This invitation has expired. Please contact the person who invited you for a new invitation.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Check if already accepted
  if (invitation.status === 'accepted') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Already Accepted
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
              You have already accepted this invitation.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to accept this invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`)}
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push(`/sign-up?redirect_url=${encodeURIComponent(window.location.href)}`)}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Check if user email matches invitation email
  const emailMatches = user?.emailAddresses?.[0]?.emailAddress === invitation.email
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {invitation.type === 'task' ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {invitation.type === 'task' ? 'Task Assignment' : 'Team Invitation'}
          </CardTitle>
          <CardDescription>
            You've been invited to join Workstream
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Type</span>
                <Badge variant="secondary">
                  {invitation.type === 'task' ? 'Task Assignment' : 'Team Invitation'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</span>
                <Badge variant="outline">
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Expires</span>
                <span className="text-sm text-slate-900 dark:text-white">
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Custom Message */}
          {invitation.message && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 italic">
                "{invitation.message}"
              </p>
            </div>
          )}
          
          {/* Email Mismatch Warning */}
          {!emailMatches && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Email Mismatch
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    This invitation was sent to {invitation.email}, but you're signed in as {user?.emailAddresses?.[0]?.emailAddress}. 
                    You can still accept this invitation.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              onClick={handleAcceptInvitation}
              disabled={isAccepting}
              className="flex-1"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDeclineInvitation}
              disabled={isAccepting || isDeclining}
            >
              {isDeclining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
