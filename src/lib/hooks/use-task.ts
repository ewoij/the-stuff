"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskDetail } from "@/lib/types";

export function useTask(taskId: number | null) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (taskId === null) {
      setTask(null);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/tasks/${taskId}`);
    setTask(await res.json());
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { task, loading, refresh };
}
