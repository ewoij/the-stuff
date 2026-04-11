import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq, sql, and, gt } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);

  // Prune agents with heartbeat older than 60 seconds
  await db
    .delete(agents)
    .where(
      and(
        eq(agents.projectId, projectId),
        gt(
          sql`(strftime('%s', 'now') - strftime('%s', ${agents.lastHeartbeat}))`,
          60
        )
      )
    );

  // Return remaining active agents
  const rows = await db
    .select()
    .from(agents)
    .where(eq(agents.projectId, projectId))
    .orderBy(agents.createdAt);

  return NextResponse.json(rows);
}
