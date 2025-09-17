import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

export function useAdminInvitations() {
  const { isSignedIn, isLoaded } = useUser()
  
  // Only query if user is authenticated
  const shouldQuery = isLoaded && isSignedIn
  
  // Get all workspace invitations (admin view)
  const invitations = useQuery(
    api.admin.getAllInvitations,
    shouldQuery ? {} : "skip"
  )
  
  // Mutations for bulk actions
  const resendInvitationsMutation = useMutation(api.admin.resendInvitations)
  const cancelInvitationsMutation = useMutation(api.admin.cancelInvitations)
  const deleteInvitationsMutation = useMutation(api.admin.deleteInvitations)
  
  const bulkActions = {
    resend: async (invitationIds: string[]) => {
      try {
        const count = await resendInvitationsMutation({ 
          invitationIds: invitationIds as Id<"invitations">[] 
        })
        toast.success(`Resent ${count} invitations`)
        return count
      } catch (error) {
        toast.error('Failed to resend invitations')
        throw error
      }
    },
    
    cancel: async (invitationIds: string[]) => {
      try {
        const count = await cancelInvitationsMutation({ 
          invitationIds: invitationIds as Id<"invitations">[] 
        })
        toast.success(`Cancelled ${count} invitations`)
        return count
      } catch (error) {
        toast.error('Failed to cancel invitations')
        throw error
      }
    },
    
    delete: async (invitationIds: string[]) => {
      try {
        const count = await deleteInvitationsMutation({ 
          invitationIds: invitationIds as Id<"invitations">[] 
        })
        toast.success(`Deleted ${count} invitations`)
        return count
      } catch (error) {
        toast.error('Failed to delete invitations')
        throw error
      }
    }
  }

  return {
    invitations,
    bulkActions,
    isLoading: !isLoaded || (shouldQuery && invitations === undefined),
  }
}
