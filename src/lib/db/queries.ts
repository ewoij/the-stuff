import { db } from ".";
import {
  tasks,
  taskStatus,
  taskComments,
  taskDependencies,
  agents,
} from "./schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import type { TaskDetail, TaskWithStatus } from "../types";

/** Gap between sort_order values. Large enough to allow many insertions before rebalancing. */
export const SORT_ORDER_GAP = 65536;

export async function getCurrentStatus(taskId: number) {
  const [latest] = await db
    .select()
    .from(taskStatus)
    .where(eq(taskStatus.taskId, taskId))
    .orderBy(desc(taskStatus.id))
    .limit(1);
  return latest?.status ?? null;
}

export async function getNextSortOrder(projectId: number): Promise<number> {
  const [result] = await db
    .select({
      maxOrder: sql<number>`COALESCE(MAX(${tasks.sortOrder}), 0)`,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));
  return (result?.maxOrder ?? 0) + SORT_ORDER_GAP;
}

export async function getTaskProjectIdAndNextSortOrder(taskId: number) {
  const task = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();
  if (!task) return null;
  const sortOrder = await getNextSortOrder(task.projectId);
  return { projectId: task.projectId, sortOrder };
}

/**
 * Compute a sort_order value between two neighbors.
 * - Both null: returns GAP (first item)
 * - Only next: places before it by GAP
 * - Only prev: places after it by GAP
 * - Both: midpoint
 */
export function computeSortOrderBetween(
  prevSortOrder: number | null,
  nextSortOrder: number | null
): number {
  if (prevSortOrder == null && nextSortOrder == null) return SORT_ORDER_GAP;
  if (prevSortOrder == null) return nextSortOrder! - SORT_ORDER_GAP;
  if (nextSortOrder == null) return prevSortOrder + SORT_ORDER_GAP;
  return (prevSortOrder + nextSortOrder) / 2;
}

/**
 * Get the sort_order values for a task's neighbors given their IDs.
 * Returns [prevSortOrder, nextSortOrder] where either can be null.
 */
export async function getNeighborSortOrders(
  previousTaskId: number | null | undefined,
  nextTaskId: number | null | undefined
): Promise<[number | null, number | null]> {
  let prevSortOrder: number | null = null;
  let nextSortOrder: number | null = null;

  if (previousTaskId) {
    const prev = await db
      .select({ sortOrder: tasks.sortOrder })
      .from(tasks)
      .where(eq(tasks.id, previousTaskId))
      .get();
    prevSortOrder = prev?.sortOrder ?? null;
  }

  if (nextTaskId) {
    const next = await db
      .select({ sortOrder: tasks.sortOrder })
      .from(tasks)
      .where(eq(tasks.id, nextTaskId))
      .get();
    nextSortOrder = next?.sortOrder ?? null;
  }

  return [prevSortOrder, nextSortOrder];
}

/**
 * Rebalance sort_order values for all tasks in a specific column (project + status).
 * Redistributes values evenly with SORT_ORDER_GAP spacing.
 */
export async function rebalanceColumn(
  projectId: number,
  status: string
): Promise<void> {
  const columnTasks = await db
    .select({
      id: tasks.id,
      taskId: latestStatusSubquery.taskId,
    })
    .from(tasks)
    .innerJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(
      and(
        eq(tasks.projectId, projectId),
        sql`${latestStatusSubquery.status} = ${status}`
      )
    )
    .orderBy(tasks.sortOrder);

  for (let i = 0; i < columnTasks.length; i++) {
    const newSortOrder = (i + 1) * SORT_ORDER_GAP;
    await db
      .update(tasks)
      .set({ sortOrder: newSortOrder })
      .where(eq(tasks.id, columnTasks[i].id));
  }
}

/**
 * Check if rebalancing is needed (gap < 1 between neighbors) and rebalance if so.
 */
export async function rebalanceIfNeeded(
  projectId: number,
  status: string,
  prevSortOrder: number | null,
  nextSortOrder: number | null
): Promise<void> {
  if (
    prevSortOrder != null &&
    nextSortOrder != null &&
    nextSortOrder - prevSortOrder < 1
  ) {
    await rebalanceColumn(projectId, status);
  }
}

