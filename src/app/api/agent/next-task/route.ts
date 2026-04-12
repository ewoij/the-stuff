import { NextRequest } from "next/server";
import { db, sqlite } from "@/lib/db";
import { tasks, taskStatus, agents, agentHistory } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { jsonError, jsonOk } from "@/lib/api-response";
import { AGENT_ALIVE_THRESHOLD_SECONDS } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const projectId: number | undefined = body.projectId;
  const agentId: number | undefined = body.agentId;

  const result = sqlite.transaction(() => {
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
      .leftJoin(
        db
          .select({
            taskId: agentHistory.taskId,
            agentId: agentHistory.agentId,
            rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${agentHistory.taskId} ORDER BY ${agentHistory.id} DESC)`.as(
              "rn"
            ),
          })
          .from(agentHistory)
          .where(sql`${agentHistory.taskId} IS NOT NULL`)
          .as("last_ah"),
        and(
          eq(tasks.id, sql`last_ah.task_id`),
          sql`last_ah.rn = 1`
        )
      )
      .leftJoin(
        agents,
        and(
          eq(agents.id, sql`last_ah.agent_id`),
          sql`(strftime('%s','now') - strftime('%s', ${agents.lastHeartbeat})) <= ${AGENT_ALIVE_THRESHOLD_SECONDS}`
        )
      )
      .where(
        and(
          sql`latest_status.status = 'TODO'`,
          projectId ? eq(tasks.projectId, projectId) : undefined,
          sql`NOT EXISTS (
            SELECT 1 FROM task_dependencies td
            INNER JOIN (
              SELECT task_id, status FROM task_status
              WHERE id IN (SELECT MAX(id) FROM task_status GROUP BY task_id)
            ) dep_status ON td.depends_on_id = dep_status.task_id
            WHERE td.task_id = ${tasks.id}
            AND dep_status.status NOT IN ('ARCHIVED')
          )`,
          sql`NOT EXISTS (
            SELECT 1 FROM task_dependencies td
            WHERE td.task_id = ${tasks.id}
            AND NOT EXISTS (
              SELECT 1 FROM task_status WHERE task_id = td.depends_on_id
            )
          )`,
          agentId
            ? sql`(${agents.id} IS NULL OR ${agents.id} = ${agentId})`
            : undefined
        )
      )
      .orderBy(
        ...(agentId
          ? [
              sql`CASE WHEN ${agents.id} = ${agentId} THEN 0 ELSE 1 END`,
              tasks.sortOrder,
              tasks.createdAt,
            ]
          : [tasks.sortOrder, tasks.createdAt])
      )
      .limit(1)
      .get();

    if (!candidate) return null;

    db.insert(taskStatus)
      .values({ taskId: candidate.id, status: "PROGRESS" })
      .run();

    const SORT_ORDER_GAP = 65536;
    const task = db.select({ projectId: tasks.projectId }).from(tasks).where(eq(tasks.id, candidate.id)).get()!;
    const maxResult = db
      .select({ maxOrder: sql<number>`COALESCE(MAX(${tasks.sortOrder}), 0)` })
      .from(tasks)
      .where(eq(tasks.projectId, task.projectId))
      .get();
    const nextSortOrder = (maxResult?.maxOrder ?? 0) + SORT_ORDER_GAP;

    db.update(tasks)
      .set({ sortOrder: nextSortOrder, updatedAt: sql`(current_timestamp)` })
      .where(eq(tasks.id, candidate.id))
      .run();

    return db.select().from(tasks).where(eq(tasks.id, candidate.id)).get();
  })();

  if (!result) {
    return jsonError("No tasks available", 404);
  }

  return jsonOk({ ...result, currentStatus: "PROGRESS" });
}
