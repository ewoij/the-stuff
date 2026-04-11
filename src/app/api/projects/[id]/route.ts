import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .get();
  if (!project) {
    return jsonError("Project not found", 404);
  }
  return jsonOk(project);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const body = await request.json();
  const [updated] = await db
    .update(projects)
    .set({
      ...(body.name !== undefined && { name: body.name }),
      ...(body.content !== undefined && { content: body.content }),
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(projects.id, projectId))
    .returning();
  if (!updated) {
    return jsonError("Project not found", 404);
  }
  return jsonOk(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, projectId))
    .returning();
  if (!deleted) {
    return jsonError("Project not found", 404);
  }
  return jsonOk({ ok: true });
}
