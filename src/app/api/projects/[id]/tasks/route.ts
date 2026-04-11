import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { latestStatusSubquery } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);

  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      parentTaskId: tasks.parentTaskId,
      branch: tasks.branch,
      pr: tasks.pr,
      title: tasks.title,
      content: tasks.content,
      sortOrder: tasks.sortOrder,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      currentStatus: latestStatusSubquery.status,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.sortOrder, tasks.createdAt);

  return NextResponse.json(rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const [created] = await db
    .insert(tasks)
    .values({
      projectId,
      parentTaskId: body.parentTaskId ?? null,
      branch: body.branch ?? null,
      pr: body.pr ?? null,
      title: body.title,
      content: body.content ?? null,
    })
    .returning();

  // Insert initial TODO status
  await db.insert(taskStatus).values({
    taskId: created.id,
    status: "TODO",
  });

  return NextResponse.json({ ...created, currentStatus: "TODO" }, { status: 201 });
}
