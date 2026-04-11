import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { latestStatusSubquery } from "@/lib/db/queries";

const VALID_STATUSES = ["TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await request.json();

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // Get the task's project so we can compute sort_order within the new column
  const task = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Find the max sort_order among tasks in the target status column
  const [maxRow] = await db
    .select({
      maxSortOrder: sql<number>`COALESCE(MAX(${tasks.sortOrder}), -1)`,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(
      and(
        eq(tasks.projectId, task.projectId),
        eq(latestStatusSubquery.status, body.status)
      )
    );

  const newSortOrder = (maxRow?.maxSortOrder ?? -1) + 1;

  // Insert the new status and update sort_order in a transaction
  const [created] = await db.transaction(async (tx) => {
    await tx
      .update(tasks)
      .set({ sortOrder: newSortOrder, updatedAt: sql`(current_timestamp)` })
      .where(eq(tasks.id, taskId));

    return tx
      .insert(taskStatus)
      .values({
        taskId,
        status: body.status,
      })
      .returning();
  });

  return NextResponse.json(created, { status: 201 });
}
