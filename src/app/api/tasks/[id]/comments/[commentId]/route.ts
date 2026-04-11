import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { taskComments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);
  const cmtId = parseId(commentId);
  if (!cmtId) return jsonError("Invalid comment ID", 400);

  const body = await request.json();

  if (!body.content) {
    return jsonError("content is required", 400);
  }

  const [updated] = await db
    .update(taskComments)
    .set({
      content: body.content,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(taskComments.id, cmtId))
    .returning();

  if (!updated) {
    return jsonError("Comment not found", 404);
  }
  return jsonOk(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id, commentId } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);
  const cmtId = parseId(commentId);
  if (!cmtId) return jsonError("Invalid comment ID", 400);

  const [deleted] = await db
    .delete(taskComments)
    .where(eq(taskComments.id, cmtId))
    .returning();
  if (!deleted) {
    return jsonError("Comment not found", 404);
  }
  return jsonOk({ ok: true });
}
