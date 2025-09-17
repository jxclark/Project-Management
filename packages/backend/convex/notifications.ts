import { v } from "convex/values"
import { mutation, query, internalMutation, internalAction } from "./_generated/server"
import { Id } from "./_generated/dataModel"
import { internal } from "./_generated/api"

// Create a notification
export const createNotification = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("invitation_accepted"),
      v.literal("invitation_declined"),
      v.literal("invitation_expired"),
      v.literal("invitation_cancelled"),
      v.literal("task_assigned"),
      v.literal("project_invitation"),
      v.literal("workspace_invitation")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.union(
      v.literal("invitation"),
      v.literal("project"),
      v.literal("task")
    )),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      actionUrl: args.actionUrl,
      relatedId: args.relatedId,
      relatedType: args.relatedType,
      createdAt: Date.now(),
    })

    return notificationId
  },
})

// Get notifications for current user
export const getMyNotifications = query({
  args: {
    limit: v.optional(v.number()),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }


    let query = ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))

    if (args.unreadOnly) {
      query = ctx.db
        .query("notifications")
        .withIndex("by_user_read", (q) => 
          q.eq("userId", identity.subject).eq("read", false)
        )
    }

    const notifications = await query
      .order("desc")
      .take(args.limit || 50)

    return notifications
  },
})

// Get unread notification count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return 0
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect()

    return unreadNotifications.length
  },
})

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new Error("Notification not found")
    }

    if (notification.userId !== identity.subject) {
      throw new Error("Not authorized to update this notification")
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
      readAt: Date.now(),
    })
  },
})

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => 
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect()

    const now = Date.now()
    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        read: true,
        readAt: now,
      })
    }

    return unreadNotifications.length
  },
})

// Delete notification
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const notification = await ctx.db.get(args.notificationId)
    if (!notification) {
      throw new Error("Notification not found")
    }

    if (notification.userId !== identity.subject) {
      throw new Error("Not authorized to delete this notification")
    }

    await ctx.db.delete(args.notificationId)
  },
})

// Helper function to create invitation status notifications and send emails
export const createInvitationStatusNotification = internalAction({
  args: {
    invitationId: v.id("invitations"),
    status: v.union(
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Get the invitation data and create notification via mutation
    await ctx.runMutation(internal.notifications.processInvitationStatusNotification, {
      invitationId: args.invitationId,
      status: args.status,
    })

    // Send email confirmation if accepted or declined
    if (args.status === "accepted" || args.status === "declined") {
      try {
        await ctx.runMutation(internal.notifications.sendInvitationStatusEmail, {
          invitationId: args.invitationId,
          status: args.status,
        })
      } catch (error) {
        console.error('Failed to send email confirmation:', error)
      }
    }
  },
})

// Process invitation status notification (internal mutation)
export const processInvitationStatusNotification = internalMutation({
  args: {
    invitationId: v.id("invitations"),
    status: v.union(
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    // Get the invitation to find who sent it
    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    const inviteeName = invitation.email
    let title = ""
    let message = ""
    let actionUrl = ""

    switch (args.status) {
      case "accepted":
        title = "Invitation Accepted"
        message = `${inviteeName} accepted your ${invitation.type} invitation`
        actionUrl = invitation.type === "project" && invitation.projectId 
          ? `/dashboard/projects/${invitation.projectId}`
          : "/dashboard/team"
        break
      case "declined":
        title = "Invitation Declined"
        message = `${inviteeName} declined your ${invitation.type} invitation`
        actionUrl = "/dashboard/invitations"
        break
      case "expired":
        title = "Invitation Expired"
        message = `Your ${invitation.type} invitation to ${inviteeName} has expired`
        actionUrl = "/dashboard/invitations"
        break
      case "cancelled":
        title = "Invitation Cancelled"
        message = `Your ${invitation.type} invitation to ${inviteeName} was cancelled`
        actionUrl = "/dashboard/invitations"
        break
    }

    // Create notification for the person who sent the invitation
    await ctx.db.insert("notifications", {
      userId: invitation.invitedBy,
      type: `invitation_${args.status}` as any,
      title,
      message,
      read: false,
      actionUrl,
      relatedId: args.invitationId,
      relatedType: "invitation" as any,
      createdAt: Date.now(),
    })
  },
})

// Send invitation status email (internal mutation)
export const sendInvitationStatusEmail = internalMutation({
  args: {
    invitationId: v.id("invitations"),
    status: v.union(
      v.literal("accepted"),
      v.literal("declined")
    ),
  },
  handler: async (ctx, args) => {
    // Get the invitation details
    const invitation = await ctx.db.get(args.invitationId)
    if (!invitation) {
      throw new Error("Invitation not found")
    }

    // Get inviter information
    const inviter = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), invitation.invitedBy))
      .first()
    
    const inviterName = inviter?.name || "Someone"
    const inviterEmail = inviter?.email || ""

    if (!inviterEmail) {
      console.error('No email found for inviter:', invitation.invitedBy)
      return
    }

    // Get project/task information for email context
    let projectName = undefined
    let taskTitle = undefined

    if (invitation.projectId) {
      const project = await ctx.db.get(invitation.projectId)
      projectName = project?.name
    }

    if (invitation.taskId) {
      const task = await ctx.db.get(invitation.taskId)
      taskTitle = task?.title
    }

    // Schedule email sending
    if (args.status === "accepted") {
      await ctx.scheduler.runAfter(0, internal.emails.sendInvitationAccepted, {
        to: inviterEmail,
        inviterName,
        acceptedByName: invitation.email,
        acceptedByEmail: invitation.email,
        invitationType: invitation.type,
        projectName,
        taskTitle,
      })
    } else if (args.status === "declined") {
      await ctx.scheduler.runAfter(0, internal.emails.sendInvitationDeclined, {
        to: inviterEmail,
        inviterName,
        declinedByEmail: invitation.email,
        invitationType: invitation.type,
        projectName,
        taskTitle,
      })
    }
  },
})

// Internal mutation to create notification (called from action)
export const createNotificationInternal = internalMutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("invitation_accepted"),
      v.literal("invitation_declined"),
      v.literal("invitation_expired"),
      v.literal("invitation_cancelled"),
      v.literal("task_assigned"),
      v.literal("project_invitation"),
      v.literal("workspace_invitation")
    ),
    title: v.string(),
    message: v.string(),
    actionUrl: v.optional(v.string()),
    relatedId: v.optional(v.string()),
    relatedType: v.optional(v.union(
      v.literal("project"),
      v.literal("task"),
      v.literal("invitation")
    )),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      actionUrl: args.actionUrl,
      relatedId: args.relatedId,
      relatedType: args.relatedType as any,
      createdAt: Date.now(),
    })
  },
})
