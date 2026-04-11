import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskStatus } from "@/lib/db/schema";

const VALID_STATUSES = ["TODO", "PROGRESS", "DONE", "ARCHIVED"] as const;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const taskId = Number(id);
  const body = await request.json();

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(taskStatus)
    .values({
      taskId,
      status: body.status,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
