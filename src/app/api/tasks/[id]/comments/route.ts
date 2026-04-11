import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskComments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await db
    .select()
    .from(taskComments)
    .where(eq(taskComments.taskId, Number(id)))
    .orderBy(taskComments.createdAt);
  return NextResponse.json(comments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(taskComments)
    .values({
      taskId: Number(id),
      content: body.content,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
