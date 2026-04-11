import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getTaskDetail } from "@/lib/db/queries";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const detail = await getTaskDetail(taskId);
  if (!detail) {
    return jsonError("Task not found", 404);
  }
  return jsonOk(detail);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const body = await request.json();

  const [updated] = await db
    .update(tasks)
    .set({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.content !== undefined && { content: body.content }),
      ...(body.branch !== undefined && { branch: body.branch }),
      ...(body.pr !== undefined && { pr: body.pr }),
      ...(body.parentTaskId !== undefined && {
        parentTaskId: body.parentTaskId,
      }),
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) {
    return jsonError("Task not found", 404);
  }
  return jsonOk(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const [deleted] = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();
  if (!deleted) {
    return jsonError("Task not found", 404);
  }
  return jsonOk({ ok: true });
}
