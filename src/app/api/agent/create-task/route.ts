import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { getNextSortOrder } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, title, content, parentTaskId, branch, pr, draft } = body as {
    projectId: number;
    title: string;
    content?: string;
    parentTaskId?: number;
    branch?: string;
    pr?: string;
    draft?: boolean;
  };

  if (!projectId || !title) {
    return NextResponse.json(
      { error: "projectId and title are required" },
      { status: 400 }
    );
  }

  const sortOrder = await getNextSortOrder(projectId);

  const [created] = await db
    .insert(tasks)
    .values({
      projectId,
      title,
      content: content ?? null,
      parentTaskId: parentTaskId ?? null,
      branch: branch ?? null,
      pr: pr ?? null,
      sortOrder,
    })
    .returning();

  const initialStatus = draft ? "DRAFT" : "TODO";
  await db.insert(taskStatus).values({
    taskId: created.id,
    status: initialStatus,
  });

  return NextResponse.json(
    { ...created, currentStatus: initialStatus },
    { status: 201 }
  );
}
