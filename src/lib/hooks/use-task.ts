"use client";

import { useFetch } from "./use-fetch";
import type { TaskDetail } from "@/lib/types";

export function useTask(taskId: number | null) {
  const url = taskId !== null ? `/api/tasks/${taskId}` : null;
  const { data: task, loading, error, refresh } = useFetch<TaskDetail | null>(url, null);

  return { task, loading, error, refresh };
}
