import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus, agents, taskDependencies } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { latestStatusSubquery, getNextSortOrder } from "@/lib/db/queries";

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
      agentName: agents.name,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .leftJoin(agents, eq(tasks.id, agents.currentTaskId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.sortOrder, desc(tasks.createdAt));

  // Compute which tasks are blocked (have unresolved dependencies)
  const blockedRows = await db
    .select({ taskId: taskDependencies.taskId })
    .from(taskDependencies)
    .innerJoin(
      sql`(
        SELECT task_id, status FROM task_status
        WHERE id IN (SELECT MAX(id) FROM task_status GROUP BY task_id)
      ) AS dep_status`,
      sql`${taskDependencies.dependsOnId} = dep_status.task_id`
    )
    .where(sql`dep_status.status NOT IN ('ARCHIVED')`);

  // Also find tasks that depend on tasks with no status
  const blockedNoStatus = await db
    .select({ taskId: taskDependencies.taskId })
    .from(taskDependencies)
    .where(
      sql`NOT EXISTS (
        SELECT 1 FROM task_status WHERE task_id = ${taskDependencies.dependsOnId}
      )`
    );

  const blockedIds = new Set([
    ...blockedRows.map((r) => r.taskId),
    ...blockedNoStatus.map((r) => r.taskId),
  ]);

  const result = rows.map((row) => ({
    ...row,
    isBlocked: blockedIds.has(row.id),
  }));

  return NextResponse.json(result);
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

  return NextResponse.json({ ...created, currentStatus: initialStatus }, { status: 201 });
}
