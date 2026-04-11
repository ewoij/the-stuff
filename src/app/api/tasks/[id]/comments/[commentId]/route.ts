import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskComments } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await params;
  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(taskComments)
    .set({
      content: body.content,
      updatedAt: sql`(current_timestamp)`,
    })
    .where(eq(taskComments.id, Number(commentId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { commentId } = await params;
  const [deleted] = await db
    .delete(taskComments)
    .where(eq(taskComments.id, Number(commentId)))
    .returning();
  if (!deleted) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
