"use client"

import { useMutation } from "convex/react"
import { useUser } from "@clerk/nextjs"
import { api } from "@workspace/backend/convex/_generated/api"
import { useEffect } from "react"

export function useInitUser() {
  const { user, isLoaded } = useUser()
  const createUser = useMutation(api.initUser.createCurrentUser)

  useEffect(() => {
    if (isLoaded && user) {
      const name = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'User'
      const email = user.emailAddresses[0]?.emailAddress || ''
      
      createUser({ name, email }).catch(console.error)
    }
  }, [isLoaded, user, createUser])
}
