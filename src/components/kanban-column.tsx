"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "@/components/task-card";
import type { TaskWithStatus } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-blue-100 text-blue-800",
  PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

interface KanbanColumnProps {
  status: string;
  tasks: TaskWithStatus[];
  onStatusChange: (taskId: number, status: string) => void;
  onTaskClick: (taskId: number) => void;
}

export function KanbanColumn({
  status,
  tasks,
  onStatusChange,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] w-[280px] bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 p-3 pb-2">
        <Badge className={STATUS_COLORS[status] ?? ""} variant="secondary">
          {status}
        </Badge>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
