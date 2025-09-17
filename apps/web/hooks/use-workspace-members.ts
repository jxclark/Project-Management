import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'

export function useWorkspaceMembers() {
  const { isSignedIn, isLoaded } = useUser()
  
  // Only query if user is authenticated
  const shouldQuery = isLoaded && isSignedIn
  
  // Get all workspace members
  const members = useQuery(
    api.admin.getWorkspaceMembers,
    shouldQuery ? {} : "skip"
  )
  
  // Mutations
  const updateMemberRoleMutation = useMutation(api.admin.updateMemberRole)
  const removeMemberMutation = useMutation(api.admin.removeMember)
  const updateMemberStatusMutation = useMutation(api.admin.updateMemberStatus)
  
  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await updateMemberRoleMutation({ 
        memberId: memberId as Id<"users">, 
        role: newRole as any
      })
      toast.success(`Member role updated to ${newRole}`)
    } catch (error) {
      toast.error('Failed to update member role')
      throw error
    }
  }
  
  const removeMember = async (memberId: string | undefined) => {
    if (!memberId) return
    try {
      await removeMemberMutation({ memberId: memberId as Id<"users"> })
      toast.success('Member removed from workspace')
    } catch (error) {
      toast.error('Failed to remove member')
      throw error
    }
  }
  
  const updateMemberStatus = async (memberId: string | undefined, status: string) => {
    if (!memberId) return
    try {
      await updateMemberStatusMutation({ 
        memberId: memberId as Id<"users">, 
        status: status as any
      })
      toast.success(`Member ${status === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update member status')
      throw error
    }
  }

  return {
    members,
    updateMemberRole,
    removeMember,
    updateMemberStatus,
    isLoading: !isLoaded || (shouldQuery && members === undefined),
  }
}
