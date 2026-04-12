import type { InferSelectModel } from "drizzle-orm";
import type {
  projects,
  tasks,
  taskStatus,
  taskComments,
  agents,
  taskDependencies,
} from "./db/schema";

export type Project = InferSelectModel<typeof projects>;
export type Task = InferSelectModel<typeof tasks>;
export type TaskStatus = InferSelectModel<typeof taskStatus>;
export type TaskComment = InferSelectModel<typeof taskComments>;
export type Agent = InferSelectModel<typeof agents>;
export type TaskDependency = InferSelectModel<typeof taskDependencies>;

export type ProjectWithStats = Project & {
  taskCounts: {
    todo: number;
    inProgress: number;
    done: number;
    draft: number;
    archived: number;
    total: number;
  };
  activeAgents: number;
  lastActivity: string;
};

export type TaskWithStatus = Task & {
  currentStatus: string | null;
  agentName: string | null;
  lastAgentId: number | null;
  lastAgentName: string | null;
  lastAgentAlive: boolean;
  isBlocked?: boolean;
};
export type TaskDetail = Task & {
  currentStatus: string | null;
  statusHistory: TaskStatus[];
  comments: TaskComment[];
  subtasks: TaskWithStatus[];
  dependencies: (TaskDependency & {
    dependsOnTitle: string;
    dependsOnStatus: string | null;
  })[];
  dependents: { taskId: number; taskTitle: string }[];
};
