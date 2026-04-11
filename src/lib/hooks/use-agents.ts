"use client";

import { useFetch } from "./use-fetch";
import type { Agent } from "@/lib/types";

export function useAgents(projectId: number) {
  const { data: agents, loading, error, refresh } = useFetch<Agent[]>(
    `/api/projects/${projectId}/agents`,
    [],
    { pollInterval: 10_000 }
  );

  return { agents, loading, error, refresh };
}