// Uses MAX(id) instead of MAX(created_at) because created_at has
// second-resolution and two status changes within the same second
// would be ambiguous. IDs are always unique and monotonically increasing.
export const latestStatusSubquery = db
  .select({
    taskId: taskStatus.taskId,
    status: taskStatus.status,
    maxId: sql<number>`MAX(${taskStatus.id})`.as("max_id"),
  })
  .from(taskStatus)
  .groupBy(taskStatus.taskId)
  .as("latest_status");

/**
 * Returns the set of task IDs that are blocked by unresolved dependencies.
 * A task is blocked if any dependency has a non-ARCHIVED status or no status at all.
 */
export async function getBlockedTaskIds(): Promise<Set<number>> {
  const blockedRows = await db
    .select({ taskId: taskDependencies.taskId })
    .from(taskDependencies)
    .innerJoin(
      sql`(
        SELECT task_id, status FROM task_status
        WHERE id IN (SELECT MAX(id) FROM task_status GROUP BY task_id)
      ) AS dep_status`,
      sql`${taskDependencies.dependsOnId} = dep_status.task_id`
    )
    .where(sql`dep_status.status NOT IN ('ARCHIVED')`);

  const blockedNoStatus = await db
    .select({ taskId: taskDependencies.taskId })
    .from(taskDependencies)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM task_status WHERE task_id = ${taskDependencies.dependsOnId}
      )`
    );

  return new Set([
    ...blockedRows.map((r) => r.taskId),
    ...blockedNoStatus.map((r) => r.taskId),
  ]);
}

/**
 * Returns all tasks for a project with their current status, agent name, and blocked flag.
 */
export async function getProjectTasksWithStatus(
  projectId: number
): Promise<TaskWithStatus[]> {
  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      parentTaskId: tasks.parentTaskId,
      branch: tasks.branch,
      pr: tasks.pr,
      title: tasks.title,
      content: tasks.content,
      sortOrder: tasks.sortOrder,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      currentStatus: latestStatusSubquery.status,
      agentName: agents.name,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .leftJoin(agents, eq(tasks.id, agents.currentTaskId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.sortOrder, desc(tasks.createdAt));

  const blockedIds = await getBlockedTaskIds();

  return rows.map((row) => ({
    ...row,
    isBlocked: blockedIds.has(row.id),
  }));
}

/**
 * Returns the full task detail (with status history, comments, subtasks,
 * dependencies, and dependents) or null if the task doesn't exist.
 */
export async function getTaskDetail(
  taskId: number
): Promise<TaskDetail | null> {
  const task = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();

  if (!task) return null;

  const currentStatus = await getCurrentStatus(taskId);

  const statusHistory = await db
    .select()
    .from(taskStatus)
    .where(eq(taskStatus.taskId, taskId))
    .orderBy(desc(taskStatus.createdAt));

  const comments = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(taskComments.createdAt);

  const subtasks = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      parentTaskId: tasks.parentTaskId,
      branch: tasks.branch,
      pr: tasks.pr,
      title: tasks.title,
      content: tasks.content,
      sortOrder: tasks.sortOrder,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      currentStatus: latestStatusSubquery.status,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(eq(tasks.parentTaskId, taskId))
    .orderBy(tasks.sortOrder, desc(tasks.createdAt));

  // Dependencies: tasks this task depends on
  const dependencies = await db
    .select({
      id: taskDependencies.id,
      taskId: taskDependencies.taskId,
      dependsOnId: taskDependencies.dependsOnId,
      dependsOnTitle: tasks.title,
      dependsOnStatus: latestStatusSubquery.status,
    })
    .from(taskDependencies)
    .innerJoin(tasks, eq(taskDependencies.dependsOnId, tasks.id))
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(eq(taskDependencies.taskId, taskId));

  // Dependents: tasks that depend on this task (using typed alias instead of raw SQL)
  const depTask = alias(tasks, "dep_task");
  const dependents = await db
    .select({
      taskId: taskDependencies.taskId,
      taskTitle: depTask.title,
    })
    .from(taskDependencies)
    .innerJoin(depTask, eq(taskDependencies.taskId, depTask.id))
    .where(eq(taskDependencies.dependsOnId, taskId));

  return {
    ...task,
    currentStatus,
    statusHistory,
    comments,
    subtasks: subtasks as TaskWithStatus[],
    dependencies,
    dependents,
  };
}
