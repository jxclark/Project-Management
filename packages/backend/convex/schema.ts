import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("member"),
      v.literal("viewer")
    )),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    )),
    createdAt: v.number(),
    joinedAt: v.optional(v.number()),
    lastActiveAt: v.optional(v.number()),
  }).index("by_clerk_id", ["clerkId"]),

  userNotificationSettings: defineTable({
    userId: v.string(), // Clerk user ID
    emailNotifications: v.object({
      taskAssigned: v.boolean(), // When assigned a new task
      taskDueSoon: v.boolean(), // When task due date is approaching
      taskCompleted: v.boolean(), // When assigned task is completed by someone else
      projectInvitation: v.boolean(), // When invited to a project
      weeklyDigest: v.boolean(), // Weekly summary email
    }),
    dueDateReminders: v.object({
      enabled: v.boolean(),
      reminderDays: v.array(v.number()), // Days before due date to send reminders [1, 3, 7]
    }),
    digestFrequency: v.union(
      v.literal("daily"),
      v.literal("weekly"), 
      v.literal("never")
    ),
    quietHours: v.object({
      enabled: v.boolean(),
      startTime: v.string(), // "22:00"
      endTime: v.string(), // "08:00"
      timezone: v.string(), // "America/New_York"
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  projects: defineTable({
    name: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on-hold"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    startDate: v.number(), // timestamp
    endDate: v.optional(v.number()), // timestamp
    progress: v.number(), // 0-100
    color: v.string(),
    taskCount: v.number(),
    completedTasks: v.number(),
    createdBy: v.string(), // Clerk user ID
    updatedAt: v.number(), // timestamp
  }).index("by_created_by", ["createdBy"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.string(), // Clerk user ID
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    avatar: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_user", ["userId"]),

  tasks: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedTo: v.optional(v.string()), // Clerk user ID
    dueDate: v.optional(v.number()), // timestamp
    createdBy: v.string(), // Clerk user ID
    updatedAt: v.number(), // timestamp
  })
    .index("by_project", ["projectId"])
    .index("by_assignee", ["assignedTo"]),

  invitations: defineTable({
    email: v.string(),
    invitedBy: v.string(), // Clerk user ID
    projectId: v.optional(v.id("projects")), // Optional - for project-specific invites
    taskId: v.optional(v.id("tasks")), // Optional - for task-specific invites
    type: v.union(
      v.literal("workspace"), // General workspace invitation
      v.literal("project"),   // Project-specific invitation
      v.literal("task")       // Task assignment invitation
    ),
    role: v.union(
      v.literal("admin"),
      v.literal("member"),
      v.literal("viewer")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    token: v.string(), // Unique invitation token
    expiresAt: v.number(), // timestamp
    createdAt: v.number(), // timestamp
    acceptedAt: v.optional(v.number()), // timestamp
    message: v.optional(v.string()), // Optional message from inviter
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"])
    .index("by_invited_by", ["invitedBy"])
    .index("by_project", ["projectId"])
    .index("by_task", ["taskId"]),

  notifications: defineTable({
    userId: v.string(), // Clerk user ID of recipient
    type: v.union(
      v.literal("invitation_accepted"),
      v.literal("invitation_declined"),
      v.literal("invitation_expired"),
      v.literal("invitation_cancelled"),
      v.literal("task_assigned"),
      v.literal("task_due_reminder"),
      v.literal("task_completed"),
      v.literal("project_invitation"),
      v.literal("workspace_invitation")
    ),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    actionUrl: v.optional(v.string()), // URL to navigate to when clicked
    relatedId: v.optional(v.string()), // ID of related entity (invitation, project, task)
    relatedType: v.optional(v.union(
      v.literal("invitation"),
      v.literal("project"),
      v.literal("task")
    )),
    createdAt: v.number(), // timestamp
    readAt: v.optional(v.number()), // timestamp when marked as read
  })
    .index("by_user", ["userId"])
    .index("by_user_read", ["userId", "read"])
    .index("by_related", ["relatedId", "relatedType"]),
});
