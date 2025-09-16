"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Loader2, Mail, Users } from "lucide-react"
import { toast } from "sonner"
import { Id } from "@workspace/backend/convex/_generated/dataModel"

const inviteSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "member", "viewer"]),
})

type InviteFormData = z.infer<typeof inviteSchema>

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: Id<"projects">
  projectName?: string
}

const roleOptions = [
  { 
    value: "admin", 
    label: "Admin", 
    description: "Can manage project settings and invite others" 
  },
  { 
    value: "member", 
    label: "Member", 
    description: "Can create and edit tasks" 
  },
  { 
    value: "viewer", 
    label: "Viewer", 
    description: "Can only view project content" 
  },
] as const

export function InviteModal({ 
  open, 
  onOpenChange, 
  projectId, 
  projectName 
}: InviteModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const sendInvitation = useMutation(api.invitations.sendInvitation)

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  })

  const handleSubmit = async (data: InviteFormData) => {
    setIsLoading(true)
    try {
      await sendInvitation({
        email: data.email,
        role: data.role,
        projectId: projectId,
        type: projectId ? "project" : "workspace",
      })

      toast.success(
        projectId 
          ? `Invitation sent to ${data.email} for ${projectName}`
          : `Team invitation sent to ${data.email}`
      )
      
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to send invitation:", error)
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to send invitation"
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
            <Users className="w-5 h-5" />
            {projectId ? `Invite to ${projectName}` : "Invite Team Member"}
          </DialogTitle>
          <DialogDescription>
            {projectId 
              ? `Send an invitation to join the ${projectName} project.`
              : "Send an invitation to join your team."
            } They'll receive an email with instructions to get started.
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

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-slate-500">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
