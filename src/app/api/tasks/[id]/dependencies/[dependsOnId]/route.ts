import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { taskDependencies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; dependsOnId: string }> }
) {
  const { id, dependsOnId } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);
  const depId = parseId(dependsOnId);
  if (!depId) return jsonError("Invalid dependency ID", 400);

  const [deleted] = await db
    .delete(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnId, depId)
      )
    )
    .returning();

  if (!deleted) {
    return jsonError("Dependency not found", 404);
  }

  return jsonOk({ ok: true });
}
