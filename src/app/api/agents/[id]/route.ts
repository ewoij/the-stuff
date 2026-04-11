import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = parseId(id);
  if (!agentId) return jsonError("Invalid agent ID", 400);

  await db.delete(agents).where(eq(agents.id, agentId));

  return jsonOk({ ok: true });
}
