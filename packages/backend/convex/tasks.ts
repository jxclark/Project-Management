import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Id } from "./_generated/dataModel"

// Get all tasks for a project (only if user is a member)
export const getProjectTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if user is a member of this project
    const membership = await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first()

    if (!membership) {
      throw new Error("Not authorized to view tasks in this project")
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect()

    return tasks
  },
})

// Get tasks assigned to current user or in projects they're members of
export const getMyTasks = query({
  args: {},
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Get user's project memberships
    const memberships = await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect()

    const projectIds = memberships.map(m => m.projectId)

    // Get tasks either assigned to user OR in projects they're members of
    const allTasks = await ctx.db.query("tasks").collect()
    
    const userTasks = allTasks.filter(task => 
      task.assignedTo === identity.subject || 
      projectIds.includes(task.projectId)
    )

    return userTasks
  },
})

// Get a single task by ID (only if user has access)
export const getTaskById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const task = await ctx.db.get(args.taskId)
    if (!task) {
      return null
    }

    // Check if user is assigned to this task OR is a member of the project
    const isAssigned = task.assignedTo === identity.subject
    
    const membership = await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("projectId"), task.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first()

    if (!isAssigned && !membership) {
      throw new Error("Not authorized to view this task")
    }

    return task
  },
})

// Create a new task
export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const taskId = await ctx.db.insert("tasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      status: "todo",
      priority: args.priority,
      assignedTo: args.assignedTo,
      dueDate: args.dueDate,
      createdBy: identity.subject,
      updatedAt: Date.now(),
    })

    // Update project task count
    const project = await ctx.db.get(args.projectId)
    if (project) {
      await ctx.db.patch(args.projectId, {
        taskCount: project.taskCount + 1,
        updatedAt: Date.now(),
      })
    }

    return taskId
  },
})

// Update a task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    )),
    assignedTo: v.optional(v.string()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const { id, ...updates } = args
    const task = await ctx.db.get(id)
    
    if (!task) {
      throw new Error("Task not found")
    }

    const wasCompleted = task.status === "completed"
    const isNowCompleted = updates.status === "completed"

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    })

    // Update project completed task count if status changed
    if (wasCompleted !== isNowCompleted) {
      const project = await ctx.db.get(task.projectId)
      if (project) {
        const completedChange = isNowCompleted ? 1 : -1
        await ctx.db.patch(task.projectId, {
          completedTasks: Math.max(0, project.completedTasks + completedChange),
          updatedAt: Date.now(),
        })
      }
    }

    return id
  },
})

// Update task status only
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("todo"),
      v.literal("in-progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const task = await ctx.db.get(args.taskId)
    if (!task) {
      throw new Error("Task not found")
    }

    const wasCompleted = task.status === "completed"
    const isNowCompleted = args.status === "completed"

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    })

    // Update project completed task count if status changed
    if (wasCompleted !== isNowCompleted) {
      const project = await ctx.db.get(task.projectId)
      if (project) {
        const completedChange = isNowCompleted ? 1 : -1
        await ctx.db.patch(task.projectId, {
          completedTasks: Math.max(0, project.completedTasks + completedChange),
          updatedAt: Date.now(),
        })
      }
    }

    return args.taskId
  },
})

// Delete a task
export const deleteTask = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    const task = await ctx.db.get(args.id)
    if (!task) {
      throw new Error("Task not found")
    }

    const wasCompleted = task.status === "completed"

    await ctx.db.delete(args.id)

    // Update project task counts
    const project = await ctx.db.get(task.projectId)
    if (project) {
      await ctx.db.patch(task.projectId, {
        taskCount: Math.max(0, project.taskCount - 1),
        completedTasks: wasCompleted 
          ? Math.max(0, project.completedTasks - 1)
          : project.completedTasks,
        updatedAt: Date.now(),
      })
    }

    return args.id
  },
})
