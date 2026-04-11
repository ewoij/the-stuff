"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskCard } from "@/components/task-card";
import type { TaskWithStatus } from "@/lib/types";

const STATUSES = ["DRAFT", "TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

function groupByStatus(tasks: TaskWithStatus[]) {
  return STATUSES.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.currentStatus === status);
      return acc;
    },
    {} as Record<string, TaskWithStatus[]>
  );
}

function findColumnForId(
  columns: Record<string, TaskWithStatus[]>,
  id: number | string
): string | null {
  if (typeof id === "string" && id in columns) return id;
  for (const [status, columnTasks] of Object.entries(columns)) {
    if (columnTasks.some((t) => t.id === id)) return status;
  }
  return null;
}

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
  const [columns, setColumns] = useState<Record<string, TaskWithStatus[]>>(
    () => groupByStatus(tasks)
  );
  const dragSourceStatus = useRef<string | null>(null);

  // Sync columns with tasks prop when not dragging
  useEffect(() => {
    if (activeId !== null) return;
    setColumns(groupByStatus(tasks));
  }, [tasks, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId) ?? null
    : null;

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const taskId = event.active.id as number;
      setActiveId(taskId);
      const task = tasks.find((t) => t.id === taskId);
      dragSourceStatus.current = task?.currentStatus ?? null;
    },
    [tasks]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumns((prev: Record<string, TaskWithStatus[]>) => {
      const activeColumn = findColumnForId(prev, active.id);
      const overColumn = findColumnForId(prev, over.id);

      if (!activeColumn || !overColumn || activeColumn === overColumn) {
        return prev;
      }

      const activeItems = [...prev[activeColumn]];
      const overItems = [...prev[overColumn]];

      const activeIndex = activeItems.findIndex((t) => t.id === active.id);
      if (activeIndex === -1) return prev;

      const [movedTask] = activeItems.splice(activeIndex, 1);

      const overIndex = overItems.findIndex((t) => t.id === over.id);
      if (overIndex !== -1) {
        overItems.splice(overIndex, 0, movedTask);
      } else {
        overItems.push(movedTask);
      }

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn]: overItems,
      };
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const sourceStatus = dragSourceStatus.current;
      dragSourceStatus.current = null;
      if (!sourceStatus) return;

      // Determine destination: check the over target in the original tasks
      let destStatus: string;
      if (typeof over.id === "string" && STATUSES.includes(over.id as (typeof STATUSES)[number])) {
        destStatus = over.id;
      } else {
        const overTask = tasks.find((t) => t.id === over.id);
        if (!overTask?.currentStatus) return;
        destStatus = overTask.currentStatus;
      }

      if (sourceStatus === destStatus) {
        // Same column reorder
        if (active.id === over.id) return;
        const grouped = groupByStatus(tasks);
        const columnTasks = grouped[sourceStatus];
        if (!columnTasks) return;
        const oldIndex = columnTasks.findIndex((t) => t.id === active.id);
        const newIndex = columnTasks.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reordered = arrayMove(columnTasks, oldIndex, newIndex);
        onReorder(
          sourceStatus,
          reordered.map((t) => t.id)
        );
      } else {
        // Cross-column move
        onStatusChange(Number(active.id), destStatus);
      }
    },
    [tasks, onReorder, onStatusChange]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 h-full">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status] ?? []}
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
