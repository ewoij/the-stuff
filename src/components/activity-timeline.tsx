"use client";

import { useMemo, useState } from "react";
import { useActivity } from "@/lib/hooks/use-activity";
import { TASK_STATUSES, STATUS_CONFIG } from "@/lib/constants/task-statuses";
import { BarChart3 } from "lucide-react";
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
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString([], { hour: "numeric" });
}

interface ActivityTimelineProps {
  projectId: number;
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [hours, setHours] = useState(24);
  const { buckets, loading } = useActivity(projectId, hours);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { filled, maxTotal } = useMemo(() => {
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

    let maxTotal = 0;
    for (const b of filled) {
      const total = Object.values(b.counts).reduce((s, n) => s + n, 0);
      if (total > maxTotal) maxTotal = total;
    }

    return { filled, maxTotal };
  }, [buckets, hours]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
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

  return (
    <div className="rounded-lg border bg-card p-3 mb-4 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="size-4 text-muted-foreground" />
          Activity
          <span className="text-xs font-normal text-muted-foreground">
            {totalEvents} event{totalEvents !== 1 ? "s" : ""}
          </span>
        </div>
        <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
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
      </div>

      <div className="relative">
        <div
          className="flex items-end gap-px"
          style={{ height: 80 }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {filled.map((b, i) => {
            const total = Object.values(b.counts).reduce((s, n) => s + n, 0);
            const pct = maxTotal > 0 ? total / maxTotal : 0;
            const barH = Math.max(pct * 72, total > 0 ? 4 : 0);

            const segments: { status: string; height: number }[] = [];
            if (total > 0) {
              for (const status of TASK_STATUSES) {
                const count = b.counts[status] ?? 0;
                if (count > 0) {
                  segments.push({
                    status,
                    height: (count / total) * barH,
                  });
                }
              }
            }

            return (
              <div
                key={b.bucket}
                className="relative flex-1 flex flex-col justify-end"
                style={{ height: 80 }}
                onMouseEnter={() => setHoveredIdx(i)}
              >
                <div className="flex flex-col justify-end rounded-sm overflow-hidden">
                  {segments.map((seg, j) => (
                    <div
                      key={seg.status}
                      className={`${STATUS_COLORS[seg.status] ?? "bg-gray-300"} ${
                        j === 0 ? "rounded-t-sm" : ""
                      } ${j === segments.length - 1 ? "rounded-b-sm" : ""} w-full`}
                      style={{ height: seg.height }}
                    />
                  ))}
                </div>
                {total === 0 && (
                  <div className="w-full rounded-sm bg-muted/30" style={{ height: 2 }} />
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
        {TASK_STATUSES.filter((s) => s !== "DRAFT" && s !== "ARCHIVED").map(
          (status) => (
            <div
              key={status}
              className="flex items-center gap-1 text-[10px] text-muted-foreground"
            >
              <div
                className={`size-2 rounded-full ${STATUS_COLORS[status]}`}
              />
              {STATUS_CONFIG[status].label}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Tooltip({
  bucket,
  index,
  total,
}: {
  bucket: { bucket: string; counts: Record<string, number> };
  index: number;
  total: number;
}) {
  const entries = TASK_STATUSES.filter(
    (s) => (bucket.counts[s] ?? 0) > 0
  ).map((s) => ({
    status: s,
    label: STATUS_CONFIG[s].label,
    count: bucket.counts[s],
    color: STATUS_COLORS[s],
  }));

  const eventTotal = Object.values(bucket.counts).reduce((s, n) => s + n, 0);
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
      <div className="mt-0.5 pt-0.5 border-t text-muted-foreground">
        {eventTotal} total
      </div>
    </div>
  );
}
