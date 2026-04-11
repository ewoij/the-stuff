import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = Number(id);

  await db.delete(agents).where(eq(agents.id, agentId));

  return NextResponse.json({ ok: true });
}
