"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { TaskWithStatus } from "@/lib/types";

export function useTasks(projectId: number, paused = false) {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    setTasks(await res.json());
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      if (!pausedRef.current) refresh();
    }, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  const reorderTask = useCallback(
    async (
      taskId: number,
      previousTaskId: number | null,
      nextTaskId: number | null
    ) => {
      // Optimistic: move the task between its neighbors in local state
      const prev = tasks;
      setTasks((current) => {
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
        setTasks(prev);
      }
    },
    [tasks, projectId]
  );

  return { tasks, loading, refresh, reorderTask };
}
