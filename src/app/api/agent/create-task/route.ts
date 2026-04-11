import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, title, content, parentTaskId, branch, pr } = body as {
    projectId: number;
    title: string;
    content?: string;
    parentTaskId?: number;
    branch?: string;
    pr?: string;
  };

  if (!projectId || !title) {
    return NextResponse.json(
      { error: "projectId and title are required" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(tasks)
    .values({
      projectId,
      title,
      content: content ?? null,
      parentTaskId: parentTaskId ?? null,
      branch: branch ?? null,
      pr: pr ?? null,
    })
    .returning();

  await db.insert(taskStatus).values({
    taskId: created.id,
    status: "TODO",
  });

  return NextResponse.json(
    { ...created, currentStatus: "TODO" },
    { status: 201 }
  );
}
