import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { taskComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const comments = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(taskComments.createdAt);
  return jsonOk(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = parseId(id);
  if (!taskId) return jsonError("Invalid task ID", 400);

  const body = await request.json();

  if (!body.content) {
    return jsonError("content is required", 400);
  }

  const [created] = await db
    .insert(taskComments)
    .values({
      taskId,
      content: body.content,
    })
    .returning();

  return jsonOk(created, 201);
}
