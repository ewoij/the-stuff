import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql, and, ne, isNotNull } from "drizzle-orm";
import { latestStatusSubquery, getNextSortOrder } from "@/lib/db/queries";

function parsePrUrl(url: string) {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: match[3] };
}

async function isPrMerged(owner: string, repo: string, number: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${number}/merge`,
    { headers }
  );
  // 204 = merged, 404 = not merged
  return res.status === 204;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = Number(id);

  // Find all non-archived tasks that have a PR URL
  const rows = await db
    .select({
      id: tasks.id,
      pr: tasks.pr,
      currentStatus: latestStatusSubquery.status,
    })
    .from(tasks)
    .leftJoin(latestStatusSubquery, eq(tasks.id, latestStatusSubquery.taskId))
    .where(
      and(
        eq(tasks.projectId, projectId),
        isNotNull(tasks.pr),
        ne(tasks.pr, "")
      )
    );

  const nonArchived = rows.filter((r) => r.currentStatus !== "ARCHIVED");

  const archived: number[] = [];

  for (const task of nonArchived) {
    const parsed = parsePrUrl(task.pr!);
    if (!parsed) continue;

    const merged = await isPrMerged(parsed.owner, parsed.repo, parsed.number);
    if (!merged) continue;

    await db.insert(taskStatus).values({
      taskId: task.id,
      status: "ARCHIVED",
    });

    const sortOrder = await getNextSortOrder(projectId);
    await db
      .update(tasks)
      .set({ sortOrder, updatedAt: sql`(current_timestamp)` })
      .where(eq(tasks.id, task.id));

    archived.push(task.id);
  }

  return NextResponse.json({ archived, count: archived.length });
}
