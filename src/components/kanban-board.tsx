"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskCard } from "@/components/task-card";
import type { TaskWithStatus } from "@/lib/types";

const STATUSES = ["DRAFT", "TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

interface KanbanBoardProps {
  tasks: TaskWithStatus[];
  onStatusChange: (taskId: number, status: string) => void;
  onTaskClick: (taskId: number) => void;
  onReorder: (status: string, orderedIds: number[]) => void;
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
  onReorder,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const grouped = STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.currentStatus === status);
      return acc;
    },
    {} as Record<string, TaskWithStatus[]>
  );

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      // Find which column the active item belongs to
      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask?.currentStatus) return;

      const status = activeTask.currentStatus;
      const columnTasks = grouped[status];
      if (!columnTasks) return;

      const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
      const newIndex = columnTasks.findIndex((t) => t.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      onReorder(
        status,
        reordered.map((t) => t.id)
      );
    },
    [tasks, grouped, onReorder]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={grouped[status]}
            onStatusChange={onStatusChange}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onStatusChange={onStatusChange}
            onClick={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
