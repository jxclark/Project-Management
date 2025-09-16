import { mutation } from "./_generated/server";
import { v } from "convex/values";

// One-time function to create your user record
export const createCurrentUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email: args.email,
      name: args.name,
      createdAt: Date.now(),
    });
  },
});
