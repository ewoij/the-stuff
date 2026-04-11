import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  getNeighborSortOrders,
  computeSortOrderBetween,
  rebalanceIfNeeded,
  getCurrentStatus,
} from "@/lib/db/queries";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);
  const body = await request.json();

  const { taskId, previousTaskId, nextTaskId } = body as {
    taskId: number;
    previousTaskId?: number | null;
    nextTaskId?: number | null;
  };

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId is required" },
      { status: 400 }
    );
  }

  const [prevSortOrder, nextSortOrder] = await getNeighborSortOrders(
    previousTaskId,
    nextTaskId
  );

  const newSortOrder = computeSortOrderBetween(prevSortOrder, nextSortOrder);

  await db
    .update(tasks)
    .set({ sortOrder: newSortOrder })
    .where(eq(tasks.id, taskId));

  // Rebalance if gap got too small
  const status = await getCurrentStatus(taskId);
  if (status) {
    await rebalanceIfNeeded(projectId, status, prevSortOrder, nextSortOrder);
  }

  return NextResponse.json({ ok: true });
}
