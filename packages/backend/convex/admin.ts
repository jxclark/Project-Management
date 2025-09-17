import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get all workspace invitations (admin only)
export const getAllInvitations = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin (you might want to add proper role checking)
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Get all invitations with inviter information
    const invitations = await ctx.db
      .query("invitations")
      .order("desc")
      .collect()

    // Enrich with inviter names
    const enrichedInvitations = await Promise.all(
      invitations.map(async (invitation) => {
        const inviter = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("clerkId"), invitation.invitedBy))
          .first()

        return {
          ...invitation,
          inviterName: inviter?.name || inviter?.email || "Unknown"
        }
      })
    )

    return enrichedInvitations
  },
})

// Get all workspace members (admin only)
export const getWorkspaceMembers = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Get all users in the workspace
    const members = await ctx.db
      .query("users")
      .order("desc")
      .collect()

    return members.map(member => ({
      ...member,
      status: member.status || "active",
      role: member.role || "member",
      joinedAt: member.joinedAt || member.createdAt
    }))
  },
})

// Get workspace analytics (admin only)
export const getWorkspaceAnalytics = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Get analytics data
    const projects = await ctx.db.query("projects").collect()
    const tasks = await ctx.db.query("tasks").collect()
    const members = await ctx.db.query("users").collect()

    const activeTasks = tasks.filter(task => task.status !== "completed")
    const completedTasks = tasks.filter(task => task.status === "completed")
    const activeMembers = members.filter(member => member.status !== "inactive")

    // Calculate weekly activity (mock data for now)
    const weeklyActivity = [
      { day: 'Mon', tasks: Math.floor(Math.random() * 20), projects: Math.floor(Math.random() * 5) },
      { day: 'Tue', tasks: Math.floor(Math.random() * 20), projects: Math.floor(Math.random() * 5) },
      { day: 'Wed', tasks: Math.floor(Math.random() * 20), projects: Math.floor(Math.random() * 5) },
      { day: 'Thu', tasks: Math.floor(Math.random() * 20), projects: Math.floor(Math.random() * 5) },
      { day: 'Fri', tasks: Math.floor(Math.random() * 20), projects: Math.floor(Math.random() * 5) },
      { day: 'Sat', tasks: Math.floor(Math.random() * 10), projects: Math.floor(Math.random() * 3) },
      { day: 'Sun', tasks: Math.floor(Math.random() * 8), projects: Math.floor(Math.random() * 2) }
    ]

    return {
      totalProjects: projects.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      teamActivity: Math.floor((activeMembers.length / members.length) * 100),
      monthlyGrowth: Math.floor(Math.random() * 20) + 5, // Mock growth percentage
      weeklyActivity
    }
  },
})

// Bulk resend invitations (admin only)
export const resendInvitations = mutation({
  args: {
    invitationIds: v.array(v.id("invitations"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    let resendCount = 0
    for (const invitationId of args.invitationIds) {
      const invitation = await ctx.db.get(invitationId)
      if (invitation && invitation.status === "pending") {
        // Update the invitation with new expiry
        await ctx.db.patch(invitationId, {
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
        })
        // TODO: Trigger email resend
        resendCount++
      }
    }

    return resendCount
  },
})

// Bulk cancel invitations (admin only)
export const cancelInvitations = mutation({
  args: {
    invitationIds: v.array(v.id("invitations"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    let cancelCount = 0
    for (const invitationId of args.invitationIds) {
      const invitation = await ctx.db.get(invitationId)
      if (invitation && invitation.status === "pending") {
        await ctx.db.patch(invitationId, {
          status: "cancelled"
        })
        cancelCount++
      }
    }

    return cancelCount
  },
})

// Bulk delete invitations (admin only)
export const deleteInvitations = mutation({
  args: {
    invitationIds: v.array(v.id("invitations"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user || user.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    let deleteCount = 0
    for (const invitationId of args.invitationIds) {
      const invitation = await ctx.db.get(invitationId)
      if (invitation) {
        await ctx.db.delete(invitationId)
        deleteCount++
      }
    }

    return deleteCount
  },
})

// Update member role (admin only)
export const updateMemberRole = mutation({
  args: {
    memberId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Update the member's role
    await ctx.db.patch(args.memberId, {
      role: args.role
    })

    return { success: true }
  },
})

// Update member status (admin only)
export const updateMemberStatus = mutation({
  args: {
    memberId: v.id("users"),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    )
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Update the member's status
    await ctx.db.patch(args.memberId, {
      status: args.status
    })

    return { success: true }
  },
})

// Remove member from workspace (admin only)
export const removeMember = mutation({
  args: {
    memberId: v.id("users")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is admin
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!currentUser || currentUser.role !== "admin") {
      throw new Error("Not authorized - admin access required")
    }

    // Don't allow removing yourself
    const memberToRemove = await ctx.db.get(args.memberId)
    if (memberToRemove?.clerkId === identity.subject) {
      throw new Error("Cannot remove yourself from the workspace")
    }

    // Remove the member
    await ctx.db.delete(args.memberId)

    return { success: true }
  },
})
