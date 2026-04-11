"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, GitBranch, ExternalLink } from "lucide-react";
import type { TaskWithStatus } from "@/lib/types";

const STATUSES = ["DRAFT", "TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  TODO: "To Do",
  PROGRESS: "In Progress",
  DONE: "Done",
  ARCHIVED: "Archived",
};

const STATUS_ACCENT: Record<string, string> = {
  DRAFT: "border-l-purple-400",
  TODO: "border-l-blue-400",
  PROGRESS: "border-l-amber-400",
  DONE: "border-l-emerald-400",
  ARCHIVED: "border-l-gray-300",
};

interface TaskCardProps {
  task: TaskWithStatus;
  onStatusChange: (taskId: number, status: string) => void;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function TaskCard({ task, onStatusChange, onClick, isDragOverlay }: TaskCardProps) {
  const accent = STATUS_ACCENT[task.currentStatus ?? "DRAFT"] ?? "border-l-gray-300";

  return (
    <div
      className={`group/task cursor-pointer rounded-lg border border-border/60 border-l-[3px] ${accent} bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-border ${isDragOverlay ? "shadow-xl ring-2 ring-primary/20 rotate-[2deg] scale-[1.02]" : ""}`}
      onClick={onClick}
    >
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-medium leading-snug line-clamp-3">
            {task.title}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover/task:opacity-100 transition-opacity shrink-0 -mt-0.5 -mr-1"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontal className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {STATUSES.filter((s) => s !== task.currentStatus).map(
                (status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onStatusChange(task.id, status);
                    }}
                  >
                    Move to {STATUS_LABELS[status] ?? status}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.content && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {task.content}
          </p>
        )}
        {(task.branch || task.pr) && (
          <div className="flex flex-wrap gap-1.5 pt-1 opacity-0 group-hover/task:opacity-100 transition-opacity">
            {task.branch && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/70 rounded-md px-1.5 py-0.5 font-mono truncate max-w-[180px]">
                <GitBranch className="size-2.5 shrink-0" />
                {task.branch}
              </span>
            )}
            {task.pr && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/70 rounded-md px-1.5 py-0.5">
                <ExternalLink className="size-2.5 shrink-0" />
                PR
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
