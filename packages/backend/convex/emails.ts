import { Resend } from 'resend';
import { internalAction } from './_generated/server';
import { v } from 'convex/values';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send workspace invitation email
export const sendWorkspaceInvitation = internalAction({
  args: {
    to: v.string(),
    inviterName: v.string(),
    invitationToken: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${args.invitationToken}`;
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: [args.to],
        subject: `${args.inviterName} invited you to join Workstream`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited to Workstream</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi there!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                <strong>${args.inviterName}</strong> has invited you to join their team on Workstream, 
                a modern project management platform.
              </p>
              
              ${args.message ? `
                <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
                  <p style="color: #333; margin: 0; font-style: italic;">"${args.message}"</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold;
                          display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center;">
                This invitation will expire in 7 days. If you can't click the button, 
                copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #667eea;">${inviteUrl}</a>
              </p>
            </div>
            
            <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
              <p>Sent by Workstream - Modern Project Management</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send invitation email: ${error}`);
    }
  },
});

// Send task assignment email
export const sendTaskAssignment = internalAction({
  args: {
    to: v.string(),
    inviterName: v.string(),
    taskTitle: v.string(),
    projectName: v.string(),
    invitationToken: v.string(),
    dueDate: v.optional(v.number()),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/invite/${args.invitationToken}`;
    const dueDateText = args.dueDate 
      ? new Date(args.dueDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      : 'No due date set';
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: [args.to],
        subject: `You've been assigned to: ${args.taskTitle}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">New Task Assignment</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">You've been assigned a new task!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                <strong>${args.inviterName}</strong> has assigned you to a task in the 
                <strong>${args.projectName}</strong> project.
              </p>
              
              <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">📋 ${args.taskTitle}</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Project:</strong> ${args.projectName}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Due Date:</strong> ${dueDateText}</p>
              </div>
              
              ${args.message ? `
                <div style="background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
                  <p style="color: #333; margin: 0; font-style: italic;">"${args.message}"</p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" 
                   style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: bold;
                          display: inline-block;">
                  View Task & Join Project
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center;">
                This invitation will expire in 7 days. If you can't click the button, 
                copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #10b981;">${inviteUrl}</a>
              </p>
            </div>
            
            <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
              <p>Sent by Workstream - Modern Project Management</p>
              <p>If you didn't expect this task assignment, please contact ${args.inviterName}.</p>
            </div>
          </div>
        `,
      });

      if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send task assignment email: ${error}`);
    }
  },
});
