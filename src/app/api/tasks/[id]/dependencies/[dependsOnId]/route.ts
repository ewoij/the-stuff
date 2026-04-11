import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskDependencies } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; dependsOnId: string }> }
) {
  const { id, dependsOnId } = await params;
  const taskId = Number(id);
  const depId = Number(dependsOnId);

  const [deleted] = await db
    .delete(taskDependencies)
    .where(
      and(
        eq(taskDependencies.taskId, taskId),
        eq(taskDependencies.dependsOnId, depId)
      )
    )
    .returning();

  if (!deleted) {
    return NextResponse.json(
      { error: "Dependency not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
