"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, X, Plus } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { STATUS_CONFIG } from "@/lib/constants/task-statuses";
import type { TaskDetail, TaskWithStatus } from "@/lib/types";

interface TaskDependencySectionProps {
  task: TaskDetail;
  refresh: () => void;
  onChanged: () => void;
}

export function TaskDependencySection({
  task,
  refresh,
  onChanged,
}: TaskDependencySectionProps) {
  const [depSearch, setDepSearch] = useState("");
  const [depResults, setDepResults] = useState<TaskWithStatus[]>([]);
  const [depSearchOpen, setDepSearchOpen] = useState(false);
  const depSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!depSearch.trim()) {
      setDepResults([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/projects/${task.projectId}/tasks`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to search tasks");
        return r.json();
      })
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
      .catch((err) => {
        if (err.name !== "AbortError") {
          toast.error("Failed to search tasks");
        }
      });
    return () => controller.abort();
  }, [depSearch, task]);

  async function handleAddDependency(dependsOnId: number) {
    try {
      const res = await fetch(`/api/tasks/${task.id}/dependencies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dependsOnId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to add dependency");
      }
      setDepSearch("");
      setDepSearchOpen(false);
      refresh();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add dependency");
    }
  }

  async function handleRemoveDependency(dependsOnId: number) {
    try {
      const res = await fetch(`/api/tasks/${task.id}/dependencies/${dependsOnId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Failed to remove dependency");
      }
      refresh();
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove dependency");
    }
  }

  return (
    <>
      {/* Dependencies */}
      <div>
        <h3 className="text-sm font-medium mb-2">Dependencies</h3>
        {task.dependencies.length > 0 ? (
          <div className="space-y-1 mb-2">
            {task.dependencies.map((dep) => {
              const resolved = dep.dependsOnStatus === "ARCHIVED";
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
                    onClick={() => handleRemoveDependency(dep.dependsOnId)}
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
          <h3 className="text-sm font-medium mb-2">Depended on by</h3>
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
    </>
  );
}
