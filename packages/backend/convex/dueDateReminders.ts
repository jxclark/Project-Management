import { v } from "convex/values"
import { internalAction, internalMutation, internalQuery } from "./_generated/server"
import { internal } from "./_generated/api"

// Internal function to process due date reminders
export const processDueDateReminders = internalAction({
  args: {},
  handler: async (ctx, args) => {
    // Get all tasks that are due in 1, 2, 3, 7, or 14 days
    const reminderDays = [1, 2, 3, 7, 14]
    
    for (const days of reminderDays) {
      try {
        // Get users who want reminders for this number of days
        const usersToNotify = await ctx.runQuery(
          internal.dueDateReminders.getUsersForDueDateReminders,
          { daysBeforeDue: days }
        )

        // Get tasks due in the specified number of days
        const tasksDue = await ctx.runQuery(
          internal.dueDateReminders.getTasksDueInDays,
          { days }
        )

        // Send reminders for each task to users who want them
        for (const task of tasksDue) {
          if (task.assignedTo && usersToNotify.includes(task.assignedTo)) {
            await ctx.runMutation(
              internal.dueDateReminders.createDueDateReminderNotification,
              {
                userId: task.assignedTo,
                taskId: task._id,
                taskTitle: task.title,
                projectName: task.projectName || "Unknown Project",
                dueDate: task.dueDate!,
                daysUntilDue: days
              }
            )
          }
        }
      } catch (error) {
        console.error(`Error processing reminders for ${days} days:`, error)
      }
    }
  },
})

// Get users who want reminders for a specific number of days
export const getUsersForDueDateReminders = internalQuery({
  args: {
    daysBeforeDue: v.number(),
  },
  handler: async (ctx, args) => {
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

// Get tasks that are due in a specific number of days
export const getTasksDueInDays = internalQuery({
  args: {
    days: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const targetDate = now + (args.days * 24 * 60 * 60 * 1000)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all tasks with due dates in the target day
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => 
        q.and(
          q.neq(q.field("status"), "completed"),
          q.neq(q.field("status"), "cancelled"),
          q.gte(q.field("dueDate"), startOfDay.getTime()),
          q.lte(q.field("dueDate"), endOfDay.getTime())
        )
      )
      .collect()

    // Enrich with project information
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const project = await ctx.db.get(task.projectId)
        return {
          ...task,
          projectName: project?.name || "Unknown Project"
        }
      })
    )

    return enrichedTasks.filter(task => task.assignedTo && task.dueDate)
  },
})

// Create a due date reminder notification
export const createDueDateReminderNotification = internalMutation({
  args: {
    userId: v.string(),
    taskId: v.id("tasks"),
    taskTitle: v.string(),
    projectName: v.string(),
    dueDate: v.number(),
    daysUntilDue: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if we already sent a reminder for this task and user today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    const existingReminder = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("type"), "task_due_reminder"),
          q.eq(q.field("relatedId"), args.taskId),
          q.gte(q.field("createdAt"), todayTimestamp)
        )
      )
      .first()

    if (existingReminder) {
      return // Already sent reminder today
    }

    const dueText = args.daysUntilDue === 1 ? "tomorrow" : `in ${args.daysUntilDue} days`
    const dueDateFormatted = new Date(args.dueDate).toLocaleDateString()

    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: "task_due_reminder",
      title: `Task due ${dueText}: ${args.taskTitle}`,
      message: `Your task "${args.taskTitle}" in ${args.projectName} is due ${dueText} (${dueDateFormatted})`,
      read: false,
      actionUrl: `/dashboard/tasks`,
      relatedId: args.taskId,
      relatedType: "task",
      createdAt: Date.now(),
    })

    // TODO: Send actual email notification here
    // This would integrate with your email service (SendGrid, Resend, etc.)
    console.log(`Due date reminder sent to ${args.userId} for task: ${args.taskTitle}`)
  },
})
