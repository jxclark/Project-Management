"use client"

import { useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Id } from '@workspace/backend/convex/_generated/dataModel'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { useInvitations } from '@/hooks/use-invitations'
import { toast } from 'sonner'

interface SendInvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SendInvitationModal({ open, onOpenChange }: SendInvitationModalProps) {
  const [email, setEmail] = useState('')
  const [projectId, setProjectId] = useState('workspace')
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const projects = useQuery(api.projects.getProjects)
  const { sendWorkspaceInvitation, sendProjectInvitation } = useInvitations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      if (projectId && projectId !== 'workspace') {
        // Send project invitation
        await sendProjectInvitation({
          email: email.trim(),
          projectId: projectId as Id<"projects">,
          role: role as 'admin' | 'member',
          message: message.trim() || undefined
        })
        toast.success('Project invitation sent successfully!')
      } else {
        // Send workspace invitation
        await sendWorkspaceInvitation({
          email: email.trim(),
          role: role as 'admin' | 'member',
          message: message.trim() || undefined
        })
        toast.success('Workspace invitation sent successfully!')
      }
      
      // Reset form
      setEmail('')
      setProjectId('workspace')
      setRole('member')
      setMessage('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to send invitation:', error)
      toast.error('Failed to send invitation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Invite someone to join your workspace or a specific project.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project (Optional)</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project or leave empty for workspace invitation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workspace">Workspace Invitation</SelectItem>
                {projects?.map((project: any) => (
                  <SelectItem key={project._id} value={project._id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to the invitation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
