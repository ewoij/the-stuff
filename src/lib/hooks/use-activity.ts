"use client";

import { useFetch } from "./use-fetch";

export interface ActivityBucket {
  bucket: string;
  counts: Record<string, number>;
}

export function useActivity(projectId: number, hours = 24) {
  const { data, loading, error, refresh } = useFetch<ActivityBucket[]>(
    `/api/projects/${projectId}/activity?hours=${hours}`,
    []
  );
  return { buckets: data, loading, error, refresh };
}
