import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Id } from "./_generated/dataModel"
import { internal } from "./_generated/api"

// Generate a random invitation token
function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Send an invitation
export const sendInvitation = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    type: v.union(v.literal("workspace"), v.literal("project"), v.literal("task")),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first()

    if (existingUser) {
      throw new Error("User already exists in the system")
    }

    // Check if there's already a pending invitation for this email
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first()

    if (existingInvitation) {
      throw new Error("Invitation already sent to this email")
    }

    // Validate invitation type and permissions
    if (args.type === "task" && args.taskId) {
      const task = await ctx.db.get(args.taskId)
      if (!task) {
        throw new Error("Task not found")
      }

      // Check if user has permission to assign this task
      const project = await ctx.db.get(task.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", task.projectId))
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first()

      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("Not authorized to assign tasks in this project")
      }
    } else if (args.type === "project" && args.projectId) {
      const project = await ctx.db.get(args.projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Check if user is owner or admin of the project
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId!))
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first()

      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("Not authorized to invite users to this project")
      }
    }

    const now = Date.now()
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000) // 7 days from now

    const token = generateInvitationToken()
    
    const invitationId = await ctx.db.insert("invitations", {
      email: args.email,
      invitedBy: identity.subject,
      projectId: args.projectId,
      taskId: args.taskId,
      type: args.type,
      role: args.role,
      status: "pending",
      token,
      expiresAt,
      createdAt: now,
      message: args.message,
    })

    // Get inviter's name
    const inviter = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()
    
    const inviterName = inviter?.name || identity.name || "Someone"

    // Send email based on invitation type
    if (args.type === "task" && args.taskId) {
      const task = await ctx.db.get(args.taskId)
      const project = task?.projectId ? await ctx.db.get(task.projectId) : null
      
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendTaskAssignment, {
          to: args.email,
          inviterName,
          taskTitle: task?.title || "Untitled Task",
          projectName: project?.name || "Unknown Project",
          invitationToken: token,
          dueDate: task?.dueDate,
          message: args.message,
        })
      } catch (error) {
        console.error('Failed to schedule task assignment email:', error)
      }
    } else {
      try {
        await ctx.scheduler.runAfter(0, internal.emails.sendWorkspaceInvitation, {
          to: args.email,
          inviterName,
          invitationToken: token,
          message: args.message,
        })
      } catch (error) {
        console.error('Failed to schedule workspace invitation email:', error)
      }
    }

    return invitationId
  },
})

// Get invitations sent by current user
export const getMyInvitations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    return await ctx.db
      .query("invitations")
      .withIndex("by_invited_by", (q) => q.eq("invitedBy", identity.subject))
      .collect()
  },
})

// Get invitation by token (for invitation acceptance page)
export const getInvitationByToken = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!invitation) {
      return null
    }

    return invitation
  },
})

// Accept an invitation
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!invitation) {
      throw new Error("Invalid invitation token")
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid")
    }

    if (invitation.expiresAt < Date.now()) {
      // Mark as expired
      await ctx.db.patch(invitation._id, {
        status: "expired",
      })
      throw new Error("Invitation has expired")
    }

    // Get current user or create if doesn't exist
    let user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first()

    if (!user) {
      // Create user if doesn't exist
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: identity.email || invitation.email,
        name: identity.name || "Unknown User",
        avatar: identity.pictureUrl,
        createdAt: Date.now(),
      })
      user = await ctx.db.get(userId)
    }

    if (!user) {
      throw new Error("Failed to create or retrieve user")
    }

    // Allow invitation acceptance even if emails don't match exactly
    // This handles cases where user signs up with different email than invited

    // Handle different invitation types
    if (invitation.type === "task" && invitation.taskId) {
      // For task invitations, get the task and auto-add to project
      const task = await ctx.db.get(invitation.taskId)
      if (task) {
        // Check if user is already a project member
        const existingMembership = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (q) => q.eq("projectId", task.projectId))
          .filter((q) => q.eq(q.field("userId"), identity.subject))
          .first()

        if (!existingMembership) {
          // Auto-add to project as member
          await ctx.db.insert("projectMembers", {
            projectId: task.projectId,
            userId: identity.subject,
            name: user.name,
            email: user.email,
            role: "member", // Task assignees get member role
            avatar: user.avatar,
          })
        }

        // Assign the task to the user
        await ctx.db.patch(invitation.taskId, {
          assignedTo: identity.subject,
          updatedAt: Date.now(),
        })
      }
    } else if (invitation.type === "project" && invitation.projectId) {
      // For project invitations, add user to project
      const existingMembership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project", (q) => q.eq("projectId", invitation.projectId!))
        .filter((q) => q.eq(q.field("userId"), identity.subject))
        .first()

      if (!existingMembership) {
        await ctx.db.insert("projectMembers", {
          projectId: invitation.projectId,
          userId: identity.subject,
          name: user.name,
          email: user.email,
          role: invitation.role,
          avatar: user.avatar,
        })
      }
    }
    // Workspace invitations don't need additional setup

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    })

    return invitation._id
  },
})

// Decline an invitation
export const declineInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!invitation) {
      throw new Error("Invalid invitation token")
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid")
    }

    await ctx.db.patch(invitation._id, {
      status: "declined",
    })

    return invitation._id
  },
})

// Cancel an invitation (for the sender)
export const cancelInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    if (invitation.invitedBy !== identity.subject) {
      throw new Error("Not authorized to cancel this invitation")
    }

    if (invitation.status !== "pending") {
      throw new Error("Can only cancel pending invitations")
    }

    await ctx.db.delete(args.invitationId)
    return args.invitationId
  },
})
