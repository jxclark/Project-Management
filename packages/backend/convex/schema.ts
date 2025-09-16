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
});
