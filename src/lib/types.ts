import type { InferSelectModel } from "drizzle-orm";
import type { projects, tasks, taskStatus, taskComments } from "./db/schema";

export type Project = InferSelectModel<typeof projects>;
export type Task = InferSelectModel<typeof tasks>;
export type TaskStatus = InferSelectModel<typeof taskStatus>;
export type TaskComment = InferSelectModel<typeof taskComments>;

export type TaskWithStatus = Task & { currentStatus: string | null };
export type TaskDetail = Task & {
  currentStatus: string | null;
  statusHistory: TaskStatus[];
  comments: TaskComment[];
  subtasks: TaskWithStatus[];
};
