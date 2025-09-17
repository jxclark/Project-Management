import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

// Daily job to check for due date reminders at 1 PM UTC (9 AM EDT / 8 AM EST)
crons.daily(
  "send due date reminders",
  { hourUTC: 13, minuteUTC: 0 },
  internal.dueDateReminders.processDueDateReminders
)

export default crons
