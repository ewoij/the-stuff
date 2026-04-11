import { NextRequest } from "next/server";
import { execFile } from "child_process";
import { db } from "@/lib/db";
import { tasks, taskStatus } from "@/lib/db/schema";
import { eq, sql, and, ne, isNotNull } from "drizzle-orm";
import { latestStatusSubquery, getNextSortOrder } from "@/lib/db/queries";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

function parsePrUrl(url: string) {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/
  );
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: match[3] };
}

async function isPrMerged(owner: string, repo: string, number: string): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(
      "gh",
      ["pr", "view", number, "--repo", `${owner}/${repo}`, "--json", "state", "--jq", ".state"],
      (error: Error | null, stdout: string) => {
        if (error) {
          resolve(false);
          return;
        }
        resolve(stdout.trim() === "MERGED");
      }
    );
  });
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

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

  return jsonOk({ archived, count: archived.length });
}
