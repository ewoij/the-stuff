import { db } from ".";
import { taskStatus } from "./schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getCurrentStatus(taskId: number) {
  const [latest] = await db
    .select()
    .from(taskStatus)
    .where(eq(taskStatus.taskId, taskId))
    .orderBy(desc(taskStatus.id))
    .limit(1);
  return latest?.status ?? null;
}

// Uses MAX(id) instead of MAX(created_at) because created_at has
// second-resolution and two status changes within the same second
// would be ambiguous. IDs are always unique and monotonically increasing.
export const latestStatusSubquery = db
  .select({
    taskId: taskStatus.taskId,
    status: taskStatus.status,
    maxId: sql<number>`MAX(${taskStatus.id})`.as("max_id"),
  })
  .from(taskStatus)
  .groupBy(taskStatus.taskId)
  .as("latest_status");
