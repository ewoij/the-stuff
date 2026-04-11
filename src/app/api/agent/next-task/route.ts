import { NextRequest, NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const projectId: number | undefined = body.projectId;

  // Use a synchronous transaction for atomicity.
  // SQLite's single-writer model ensures no two agents grab the same task.
  const result = sqlite.transaction(() => {
    // Find the oldest TODO task that has no unresolved dependencies.
    // A dependency is unresolved if the depends_on task's latest status
    // is NOT 'ARCHIVED'.
    const candidate = db
      .select({ id: tasks.id })
      .from(tasks)
      .innerJoin(
        db
          .select({
            taskId: taskStatus.taskId,
            status: taskStatus.status,
            maxId: sql<number>`MAX(${taskStatus.id})`.as("max_id"),
          })
          .from(taskStatus)
          .groupBy(taskStatus.taskId)
          .as("latest_status"),
        eq(tasks.id, sql`latest_status.task_id`)
      )
      .where(
        and(
          sql`latest_status.status = 'TODO'`,
          projectId ? eq(tasks.projectId, projectId) : undefined,
          // Exclude tasks that have any dependency whose status is not ARCHIVED
          sql`NOT EXISTS (
            SELECT 1 FROM task_dependencies td
            INNER JOIN (
              SELECT task_id, status FROM task_status
              WHERE id IN (SELECT MAX(id) FROM task_status GROUP BY task_id)
            ) dep_status ON td.depends_on_id = dep_status.task_id
            WHERE td.task_id = ${tasks.id}
            AND dep_status.status NOT IN ('ARCHIVED')
          )`,
          // Also exclude tasks that depend on tasks with no status at all
          sql`NOT EXISTS (
            SELECT 1 FROM task_dependencies td
            WHERE td.task_id = ${tasks.id}
            AND NOT EXISTS (
              SELECT 1 FROM task_status WHERE task_id = td.depends_on_id
            )
          )`
        )
      )
      .orderBy(tasks.sortOrder, tasks.createdAt)
      .limit(1)
      .get();

    if (!candidate) return null;

    // Set status to PROGRESS
    db.insert(taskStatus)
      .values({ taskId: candidate.id, status: "PROGRESS" })
      .run();

    // Compute next sort_order for the project and update
    const SORT_ORDER_GAP = 65536;
    const task = db.select({ projectId: tasks.projectId }).from(tasks).where(eq(tasks.id, candidate.id)).get()!;
    const maxResult = db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${tasks.sortOrder}), 0)` })
      .from(tasks)
      .where(eq(tasks.projectId, task.projectId))
      .get();
    const nextSortOrder = (maxResult?.maxOrder ?? 0) + SORT_ORDER_GAP;

    // Update the task's sortOrder and updatedAt
    db.update(tasks)
      .set({ sortOrder: nextSortOrder, updatedAt: sql`(current_timestamp)` })
      .where(eq(tasks.id, candidate.id))
      .run();

    // Return the full task
    return db.select().from(tasks).where(eq(tasks.id, candidate.id)).get();
  })();

  if (!result) {
    return NextResponse.json(
      { message: "No tasks available" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ...result, currentStatus: "PROGRESS" });
}
