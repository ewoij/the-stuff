"use client";

import { useCallback } from "react";
import { useFetch } from "./use-fetch";
import type { TaskWithStatus } from "@/lib/types";

export function useTasks(projectId: number, paused = false) {
  const {
    data: tasks,
    loading,
    error,
    refresh,
    setData: setTasks,
  } = useFetch<TaskWithStatus[]>(
    `/api/projects/${projectId}/tasks`,
    [],
    { pollInterval: 10_000, paused }
  );

  const reorderTask = useCallback(
    async (
      taskId: number,
      previousTaskId: number | null,
      nextTaskId: number | null
    ) => {
      // Use functional update to capture the true current state for rollback
      let rollback: TaskWithStatus[] | undefined;
      setTasks((current) => {
        rollback = current;
        const task = current.find((t) => t.id === taskId);
        if (!task) return current;
        const without = current.filter((t) => t.id !== taskId);

        if (nextTaskId != null) {
          const nextIdx = without.findIndex((t) => t.id === nextTaskId);
          if (nextIdx !== -1) {
            without.splice(nextIdx, 0, task);
            return without;
          }
        }
        if (previousTaskId != null) {
          const prevIdx = without.findIndex((t) => t.id === previousTaskId);
          if (prevIdx !== -1) {
            without.splice(prevIdx + 1, 0, task);
            return without;
          }
        }
        // Fallback: put at end
        without.push(task);
        return without;
      });

      try {
        const res = await fetch(
          `/api/projects/${projectId}/tasks/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId, previousTaskId, nextTaskId }),
          }
        );
        if (!res.ok) throw new Error("Reorder failed");
      } catch {
        if (rollback) setTasks(rollback);
      }
    },
    [projectId, setTasks]
  );

  return { tasks, loading, error, refresh, reorderTask };
}
