import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);
  const body = await request.json();

  if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
    return NextResponse.json(
      { error: "tasks must be a non-empty array of { id, sortOrder }" },
      { status: 400 }
    );
  }

  for (const t of body.tasks) {
    if (typeof t.id !== "number" || typeof t.sortOrder !== "number") {
      return NextResponse.json(
        { error: "each task must have numeric id and sortOrder" },
        { status: 400 }
      );
    }
  }

  const taskIds = body.tasks.map((t: { id: number }) => t.id);

  // Validate all task IDs belong to the given project
  const existingTasks = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), inArray(tasks.id, taskIds)));

  const existingIds = new Set(existingTasks.map((t) => t.id));
  const invalidIds = taskIds.filter((id: number) => !existingIds.has(id));

  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: `task IDs not found in project: ${invalidIds.join(", ")}` },
      { status: 400 }
    );
  }

  // Update all sort orders in a single transaction
  await db.transaction(async (tx) => {
    for (const { id, sortOrder } of body.tasks) {
      await tx
        .update(tasks)
        .set({ sortOrder, updatedAt: sql`(current_timestamp)` })
        .where(eq(tasks.id, id));
    }
  });

  return new NextResponse(null, { status: 204 });
}
