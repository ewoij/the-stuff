import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/constants/task-statuses";
import type { TaskWithStatus } from "@/lib/types";

interface TaskSubtasksListProps {
  subtasks: TaskWithStatus[];
}

export function TaskSubtasksList({ subtasks }: TaskSubtasksListProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Subtasks</h3>
      {subtasks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No subtasks</p>
      ) : (
      <div className="space-y-1">
        {subtasks.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
          >
            <span>{sub.title}</span>
            <Badge
              variant="secondary"
              className={
                STATUS_CONFIG[sub.currentStatus as keyof typeof STATUS_CONFIG]?.badgeColor ?? ""
              }
            >
              {STATUS_CONFIG[sub.currentStatus as keyof typeof STATUS_CONFIG]?.label ?? sub.currentStatus}
            </Badge>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
