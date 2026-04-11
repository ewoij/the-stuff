import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus, taskComments, taskDependencies } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getCurrentStatus, latestStatusSubquery } from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);

  const task = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .get();

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const currentStatus = await getCurrentStatus(taskId);

  const statusHistory = await db
    .select()
    .from(taskStatus)
    .where(eq(taskStatus.taskId, taskId))
    .orderBy(desc(taskStatus.createdAt));

  const comments = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(taskComments.createdAt);

  // Get subtasks with their current status
  const subtasks = await db
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
    .where(eq(tasks.parentTaskId, taskId))
    .orderBy(tasks.sortOrder, desc(tasks.createdAt));

  // Get dependencies (tasks this task depends on)
  const depRows = await db
    .select({
      id: taskDependencies.id,
      taskId: taskDependencies.taskId,
      dependsOnId: taskDependencies.dependsOnId,
      dependsOnTitle: tasks.title,
      dependsOnStatus: latestStatusSubquery.status,
    })
    .from(taskDependencies)
    .innerJoin(tasks, eq(taskDependencies.dependsOnId, tasks.id))
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(eq(taskDependencies.taskId, taskId));

  // Get dependents (tasks that depend on this task)
  const depOfRows = await db
    .select({
      taskId: taskDependencies.taskId,
      taskTitle: sql<string>`dep_task.title`,
    })
    .from(taskDependencies)
    .innerJoin(
      sql`tasks as dep_task`,
      sql`${taskDependencies.taskId} = dep_task.id`
    )
    .where(eq(taskDependencies.dependsOnId, taskId));

  return NextResponse.json({
    ...task,
    currentStatus,
    statusHistory,
    comments,
    subtasks,
    dependencies: depRows,
    dependents: depOfRows,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
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
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [deleted] = await db
    .delete(tasks)
    .where(eq(tasks.id, Number(id)))
    .returning();
  if (!deleted) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
