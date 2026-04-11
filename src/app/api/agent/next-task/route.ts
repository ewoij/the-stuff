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
    // Find the oldest task whose latest status is TODO
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
          projectId ? eq(tasks.projectId, projectId) : undefined
        )
      )
      .orderBy(tasks.createdAt)
      .limit(1)
      .get();

    if (!candidate) return null;

    // Set status to PROGRESS
    db.insert(taskStatus)
      .values({ taskId: candidate.id, status: "PROGRESS" })
      .run();

    // Update the task's updatedAt
    db.update(tasks)
      .set({ updatedAt: sql`(current_timestamp)` })
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
