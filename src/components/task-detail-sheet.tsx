"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useTask } from "@/lib/hooks/use-task";
import { GitBranch, ExternalLink, Clock, Pencil } from "lucide-react";

const STATUSES = ["TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-blue-100 text-blue-800",
  PROGRESS: "bg-yellow-100 text-yellow-800",
  DONE: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-600",
};

interface TaskDetailSheetProps {
  taskId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

export function TaskDetailSheet({
  taskId,
  open,
  onOpenChange,
  onChanged,
}: TaskDetailSheetProps) {
  const { task, loading, refresh } = useTask(open ? taskId : null);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        {loading || !task ? (
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between gap-2">
                <SheetTitle>{task.title}</SheetTitle>
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
                  className={STATUS_COLORS[task.currentStatus ?? ""] ?? ""}
                  variant="secondary"
                >
                  {task.currentStatus}
                </Badge>
              </div>
            </SheetHeader>

            <div className="px-4 space-y-6 pb-8">
              {/* Description */}
              {task.content && (
                <p className="text-sm text-muted-foreground">{task.content}</p>
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

              {/* Status actions */}
              <div>
                <h3 className="text-sm font-medium mb-2">Change Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.filter((s) => s !== task.currentStatus).map(
                    (status) => (
                      <Button
                        key={status}
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(status)}
                      >
                        {status}
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
                            STATUS_COLORS[sub.currentStatus ?? ""] ?? ""
                          }
                        >
                          {sub.currentStatus}
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
                        className={STATUS_COLORS[entry.status] ?? ""}
                      >
                        {entry.status}
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
                      <p className="whitespace-pre-wrap">{comment.content}</p>
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
      </SheetContent>

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
    </Sheet>
  );
}
