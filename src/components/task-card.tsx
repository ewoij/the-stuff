"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, GitBranch, ExternalLink } from "lucide-react";
import type { TaskWithStatus } from "@/lib/types";

const STATUSES = ["TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

interface TaskCardProps {
  task: TaskWithStatus;
  onStatusChange: (taskId: number, status: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, onStatusChange, onClick }: TaskCardProps) {
  return (
    <Card
      className="cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-snug">
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              }
            >
              <MoreHorizontal className="size-4" />
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
                    Move to {status}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {task.content && (
          <CardDescription className="text-xs line-clamp-2">
            {task.content}
          </CardDescription>
        )}
        {(task.branch || task.pr) && (
          <div className="flex flex-wrap gap-1">
            {task.branch && (
              <Badge variant="secondary" className="text-xs gap-1">
                <GitBranch className="size-3" />
                {task.branch}
              </Badge>
            )}
            {task.pr && (
              <Badge variant="secondary" className="text-xs gap-1">
                <ExternalLink className="size-3" />
                PR
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
    </Card>
  );
}
