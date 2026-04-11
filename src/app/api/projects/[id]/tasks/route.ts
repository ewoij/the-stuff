import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { getNextSortOrder, getProjectTasksWithStatus } from "@/lib/db/queries";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const result = await getProjectTasksWithStatus(projectId);
  return jsonOk(result);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const body = await request.json();

  if (!body.title) {
    return jsonError("title is required", 400);
  }

  const sortOrder = await getNextSortOrder(projectId);

  const [created] = await db
    .insert(tasks)
    .values({
      projectId,
      parentTaskId: body.parentTaskId ?? null,
      branch: body.branch ?? null,
      pr: body.pr ?? null,
      title: body.title,
      content: body.content ?? null,
      sortOrder,
    })
    .returning();

  // Insert initial status (defaults to DRAFT)
  const initialStatus = body.draft === false ? "TODO" : "DRAFT";
  await db.insert(taskStatus).values({
    taskId: created.id,
    status: initialStatus,
  });

  return jsonOk({ ...created, currentStatus: initialStatus }, 201);
}
