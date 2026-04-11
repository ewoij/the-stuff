import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/constants/task-statuses";
import type { TaskStatus } from "@/lib/types";

interface TaskStatusHistoryProps {
  statusHistory: TaskStatus[];
}

export function TaskStatusHistory({ statusHistory }: TaskStatusHistoryProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Status History</h3>
      <div className="space-y-2">
        {statusHistory.length === 0 && (
          <p className="text-xs text-muted-foreground">No status changes recorded</p>
        )}
        {statusHistory.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Clock className="size-3" />
            <Badge
              variant="secondary"
              className={STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""}
            >
              {STATUS_CONFIG[entry.status as keyof typeof STATUS_CONFIG]?.label ?? entry.status}
            </Badge>
            <span>{new Date(entry.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
