import { db } from ".";
import { tasks, taskStatus } from "./schema";
import { eq, desc, sql, and } from "drizzle-orm";

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
