import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { useUser } from '@clerk/nextjs'

export function useWorkspaceAnalytics() {
  const { isSignedIn, isLoaded } = useUser()
  
  // Only query if user is authenticated
  const shouldQuery = isLoaded && isSignedIn
  
  // Get workspace analytics data
  const analytics = useQuery(
    api.admin.getWorkspaceAnalytics,
    shouldQuery ? {} : "skip"
  )

  return {
    analytics,
    isLoading: !isLoaded || (shouldQuery && analytics === undefined),
  }
}
