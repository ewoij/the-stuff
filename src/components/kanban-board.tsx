"use client";

import { KanbanColumn } from "@/components/kanban-column";
import type { TaskWithStatus } from "@/lib/types";

const STATUSES = ["TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

interface KanbanBoardProps {
  tasks: TaskWithStatus[];
  onStatusChange: (taskId: number, status: string) => void;
  onTaskClick: (taskId: number) => void;
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
}: KanbanBoardProps) {
  const grouped = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.currentStatus === status);
      return acc;
    },
    {} as Record<string, TaskWithStatus[]>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {STATUSES.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={grouped[status]}
          onStatusChange={onStatusChange}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}
