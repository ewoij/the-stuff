"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { TaskDependencySection } from "@/components/task-dependency-section";
import { TaskCommentsSection } from "@/components/task-comments-section";
import { TaskStatusHistory } from "@/components/task-status-history";
import { TaskSubtasksList } from "@/components/task-subtasks-list";
import { useTask } from "@/lib/hooks/use-task";
import { TASK_STATUSES, STATUS_CONFIG } from "@/lib/constants/task-statuses";
import { GitBranch, ExternalLink, Pencil } from "lucide-react";
import { Markdown } from "@/components/markdown";

interface TaskDetailDialogProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
  onChanged,
}: TaskDetailDialogProps) {
  const { task, loading, refresh } = useTask(open ? taskId : null);
  const [editOpen, setEditOpen] = useState(false);

  async function handleStatusChange(status: string) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    refresh();
    onChanged();
  }

  return (
    <>
      <Dialog open={open && !editOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          {loading || !task ? (
            <DialogHeader>
              <DialogTitle>Loading...</DialogTitle>
            </DialogHeader>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 pr-8">
                  <DialogTitle>{task.title}</DialogTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={STATUS_CONFIG[task.currentStatus as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""}
                    variant="secondary"
                  >
                    {STATUS_CONFIG[task.currentStatus as keyof typeof STATUS_CONFIG]?.label ?? task.currentStatus}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 pb-2 overflow-y-auto">
                {/* Description */}
                {task.content && (
                  <Markdown content={task.content} />
                )}

                {/* Branch / PR */}
                {(task.branch || task.pr) && (
                  <div className="flex flex-wrap gap-2">
                    {task.branch && (
                      <Badge variant="outline" className="gap-1">
                        <GitBranch className="size-3" />
                        {task.branch}
                      </Badge>
                    )}
                    {task.pr && (
                      <a
                        href={task.pr}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge variant="outline" className="gap-1">
                          <ExternalLink className="size-3" />
                          PR
                        </Badge>
                      </a>
                    )}
                  </div>
                )}

                <TaskDependencySection
                  task={task}
                  refresh={refresh}
                  onChanged={onChanged}
                />

                <Separator />

                {/* Status actions */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Change Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {TASK_STATUSES.filter((s) => s !== task.currentStatus).map(
                      (status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(status)}
                        >
                          {STATUS_CONFIG[status].label}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                <Separator />

                <TaskSubtasksList subtasks={task.subtasks} />

                <TaskStatusHistory statusHistory={task.statusHistory} />

                <Separator />

                <TaskCommentsSection task={task} refresh={refresh} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {task && (
        <TaskFormDialog
          projectId={task.projectId}
          task={task}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSaved={() => {
            refresh();
            onChanged();
          }}
        />
      )}
    </>
  );
}
