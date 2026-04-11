"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskWithStatus } from "@/lib/types";

export function useTasks(projectId: number) {
  const [tasks, setTasks] = useState<TaskWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    setTasks(await res.json());
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const reorderTasks = useCallback(
    async (status: string, orderedIds: number[]) => {
      // Optimistically update local state
      const prev = tasks;
      setTasks((current) => {
        const inColumn = current.filter((t) => t.currentStatus === status);
        const outside = current.filter((t) => t.currentStatus !== status);
        const idOrder = new Map(orderedIds.map((id, i) => [id, i]));
        inColumn.sort(
          (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0)
        );
        return [...outside, ...inColumn];
      });

      try {
        const res = await fetch(
          `/api/projects/${projectId}/tasks/reorder`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderedIds }),
          }
        );
        if (!res.ok) throw new Error("Reorder failed");
      } catch {
        // Revert on error
        setTasks(prev);
      }
    },
    [tasks, projectId]
  );

  return { tasks, loading, refresh, reorderTasks };
}
