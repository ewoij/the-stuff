import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskDependencies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await request.json();
  const dependsOnId = Number(body.dependsOnId);

  if (!dependsOnId || isNaN(dependsOnId)) {
    return NextResponse.json(
      { error: "dependsOnId is required" },
      { status: 400 }
    );
  }

  if (taskId === dependsOnId) {
    return NextResponse.json(
      { error: "A task cannot depend on itself" },
      { status: 400 }
    );
  }

  // Verify both tasks exist
  const task = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();
  const dependsOn = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, dependsOnId))
    .get();

  if (!task || !dependsOn) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  try {
    const [created] = await db
      .insert(taskDependencies)
      .values({ taskId, dependsOnId })
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "Dependency already exists" },
        { status: 409 }
      );
    }
    throw err;
  }
}
