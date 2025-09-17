import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Get user's notification settings
export const getUserNotificationSettings = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const settings = await ctx.db
      .query("userNotificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first()

    return settings
  },
})

// Create default notification settings for a user
export const createDefaultNotificationSettings = mutation({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if settings already exist
    const existingSettings = await ctx.db
      .query("userNotificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first()

    if (existingSettings) {
      return existingSettings
    }

    // Create default settings
    const defaultSettings = {
      userId: identity.subject,
      emailNotifications: {
        taskAssigned: true,
        taskDueSoon: true,
        taskCompleted: false,
        projectInvitation: true,
        weeklyDigest: true,
      },
      dueDateReminders: {
        enabled: true,
        reminderDays: [1, 3], // 1 day and 3 days before due date
      },
      digestFrequency: "weekly" as const,
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
        timezone: "America/New_York",
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const settingsId = await ctx.db.insert("userNotificationSettings", defaultSettings)
    return await ctx.db.get(settingsId)
  },
})

// Update user's notification settings
export const updateNotificationSettings = mutation({
  args: {
    emailNotifications: v.optional(v.object({
      taskAssigned: v.boolean(),
      taskDueSoon: v.boolean(),
      taskCompleted: v.boolean(),
      projectInvitation: v.boolean(),
      weeklyDigest: v.boolean(),
    })),
    dueDateReminders: v.optional(v.object({
      enabled: v.boolean(),
      reminderDays: v.array(v.number()),
    })),
    digestFrequency: v.optional(v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("never")
    )),
    quietHours: v.optional(v.object({
      enabled: v.boolean(),
      startTime: v.string(),
      endTime: v.string(),
      timezone: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    let settings = await ctx.db
      .query("userNotificationSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first()

    if (!settings) {
      // Create new settings if none exist
      const newSettings = {
        userId: identity.subject,
        emailNotifications: args.emailNotifications || {
          taskAssigned: true,
          taskDueSoon: true,
          taskCompleted: false,
          projectInvitation: true,
          weeklyDigest: true,
        },
        dueDateReminders: args.dueDateReminders || {
          enabled: true,
          reminderDays: [1, 3],
        },
        digestFrequency: args.digestFrequency || "weekly" as const,
        quietHours: args.quietHours || {
          enabled: false,
          startTime: "22:00",
          endTime: "08:00",
          timezone: "America/New_York",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await ctx.db.insert("userNotificationSettings", newSettings)
    } else {
      // Update existing settings
      const updates: any = {
        updatedAt: Date.now(),
      }

      if (args.emailNotifications) {
        updates.emailNotifications = args.emailNotifications
      }
      if (args.dueDateReminders) {
        updates.dueDateReminders = args.dueDateReminders
      }
      if (args.digestFrequency) {
        updates.digestFrequency = args.digestFrequency
      }
      if (args.quietHours) {
        updates.quietHours = args.quietHours
      }

      await ctx.db.patch(settings._id, updates)
    }

    return { success: true }
  },
})

// Get all users who should receive due date reminders for a specific day offset
export const getUsersForDueDateReminders = query({
  args: {
    daysBeforeDue: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // This would typically be called by a scheduled function
    // Get all notification settings where due date reminders are enabled
    // and include the specified number of days
    const allSettings = await ctx.db
      .query("userNotificationSettings")
      .collect()

    const usersToNotify = allSettings.filter(settings => 
      settings.dueDateReminders.enabled && 
      settings.dueDateReminders.reminderDays.includes(args.daysBeforeDue) &&
      settings.emailNotifications.taskDueSoon
    )

    return usersToNotify.map(settings => settings.userId)
  },
})
