"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/task-card";
import type { TaskWithStatus } from "@/lib/types";

interface SortableTaskCardProps {
  task: TaskWithStatus;
  onStatusChange: (taskId: number, status: string) => void;
  onClick: () => void;
}

export function SortableTaskCard({
  task,
  onStatusChange,
  onClick,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onStatusChange={onStatusChange} onClick={onClick} />
    </div>
  );
}
