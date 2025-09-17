"use client"

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@workspace/backend/convex/_generated/api'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Switch } from '@workspace/ui/components/switch'
import { Label } from '@workspace/ui/components/label'
import { Checkbox } from '@workspace/ui/components/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { Separator } from '@workspace/ui/components/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { 
  Settings, 
  Bell, 
  Mail, 
  Clock, 
  Moon,
  CheckCircle2,
  Calendar,
  User,
  Shield,
  Palette
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

export default function SettingsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Get current notification settings
  const settings = useQuery(
    api.notificationSettings.getUserNotificationSettings,
    isSignedIn && isLoaded ? {} : "skip"
  )

  const updateSettings = useMutation(api.notificationSettings.updateNotificationSettings)

  const [emailNotifications, setEmailNotifications] = useState({
    taskAssigned: true,
    taskDueSoon: true,
    taskCompleted: false,
    projectInvitation: true,
    weeklyDigest: true,
  })

  const [dueDateReminders, setDueDateReminders] = useState({
    enabled: true,
    reminderDays: [1, 3],
  })

  const [digestFrequency, setDigestFrequency] = useState<"daily" | "weekly" | "never">("weekly")

  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "America/New_York",
  })

  const createDefaultSettings = useMutation(api.notificationSettings.createDefaultNotificationSettings)

  // Update local state when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications)
      setDueDateReminders(settings.dueDateReminders)
      setDigestFrequency(settings.digestFrequency)
      setQuietHours(settings.quietHours)
    } else if (settings === null && isSignedIn && isLoaded) {
      // Create default settings if none exist
      createDefaultSettings({})
    }
  }, [settings, isSignedIn, isLoaded, createDefaultSettings])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await updateSettings({
        emailNotifications,
        dueDateReminders,
        digestFrequency,
        quietHours,
      })
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReminderDayToggle = (day: number, checked: boolean) => {
    setDueDateReminders(prev => ({
      ...prev,
      reminderDays: checked 
        ? [...prev.reminderDays, day].sort((a, b) => a - b)
        : prev.reminderDays.filter(d => d !== day)
    }))
  }

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your notification preferences and account settings
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-assigned">Task Assignments</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when you're assigned a new task
                </p>
              </div>
              <Switch
                id="task-assigned"
                checked={emailNotifications.taskAssigned}
                onCheckedChange={(checked: boolean) => 
                  setEmailNotifications(prev => ({ ...prev, taskAssigned: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-due-soon">Due Date Reminders</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get reminded when your tasks are approaching their due date
                </p>
              </div>
              <Switch
                id="task-due-soon"
                checked={emailNotifications.taskDueSoon}
                onCheckedChange={(checked: boolean) => 
                  setEmailNotifications(prev => ({ ...prev, taskDueSoon: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-completed">Task Completions</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when someone completes a task you assigned
                </p>
              </div>
              <Switch
                id="task-completed"
                checked={emailNotifications.taskCompleted}
                onCheckedChange={(checked: boolean) => 
                  setEmailNotifications(prev => ({ ...prev, taskCompleted: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-invitation">Project Invitations</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when you're invited to join a project
                </p>
              </div>
              <Switch
                id="project-invitation"
                checked={emailNotifications.projectInvitation}
                onCheckedChange={(checked: boolean) => 
                  setEmailNotifications(prev => ({ ...prev, projectInvitation: checked }))
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-digest">Weekly Digest</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get a weekly summary of your tasks and projects
                </p>
              </div>
              <Switch
                id="weekly-digest"
                checked={emailNotifications.weeklyDigest}
                onCheckedChange={(checked: boolean) => 
                  setEmailNotifications(prev => ({ ...prev, weeklyDigest: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Due Date Reminders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Due Date Reminders
          </CardTitle>
          <CardDescription>
            Configure when you want to be reminded about upcoming due dates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminders-enabled">Enable Due Date Reminders</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Turn on/off all due date reminder emails
              </p>
            </div>
            <Switch
              id="reminders-enabled"
              checked={dueDateReminders.enabled}
              onCheckedChange={(checked: boolean) => 
                setDueDateReminders(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {dueDateReminders.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <Label>Send reminders before due date:</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 7, 14].map((days) => (
                    <div key={days} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reminder-${days}`}
                        checked={dueDateReminders.reminderDays.includes(days)}
                        onCheckedChange={(checked: boolean) => 
                          handleReminderDayToggle(days, checked)
                        }
                      />
                      <Label htmlFor={`reminder-${days}`} className="text-sm">
                        {days === 1 ? '1 day' : `${days} days`}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  Select multiple options to receive reminders at different intervals
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Digest Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Digest Frequency
          </CardTitle>
          <CardDescription>
            How often would you like to receive summary emails?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="digest-frequency">Email Digest</Label>
            <Select value={digestFrequency} onValueChange={(value: any) => setDigestFrequency(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily - Every morning</SelectItem>
                <SelectItem value="weekly">Weekly - Every Monday</SelectItem>
                <SelectItem value="never">Never - No digest emails</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Digest emails include a summary of your tasks, upcoming deadlines, and project updates
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="quiet-hours-enabled">Enable Quiet Hours</Label>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pause non-urgent notifications during specified hours
              </p>
            </div>
            <Switch
              id="quiet-hours-enabled"
              checked={quietHours.enabled}
              onCheckedChange={(checked: boolean) => 
                setQuietHours(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {quietHours.enabled && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select value={quietHours.startTime} onValueChange={(value) => 
                    setQuietHours(prev => ({ ...prev, startTime: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Select value={quietHours.endTime} onValueChange={(value) => 
                    setQuietHours(prev => ({ ...prev, endTime: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0')
                        return (
                          <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Urgent notifications (like immediate task assignments) will still be sent during quiet hours
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="min-w-32"
        >
          {isLoading ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </TabsContent>

    {/* Profile Tab */}
    <TabsContent value="profile" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Profile Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Profile management features coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Security Tab */}
    <TabsContent value="security" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
          <CardDescription>
            Manage your account security and privacy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Security Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Security management features coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>

    {/* Appearance Tab */}
    <TabsContent value="appearance" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Appearance Settings
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Palette className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Appearance Settings
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Theme and appearance options coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  </Tabs>
</div>
  )
}
