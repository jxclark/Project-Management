import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get projects for the current user (only projects they're members of)
export const getProjects = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user's project memberships
    const memberships = await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    // Get projects where user is a member
    const projectsWithMembers = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        if (!project) return null;

        const allMembers = await ctx.db
          .query("projectMembers")
          .filter((q) => q.eq(q.field("projectId"), project._id))
          .collect();
        
        return {
          ...project,
          id: project._id,
          members: allMembers.map(member => ({
            id: member.userId,
            name: member.name,
            email: member.email,
            role: member.role,
            avatar: member.avatar,
          })),
          createdAt: project.updatedAt, // Using updatedAt as createdAt for now
        };
      })
    );

    return projectsWithMembers.filter(project => project !== null);
  },
});

export const getProjectById = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user is a member of this project
    const membership = await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!membership) {
      throw new Error("Not authorized to view this project");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project) {
      return null;
    }

    return {
      ...project,
      id: project._id,
      createdAt: project.updatedAt, // Using updatedAt as createdAt for now
    };
  },
});

export const getProjectMembers = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("projectMembers")
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();
  },
});

// Create a new project
export const createProject = mutation({
  args: {
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
    startDate: v.number(),
    endDate: v.optional(v.number()),
    color: v.string(),
    memberIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: args.status,
      priority: args.priority,
      startDate: args.startDate,
      endDate: args.endDate,
      progress: 0,
      color: args.color,
      taskCount: 0,
      completedTasks: 0,
      createdBy: identity.subject,
      updatedAt: now,
    });

    // Get user information from users table
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    // Add the creator as owner
    await ctx.db.insert("projectMembers", {
      projectId,
      userId: identity.subject,
      name: user?.name || "Project Owner",
      email: user?.email || "",
      role: "owner",
      avatar: user?.avatar || "",
    });

    // Add other members (if any)
    for (const memberId of args.memberIds) {
      await ctx.db.insert("projectMembers", {
        projectId,
        userId: memberId,
        name: "Member", // You'd get this from user lookup
        email: "", // You'd get this from user lookup
        role: "member",
      });
    }

    return projectId;
  },
});

// Update project status
export const updateProjectStatus = mutation({
  args: {
    projectId: v.id("projects"),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("on-hold"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.projectId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("planning"),
        v.literal("active"),
        v.literal("on-hold"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    color: v.optional(v.string()),
    progress: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has permission to update
    if (project.createdBy !== identity.subject) {
      // Could also check if user is admin/owner via projectMembers
      throw new Error("Not authorized to update this project");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Only update provided fields
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.status !== undefined) updates.status = args.status;
    if (args.priority !== undefined) updates.priority = args.priority;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.color !== undefined) updates.color = args.color;
    if (args.progress !== undefined) updates.progress = args.progress;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

// Delete a project
export const deleteProject = mutation({
  args: {
    id: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.db.get(args.id);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if user has permission to delete
    if (project.createdBy !== identity.subject) {
      throw new Error("Not authorized to delete this project");
    }

    // Delete project members
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }

    // Delete tasks (if any)
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const task of tasks) {
      await ctx.db.delete(task._id);
    }

    // Delete the project
    await ctx.db.delete(args.id);
    return args.id;
  },
});
