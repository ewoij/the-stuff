"use client";

import { useState, useEffect, useCallback } from "react";
import type { Agent } from "@/lib/types";

export function useAgents(projectId: number) {
  const [agents, setAgents] = useState<Agent[]>([]);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/agents`);
    if (res.ok) {
      setAgents(await res.json());
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { agents };
}
