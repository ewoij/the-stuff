"use client";

import { cva } from "class-variance-authority";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, GitBranch, ExternalLink, Bot, Lock } from "lucide-react";
import type { TaskWithStatus } from "@/lib/types";
import { TASK_STATUSES, STATUS_CONFIG } from "@/lib/constants/task-statuses";

const taskCardVariants = cva(
  "group/task cursor-pointer rounded-lg border border-border/60 border-l-[3px] bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-border",
  {
    variants: {
      dragOverlay: {
        true: "shadow-xl ring-2 ring-primary/20 rotate-[2deg] scale-[1.02]",
      },
      blocked: {
        true: "opacity-60",
      },
    },
  }
);

interface TaskCardProps {
  task: TaskWithStatus;
  onStatusChange: (taskId: number, status: string) => void;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function TaskCard({ task, onStatusChange, onClick, isDragOverlay }: TaskCardProps) {
  const accent = STATUS_CONFIG[task.currentStatus as keyof typeof STATUS_CONFIG]?.accentColor ?? STATUS_CONFIG.DRAFT.accentColor;
  const blocked = task.isBlocked;

  return (
    <div
      className={taskCardVariants({ dragOverlay: isDragOverlay, blocked, className: accent })}
      onClick={onClick}
    >
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {blocked && <Lock className="size-3 shrink-0 text-amber-500" />}
            <span className="text-[13px] font-medium leading-snug line-clamp-3">
              {task.title}
            </span>
          </div>
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
              {TASK_STATUSES.filter((s) => s !== task.currentStatus).map(
                (status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onStatusChange(task.id, status);
                    }}
                  >
                    Move to {STATUS_CONFIG[status].label}
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
        {task.agentName && (
          <div className="flex items-center gap-1 pt-1">
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-md px-1.5 py-0.5">
              <Bot className="size-2.5 shrink-0" />
              {task.agentName}
            </span>
          </div>
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
