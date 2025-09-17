/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as dueDateReminders from "../dueDateReminders.js";
import type * as emails from "../emails.js";
import type * as initUser from "../initUser.js";
import type * as invitations from "../invitations.js";
import type * as notificationSettings from "../notificationSettings.js";
import type * as notifications from "../notifications.js";
import type * as projects from "../projects.js";
import type * as scheduledNotifications from "../scheduledNotifications.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  dueDateReminders: typeof dueDateReminders;
  emails: typeof emails;
  initUser: typeof initUser;
  invitations: typeof invitations;
  notificationSettings: typeof notificationSettings;
  notifications: typeof notifications;
  projects: typeof projects;
  scheduledNotifications: typeof scheduledNotifications;
  tasks: typeof tasks;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
