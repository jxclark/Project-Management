"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Loader2, Mail, UserPlus, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { Id } from "@workspace/backend/convex/_generated/dataModel"

const taskInviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  message: z.string().optional(),
})

type TaskInviteFormData = z.infer<typeof taskInviteSchema>

interface TaskInviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: Id<"tasks">
  taskTitle: string
  projectName?: string
}

export function TaskInviteModal({ 
  open, 
  onOpenChange, 
  taskId,
  taskTitle,
  projectName 
}: TaskInviteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const sendInvitation = useMutation(api.invitations.sendInvitation)

  const form = useForm<TaskInviteFormData>({
    resolver: zodResolver(taskInviteSchema),
    defaultValues: {
      email: "",
      message: "",
    },
  })

  const handleSubmit = async (data: TaskInviteFormData) => {
    setIsLoading(true)
    try {
      await sendInvitation({
        email: data.email,
        role: "member", // Task assignments are typically member-level
        taskId: taskId,
        type: "task",
        message: data.message,
      })

      toast.success(`Task assignment invitation sent to ${data.email}`)
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to send task invitation:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to send task invitation"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Assign Task to Team Member
          </DialogTitle>
          <DialogDescription>
            Assign "{taskTitle}" to a team member
            {projectName && ` in ${projectName}`}. They'll automatically get project access and be assigned to this task.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input 
                        placeholder="colleague@company.com" 
                        className="pl-10"
                        {...field} 
                        disabled={isLoading}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message about this task assignment..."
                      className="min-h-[80px]"
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                What happens next:
              </h4>
              <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                <p>• They'll be invited to join the workspace</p>
                <p>• Automatically added to the project as a member</p>
                <p>• Assigned to "{taskTitle}" task</p>
                <p>• Can edit task details and update status</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <UserPlus className="w-4 h-4 mr-2" />
                Send Task Assignment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
