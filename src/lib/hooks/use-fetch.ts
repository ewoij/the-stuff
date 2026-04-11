"use client";

import { useState, useEffect, useCallback, useRef, type Dispatch, type SetStateAction } from "react";

interface UseFetchOptions {
  /** Polling interval in milliseconds. If set, refetches on this interval. */
  pollInterval?: number;
  /** When true, polling is paused (fetches on mount and manual refresh still work). */
  paused?: boolean;
}

interface UseFetchResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setData: Dispatch<SetStateAction<T>>;
}

export function useFetch<T>(
  url: string | null,
  initialData: T,
  options?: UseFetchOptions
): UseFetchResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(url !== null);
  const [error, setError] = useState<string | null>(null);
  const pausedRef = useRef(options?.paused ?? false);
  pausedRef.current = options?.paused ?? false;

  const refresh = useCallback(async () => {
    if (url === null) {
      setData(initialData);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
      }
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    if (url === null) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function doFetch() {
      try {
        const res = await fetch(url!, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    doFetch();

    if (options?.pollInterval) {
      intervalId = setInterval(() => {
        if (!pausedRef.current) doFetch();
      }, options.pollInterval);
    }

    return () => {
      controller.abort();
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading, error, refresh, setData };
}
