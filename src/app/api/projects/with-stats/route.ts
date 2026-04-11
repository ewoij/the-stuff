import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects, tasks, taskStatus, agents } from "@/lib/db/schema";
import { eq, sql, and, gt } from "drizzle-orm";

export async function GET() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(projects.createdAt);

  const heartbeatThreshold = new Date(
    Date.now() - 5 * 60 * 1000
  ).toISOString();

  const stats = await Promise.all(
    allProjects.map(async (project) => {
      // Get task counts by current status using a subquery for latest status
      const taskCounts = await db
        .select({
          status: taskStatus.status,
          count: sql<number>`count(*)`,
        })
        .from(tasks)
        .innerJoin(
          sql`(
            SELECT task_id, status FROM task_status
            WHERE id IN (SELECT MAX(id) FROM task_status GROUP BY task_id)
          ) AS ls`,
          sql`ls.task_id = ${tasks.id}`
        )
        .where(eq(tasks.projectId, project.id))
        .groupBy(sql`ls.status`);

      const counts: Record<string, number> = {};
      for (const row of taskCounts) {
        counts[row.status] = row.count;
      }

      // Get active agent count
      const [agentResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(agents)
        .where(
          and(
            eq(agents.projectId, project.id),
            gt(agents.lastHeartbeat, heartbeatThreshold)
          )
        );

      // Get last activity: most recent task status change or task creation
      const [lastActivity] = await db
        .select({
          lastStatusChange: sql<string>`MAX(${taskStatus.createdAt})`,
        })
        .from(taskStatus)
        .innerJoin(tasks, eq(tasks.id, taskStatus.taskId))
        .where(eq(tasks.projectId, project.id));

      return {
        ...project,
        taskCounts: {
          todo: counts["TODO"] ?? 0,
          inProgress: counts["PROGRESS"] ?? 0,
          done: counts["DONE"] ?? 0,
          draft: counts["DRAFT"] ?? 0,
          archived: counts["ARCHIVED"] ?? 0,
          total:
            (counts["TODO"] ?? 0) +
            (counts["PROGRESS"] ?? 0) +
            (counts["DONE"] ?? 0) +
            (counts["DRAFT"] ?? 0),
        },
        activeAgents: agentResult?.count ?? 0,
        lastActivity: lastActivity?.lastStatusChange ?? project.updatedAt,
      };
    })
  );

  return NextResponse.json(stats);
}
