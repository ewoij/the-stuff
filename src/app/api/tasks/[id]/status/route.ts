import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getNextSortOrder } from "@/lib/db/queries";

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

  const [created] = await db
    .insert(taskStatus)
    .values({
      taskId,
      status: body.status,
    })
    .returning();

  // Move task to bottom of destination column
  const task = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();

  if (task) {
    const sortOrder = await getNextSortOrder(task.projectId);
    await db
      .update(tasks)
      .set({ sortOrder, updatedAt: sql`(current_timestamp)` })
      .where(eq(tasks.id, taskId));
  }

  return NextResponse.json(created, { status: 201 });
}
