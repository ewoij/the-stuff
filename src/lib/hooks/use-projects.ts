"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProjectWithStats } from "@/lib/types";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/projects/with-stats");
    setProjects(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, loading, refresh };
}
