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

  return { tasks, loading, refresh };
}
