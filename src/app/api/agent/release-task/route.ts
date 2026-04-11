import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getTaskProjectIdAndNextSortOrder } from "@/lib/db/queries";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { taskId } = body as { taskId: number };

  if (!taskId) {
    return jsonError("taskId is required", 400);
  }

  // Set status back to TODO
  await db.insert(taskStatus).values({ taskId, status: "TODO" });

  // Get task's project to compute next sort_order
  const result = await getTaskProjectIdAndNextSortOrder(taskId);
  const sortOrder = result?.sortOrder;

  // Update sortOrder and updatedAt
  await db
    .update(tasks)
    .set({
      ...(sortOrder !== undefined && { sortOrder }),
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(tasks.id, taskId));

  const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).get();

  return jsonOk({ ...task, currentStatus: "TODO" });
}
