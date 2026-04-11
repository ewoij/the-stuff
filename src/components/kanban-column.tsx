"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SortableTaskCard } from "@/components/sortable-task-card";
import { ChevronDown } from "lucide-react";
import type { TaskWithStatus } from "@/lib/types";

const STATUS_DOT: Record<string, string> = {
  DRAFT: "bg-purple-400",
  TODO: "bg-blue-400",
  PROGRESS: "bg-amber-400",
  DONE: "bg-emerald-400",
  ARCHIVED: "bg-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  TODO: "To Do",
  PROGRESS: "In Progress",
  DONE: "Done",
  ARCHIVED: "Archived",
};

const ARCHIVED_PREVIEW_COUNT = 5;

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
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const isArchived = status === "ARCHIVED";
  const shouldCollapse = isArchived && !archivedExpanded && tasks.length > ARCHIVED_PREVIEW_COUNT;
  const visibleTasks = shouldCollapse ? tasks.slice(0, ARCHIVED_PREVIEW_COUNT) : tasks;
  const visibleIds = visibleTasks.map((t) => t.id);
  const hiddenCount = tasks.length - ARCHIVED_PREVIEW_COUNT;

  return (
    <div
      className={`flex flex-col min-w-[280px] w-[280px] rounded-xl border border-border/40 transition-colors ${isOver ? "bg-muted/80 border-border" : "bg-muted/30"}`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border/30">
        <span className={`size-2.5 rounded-full ${STATUS_DOT[status] ?? "bg-gray-400"}`} />
        <span className="text-sm font-semibold tracking-tight">
          {STATUS_LABELS[status] ?? status}
        </span>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
          {tasks.length}
        </span>
      </div>
      <ScrollArea className="flex-1 px-2.5 py-2.5">
        <SortableContext
          items={visibleIds}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[40px]">
            {visibleTasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onStatusChange={onStatusChange}
                onClick={() => onTaskClick(task.id)}
              />
            ))}
          </div>
        </SortableContext>
        {shouldCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground"
            onClick={() => setArchivedExpanded(true)}
          >
            <ChevronDown className="size-3.5 mr-1" />
            Show {hiddenCount} more
          </Button>
        )}
        {isArchived && archivedExpanded && tasks.length > ARCHIVED_PREVIEW_COUNT && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-xs text-muted-foreground"
            onClick={() => setArchivedExpanded(false)}
          >
            Show less
          </Button>
        )}
      </ScrollArea>
    </div>
  );
}
