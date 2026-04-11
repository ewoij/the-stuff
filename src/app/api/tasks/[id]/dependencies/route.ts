import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskDependencies } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const body = await request.json();
  const dependsOnId = parseId(String(body.dependsOnId ?? ""));

  if (!dependsOnId) {
    return jsonError("dependsOnId is required", 400);
  }

  if (taskId === dependsOnId) {
    return jsonError("A task cannot depend on itself", 400);
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
    return jsonError("Task not found", 404);
  }

  try {
    const [created] = await db
      .insert(taskDependencies)
      .values({ taskId, dependsOnId })
      .returning();
    return jsonOk(created, 201);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("UNIQUE constraint failed")
    ) {
      return jsonError("Dependency already exists", 409);
    }
    throw err;
  }
}
