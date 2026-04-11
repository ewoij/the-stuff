"use client";

import { useFetch } from "./use-fetch";
import type { ProjectWithStats } from "@/lib/types";

export function useProjects() {
  const { data: projects, loading, error, refresh } = useFetch<ProjectWithStats[]>(
    "/api/projects/with-stats",
    []
  );

  return { projects, loading, error, refresh };
}
