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
import { TASK_STATUSES } from "@/lib/constants/task-statuses";

function groupByStatus(tasks: TaskWithStatus[]) {
  return TASK_STATUSES.reduce(
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

/** Extract neighbor IDs for a task at a given index within a column. */
function getNeighborIds(
  columnTasks: TaskWithStatus[],
  index: number
): { previousTaskId: number | null; nextTaskId: number | null } {
  return {
    previousTaskId: index > 0 ? columnTasks[index - 1].id : null,
    nextTaskId: index < columnTasks.length - 1 ? columnTasks[index + 1].id : null,
  };
}

interface KanbanBoardProps {
  tasks: TaskWithStatus[];
  onStatusChange: (
    taskId: number,
    status: string,
    previousTaskId: number | null,
    nextTaskId: number | null
  ) => void;
  onTaskClick: (taskId: number) => void;
  onReorder: (
    taskId: number,
    previousTaskId: number | null,
    nextTaskId: number | null
  ) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function KanbanBoard({
  tasks,
  onStatusChange,
  onTaskClick,
  onReorder,
  onDragStart: onDragStartProp,
  onDragEnd: onDragEndProp,
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
      onDragStartProp?.();
    },
    [tasks, onDragStartProp]
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setColumns((prev: Record<string, TaskWithStatus[]>) => {
      const activeColumn = findColumnForId(prev, active.id);
      const overColumn = findColumnForId(prev, over.id);

      if (!activeColumn || !overColumn) {
        return prev;
      }

      if (activeColumn === overColumn) {
        const items = [...prev[activeColumn]];
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
          return prev;
        return {
          ...prev,
          [activeColumn]: arrayMove(items, oldIndex, newIndex),
        };
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
      onDragEndProp?.();

      if (!over) return;

      const sourceStatus = dragSourceStatus.current;
      dragSourceStatus.current = null;
      if (!sourceStatus) return;

      // Determine destination column
      let destStatus: string;
      if (typeof over.id === "string" && TASK_STATUSES.includes(over.id as (typeof TASK_STATUSES)[number])) {
        destStatus = over.id;
      } else {
        // Check the visual columns state (updated by handleDragOver) for cross-column
        const col = findColumnForId(columns, over.id);
        if (!col) return;
        destStatus = col;
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
        const movedIndex = reordered.findIndex((t) => t.id === active.id);
        const neighbors = getNeighborIds(reordered, movedIndex);

        onReorder(Number(active.id), neighbors.previousTaskId, neighbors.nextTaskId);
      } else {
        // Cross-column move — use visual columns state to get exact position
        const destTasks = columns[destStatus] ?? [];
        const movedIndex = destTasks.findIndex((t) => t.id === Number(active.id));

        if (movedIndex !== -1) {
          const neighbors = getNeighborIds(destTasks, movedIndex);
          onStatusChange(Number(active.id), destStatus, neighbors.previousTaskId, neighbors.nextTaskId);
        } else {
          // Task not found in visual state — drop at end
          onStatusChange(Number(active.id), destStatus, null, null);
        }
      }
    },
    [tasks, columns, onReorder, onStatusChange, onDragEndProp]
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    onDragEndProp?.();
  }, [onDragEndProp]);

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
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={columns[status] ?? []}
            onStatusChange={(taskId, s) => onStatusChange(taskId, s, null, null)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onStatusChange={(taskId, s) => onStatusChange(taskId, s, null, null)}
            onClick={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
