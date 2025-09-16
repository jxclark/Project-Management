import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

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
      v.literal("expired")
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
});
