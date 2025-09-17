import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { toast } from 'sonner'

export function useInvitations() {
  // Get all invitations sent by current user
  const invitations = useQuery(api.invitations.getMyInvitations)
  
  // Send invitation mutation
  const sendInvitationMutation = useMutation(api.invitations.sendInvitation)
  
  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation(api.invitations.cancelInvitation)
  
  // Resend invitation mutation
  const resendInvitationMutation = useMutation(api.invitations.resendInvitation)

  const sendWorkspaceInvitation = async (args: {
    email: string
    role: 'admin' | 'member'
    message?: string
  }) => {
    try {
      await sendInvitationMutation({
        email: args.email,
        role: args.role,
        type: 'workspace',
        message: args.message
      })
    } catch (error) {
      throw error
    }
  }

  const sendProjectInvitation = async (args: {
    email: string
    projectId: Id<"projects">
    role: 'admin' | 'member'
    message?: string
  }) => {
    try {
      await sendInvitationMutation({
        email: args.email,
        role: args.role,
        type: 'project',
        projectId: args.projectId,
        message: args.message
      })
    } catch (error) {
      throw error
    }
  }

  const cancelInvitation = async (invitationId: Id<"invitations">) => {
    try {
      await cancelInvitationMutation({ invitationId })
      toast.success('Invitation cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel invitation')
      throw error
    }
  }

  const resendInvitation = async (invitationId: Id<"invitations">) => {
    try {
      await resendInvitationMutation({ invitationId })
      toast.success('Invitation resent successfully')
    } catch (error) {
      toast.error('Failed to resend invitation')
      throw error
    }
  }

  return {
    invitations,
    sendWorkspaceInvitation,
    sendProjectInvitation,
    cancelInvitation,
    resendInvitation,
    isLoading: invitations === undefined,
  }
}

export function useProjectInvitations(projectId: Id<"projects">) {
  const invitations = useQuery(
    api.invitations.getProjectInvitations,
    { projectId }
  )

  return {
    invitations,
    isLoading: invitations === undefined,
  }
}
