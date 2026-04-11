import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const agentId: number | undefined = body.agentId;
  const taskId: number | null = body.taskId ?? null;

  if (!agentId) {
    return jsonError("agentId is required", 400);
  }

  const result = await db
    .update(agents)
    .set({
      lastHeartbeat: sql`(current_timestamp)`,
      currentTaskId: taskId,
    })
    .where(eq(agents.id, agentId))
    .returning();

  if (result.length === 0) {
    return jsonError("Agent not found", 404);
  }

  return jsonOk({ ok: true });
}
