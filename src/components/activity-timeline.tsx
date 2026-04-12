"use client";

import { useMemo, useState, useEffect } from "react";
import { useActivity } from "@/lib/hooks/use-activity";
import {
  TASK_STATUSES,
  STATUS_CONFIG,
  type TaskStatusValue,
} from "@/lib/constants/task-statuses";
import { BarChart3, ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const STATUS_COLORS: Record<string, string> = {
  DONE: "bg-emerald-400",
  PROGRESS: "bg-amber-400",
  TODO: "bg-blue-400",
  DRAFT: "bg-purple-400",
  ARCHIVED: "bg-gray-400",
};

const RANGE_OPTIONS = [
  { value: "24", label: "Last 24h" },
  { value: "48", label: "Last 48h" },
  { value: "72", label: "Last 3 days" },
  { value: "168", label: "Last 7 days" },
];

const STORAGE_KEY = "activity-timeline-collapsed";

function formatHour(bucket: string): string {
  const d = new Date(bucket.replace(" ", "T") + ":00");
  if (isNaN(d.getTime())) return bucket;
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: "numeric" });
  }
  return (
    d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "numeric" })
  );
}

interface ActivityTimelineProps {
  projectId: number;
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [hours, setHours] = useState(24);
  const { buckets, loading } = useActivity(projectId, hours);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [hiddenStatuses, setHiddenStatuses] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const visibleStatuses = useMemo(
    () => TASK_STATUSES.filter((s) => !hiddenStatuses.has(s)),
    [hiddenStatuses]
  );

  const { filled, maxPerStatus } = useMemo(() => {
    const now = new Date();
    const startHour = new Date(now.getTime() - hours * 3600_000);
    startHour.setMinutes(0, 0, 0);

    const bucketMap = new Map(buckets.map((b) => [b.bucket, b.counts]));

    const filled = [];
    const cursor = new Date(startHour);
    while (cursor <= now) {
      const key =
        cursor.getFullYear() +
        "-" +
        String(cursor.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(cursor.getDate()).padStart(2, "0") +
        " " +
        String(cursor.getHours()).padStart(2, "0") +
        ":00";
      filled.push({ bucket: key, counts: bucketMap.get(key) ?? {} });
      cursor.setHours(cursor.getHours() + 1);
    }

    const maxPerStatus: Record<string, number> = {};
    for (const status of TASK_STATUSES) {
      let max = 0;
      for (const b of filled) {
        const c = b.counts[status] ?? 0;
        if (c > max) max = c;
      }
      maxPerStatus[status] = max;
    }

    return { filled, maxPerStatus };
  }, [buckets, hours]);

  function toggleStatus(status: string) {
    setHiddenStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground mb-4 shrink-0">
        <BarChart3 className="size-4" />
        Loading activity...
      </div>
    );
  }

  const totalEvents = filled.reduce(
    (s, b) => s + Object.values(b.counts).reduce((a, n) => a + n, 0),
    0
  );

  if (totalEvents === 0) {
    return null;
  }

  const presentStatuses = TASK_STATUSES.filter((s) =>
    filled.some((b) => (b.counts[s] ?? 0) > 0)
  );

  return (
    <div className="rounded-lg border bg-card p-3 mb-4 shrink-0">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium hover:text-foreground/80 transition-colors"
          onClick={() => setCollapsed((c) => !c)}
        >
          <BarChart3 className="size-4 text-muted-foreground" />
          Activity
          <span className="text-xs font-normal text-muted-foreground">
            {totalEvents} event{totalEvents !== 1 ? "s" : ""}
          </span>
          <ChevronDown
            className={`size-3.5 text-muted-foreground transition-transform ${
              collapsed ? "-rotate-90" : ""
            }`}
          />
        </button>
        {!collapsed && (
          <Select
            value={String(hours)}
            onValueChange={(v) => setHours(Number(v))}
          >
            <SelectTrigger className="h-7 w-auto gap-1 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!collapsed && (
        <>
          <div className="relative mt-2">
            <div
              className="flex items-end gap-px"
              style={{ height: 80 }}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {filled.map((b, i) => {
                const hasAny = visibleStatuses.some(
                  (s) => (b.counts[s] ?? 0) > 0
                );

                return (
                  <div
                    key={b.bucket}
                    className="relative flex-1 flex items-end justify-center gap-px"
                    style={{ height: 80 }}
                    onMouseEnter={() => setHoveredIdx(i)}
                  >
                    {hasAny ? (
                      visibleStatuses.map((status) => {
                        const count = b.counts[status] ?? 0;
                        const max = maxPerStatus[status] ?? 0;
                        if (count === 0) return null;
                        const pct = max > 0 ? count / max : 0;
                        const barH = Math.max(pct * 72, 4);
                        return (
                          <div
                            key={status}
                            className={`${STATUS_COLORS[status] ?? "bg-gray-300"} rounded-t-sm flex-1 min-w-0`}
                            style={{ height: barH }}
                          />
                        );
                      })
                    ) : (
                      <div
                        className="w-full rounded-sm bg-muted/30"
                        style={{ height: 2 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {hoveredIdx !== null && filled[hoveredIdx] && (
              <Tooltip
                bucket={filled[hoveredIdx]}
                index={hoveredIdx}
                total={filled.length}
                hiddenStatuses={hiddenStatuses}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">
              {formatHour(filled[0]?.bucket ?? "")}
            </span>
            <span className="text-[10px] text-muted-foreground">Now</span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            {presentStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className={`flex items-center gap-1 text-[10px] transition-opacity ${
                  hiddenStatuses.has(status)
                    ? "opacity-30"
                    : "text-muted-foreground"
                }`}
                onClick={() => toggleStatus(status)}
              >
                <div
                  className={`size-2 rounded-full ${STATUS_COLORS[status]}`}
                />
                {STATUS_CONFIG[status as TaskStatusValue].label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Tooltip({
  bucket,
  index,
  total,
  hiddenStatuses,
}: {
  bucket: { bucket: string; counts: Record<string, number> };
  index: number;
  total: number;
  hiddenStatuses: Set<string>;
}) {
  const entries = TASK_STATUSES.filter(
    (s) => !hiddenStatuses.has(s) && (bucket.counts[s] ?? 0) > 0
  ).map((s) => ({
    status: s,
    label: STATUS_CONFIG[s].label,
    count: bucket.counts[s],
    color: STATUS_COLORS[s],
  }));

  if (entries.length === 0) return null;

  const eventTotal = entries.reduce((s, e) => s + (e.count ?? 0), 0);
  const alignRight = index > total * 0.7;

  return (
    <div
      className={`absolute z-10 top-0 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md ${
        alignRight ? "right-0" : "left-0"
      }`}
    >
      <div className="font-medium mb-1">{formatHour(bucket.bucket)}</div>
      {entries.map((e) => (
        <div key={e.status} className="flex items-center gap-1.5">
          <div className={`size-2 rounded-full ${e.color}`} />
          <span className="text-muted-foreground">{e.label}:</span>
          <span className="font-medium">{e.count}</span>
        </div>
      ))}
      {entries.length > 1 && (
        <div className="mt-0.5 pt-0.5 border-t text-muted-foreground">
          {eventTotal} total
        </div>
      )}
    </div>
  );
}
