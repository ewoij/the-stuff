import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  getNextSortOrder,
  getNeighborSortOrders,
  computeSortOrderBetween,
  rebalanceIfNeeded,
} from "@/lib/db/queries";
import { TASK_STATUSES } from "@/lib/constants/task-statuses";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const body = await request.json();

  if (!TASK_STATUSES.includes(body.status)) {
    return jsonError(`status must be one of: ${TASK_STATUSES.join(", ")}`, 400);
  }

  const [created] = await db
    .insert(taskStatus)
    .values({
      taskId,
      status: body.status,
    })
    .returning();

  const task = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();

  if (task) {
    const { previousTaskId, nextTaskId } = body as {
      previousTaskId?: number | null;
      nextTaskId?: number | null;
    };

    let sortOrder: number;

    if (previousTaskId !== undefined || nextTaskId !== undefined) {
      // Position specified — compute midpoint between neighbors
      const [prevSortOrder, nextSortOrder] = await getNeighborSortOrders(
        previousTaskId,
        nextTaskId
      );
      sortOrder = computeSortOrderBetween(prevSortOrder, nextSortOrder);

      await db
        .update(tasks)
        .set({ sortOrder, updatedAt: sql`(current_timestamp)` })
        .where(eq(tasks.id, taskId));

      await rebalanceIfNeeded(
        task.projectId,
        body.status,
        prevSortOrder,
        nextSortOrder
      );
    } else {
      // No position specified — append to end of column
      sortOrder = await getNextSortOrder(task.projectId);
      await db
        .update(tasks)
        .set({ sortOrder, updatedAt: sql`(current_timestamp)` })
        .where(eq(tasks.id, taskId));
    }
  }

  return jsonOk(created, 201);
}
