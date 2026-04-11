import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getNextSortOrder } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { taskId, branch, pr } = body as {
    taskId: number;
    branch?: string;
    pr?: string;
  };

  if (!taskId) {
    return NextResponse.json(
      { error: "taskId is required" },
      { status: 400 }
    );
  }

  // Set status to DONE
  await db.insert(taskStatus).values({ taskId, status: "DONE" });

  // Get task's project to compute next sort_order
  const existing = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();
  const sortOrder = existing ? await getNextSortOrder(existing.projectId) : undefined;

  // Update task fields
  await db
    .update(tasks)
    .set({
      ...(branch !== undefined && { branch }),
      ...(pr !== undefined && { pr }),
      ...(sortOrder !== undefined && { sortOrder }),
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(tasks.id, taskId));

  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();

  return NextResponse.json({ ...task, currentStatus: "DONE" });
}
