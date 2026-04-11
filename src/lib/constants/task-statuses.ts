export const TASK_STATUSES = ["DRAFT", "TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;
export type TaskStatusValue = (typeof TASK_STATUSES)[number];

export const STATUS_CONFIG: Record<
  TaskStatusValue,
  {
    label: string;
    dotColor: string;
    accentColor: string;
    badgeColor: string;
  }
> = {
  DRAFT: {
    label: "Draft",
    dotColor: "bg-purple-400",
    accentColor: "border-l-purple-400",
    badgeColor: "bg-purple-100 text-purple-700",
  },
  TODO: {
    label: "To Do",
    dotColor: "bg-blue-400",
    accentColor: "border-l-blue-400",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  PROGRESS: {
    label: "In Progress",
    dotColor: "bg-amber-400",
    accentColor: "border-l-amber-400",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  DONE: {
    label: "Done",
    dotColor: "bg-emerald-400",
    accentColor: "border-l-emerald-400",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  ARCHIVED: {
    label: "Archived",
    dotColor: "bg-gray-400",
    accentColor: "border-l-gray-400",
    badgeColor: "bg-gray-100 text-gray-500",
  },
};
