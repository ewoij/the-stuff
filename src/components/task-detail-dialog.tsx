"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useTask } from "@/lib/hooks/use-task";
import { GitBranch, ExternalLink, Clock, Pencil, Lock, X, Plus } from "lucide-react";
import { Markdown } from "@/components/markdown";
import type { TaskWithStatus } from "@/lib/types";
import { TASK_STATUSES, STATUS_CONFIG } from "@/lib/constants/task-statuses";

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
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [depSearch, setDepSearch] = useState("");
  const [depResults, setDepResults] = useState<TaskWithStatus[]>([]);
  const [depSearchOpen, setDepSearchOpen] = useState(false);
  const depSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!depSearch.trim() || !task) {
      setDepResults([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/projects/${task.projectId}/tasks`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((allTasks: TaskWithStatus[]) => {
        const existingDepIds = new Set(
          task.dependencies.map((d) => d.dependsOnId)
        );
        const query = depSearch.toLowerCase();
        setDepResults(
          allTasks.filter(
            (t) =>
              t.id !== task.id &&
              !existingDepIds.has(t.id) &&
              (t.title.toLowerCase().includes(query) ||
                String(t.id).includes(query))
          ).slice(0, 10)
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, [depSearch, task]);

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

  async function handleAddComment() {
    if (!task || !newComment.trim()) return;
    setSubmitting(true);
    await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });
    setNewComment("");
    setSubmitting(false);
    refresh();
  }

  async function handleDeleteComment(commentId: number) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/comments/${commentId}`, {
      method: "DELETE",
    });
    refresh();
  }

  async function handleAddDependency(dependsOnId: number) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/dependencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dependsOnId }),
    });
    setDepSearch("");
    setDepSearchOpen(false);
    refresh();
    onChanged();
  }

  async function handleRemoveDependency(dependsOnId: number) {
    if (!task) return;
    await fetch(`/api/tasks/${task.id}/dependencies/${dependsOnId}`, {
      method: "DELETE",
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

                {/* Dependencies */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Dependencies</h3>
                  {task.dependencies.length > 0 ? (
                    <div className="space-y-1 mb-2">
                      {task.dependencies.map((dep) => {
                        const resolved =
                          dep.dependsOnStatus === "ARCHIVED";
                        return (
                          <div
                            key={dep.dependsOnId}
                            className={`flex items-center justify-between text-sm p-2 rounded ${resolved ? "bg-emerald-50" : "bg-amber-50"}`}
                          >
                            <div className="flex items-center gap-2">
                              {!resolved && (
                                <Lock className="size-3 text-amber-600" />
                              )}
                              <span>
                                #{dep.dependsOnId} {dep.dependsOnTitle}
                              </span>
                              <Badge
                                variant="secondary"
                                className={
                                  STATUS_CONFIG[dep.dependsOnStatus as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""
                                }
                              >
                                {STATUS_CONFIG[dep.dependsOnStatus as keyof typeof STATUS_CONFIG]?.label ??
                                  dep.dependsOnStatus}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                handleRemoveDependency(dep.dependsOnId)
                              }
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-2">
                      No dependencies
                    </p>
                  )}

                  <div className="relative" ref={depSearchRef}>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search tasks to add as dependency..."
                        value={depSearch}
                        onChange={(e) => {
                          setDepSearch(e.target.value);
                          setDepSearchOpen(true);
                        }}
                        onFocus={() => setDepSearchOpen(true)}
                        className="text-sm"
                      />
                    </div>
                    {depSearchOpen && depResults.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                        {depResults.map((t) => (
                          <button
                            key={t.id}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted/50"
                            onClick={() => handleAddDependency(t.id)}
                          >
                            <Plus className="size-3 shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              #{t.id} {t.title}
                            </span>
                            <Badge
                              variant="secondary"
                              className={`ml-auto shrink-0 ${STATUS_CONFIG[t.currentStatus as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""}`}
                            >
                              {STATUS_CONFIG[t.currentStatus as keyof typeof STATUS_CONFIG]?.label ??
                                t.currentStatus}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dependents (tasks that depend on this task) */}
                {task.dependents.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Depended on by
                    </h3>
                    <div className="space-y-1">
                      {task.dependents.map((dep) => (
                        <div
                          key={dep.taskId}
                          className="text-sm p-2 rounded bg-muted/50"
                        >
                          #{dep.taskId} {dep.taskTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

                {/* Subtasks */}
                {task.subtasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Subtasks</h3>
                    <div className="space-y-1">
                      {task.subtasks.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                        >
                          <span>{sub.title}</span>
                          <Badge
                            variant="secondary"
                            className={
                              STATUS_CONFIG[sub.currentStatus as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""
                            }
                          >
                            {STATUS_CONFIG[sub.currentStatus as keyof typeof STATUS_CONFIG]?.label ?? sub.currentStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Status History</h3>
                  <div className="space-y-2">
                    {task.statusHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Clock className="size-3" />
                        <Badge
                          variant="secondary"
                          className={STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""}
                        >
                          {STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.label ?? entry.status}
                        </Badge>
                        <span>{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Comments */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Comments</h3>
                  <div className="space-y-3">
                    {task.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="text-sm p-3 rounded bg-muted/50"
                      >
                        <Markdown content={comment.content} />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive h-auto p-1"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                    >
                      {submitting ? "Adding..." : "Add Comment"}
                    </Button>
                  </div>
                </div>
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
