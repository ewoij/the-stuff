import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const agentId: number | undefined = body.agentId;
  const taskId: number | null = body.taskId ?? null;

  if (!agentId) {
    return NextResponse.json(
      { error: "agentId is required" },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
