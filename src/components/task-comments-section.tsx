"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { Markdown } from "@/components/markdown";
import type { TaskDetail } from "@/lib/types";

interface TaskCommentsSectionProps {
  task: TaskDetail;
  refresh: () => void;
}

export function TaskCommentsSection({
  task,
  refresh,
}: TaskCommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to add comment");
      }
      setNewComment("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId: number) {
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete comment");
      }
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete comment");
    }
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Comments</h3>
      <div className="space-y-3">
        {task.comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet</p>
        )}
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
  );
}
