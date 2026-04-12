import { NextRequest } from "next/server";
import { sqlite } from "@/lib/db";
import { jsonError, jsonOk, parseId } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projectId = parseId(id);
  if (!projectId) return jsonError("Invalid project ID", 400);

  const hoursParam = request.nextUrl.searchParams.get("hours");
  const hours = Math.min(Math.max(Number(hoursParam) || 24, 1), 168);

  const since = new Date(Date.now() - hours * 3600_000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  const rows = sqlite
    .prepare(
      `SELECT strftime('%Y-%m-%d %H:00', ts.created_at) AS bucket,
              ts.status,
              COUNT(*) AS count
         FROM task_status ts
         JOIN tasks t ON t.id = ts.task_id
        WHERE t.project_id = ?
          AND ts.created_at >= ?
        GROUP BY bucket, ts.status
        ORDER BY bucket`
    )
    .all(projectId, since) as { bucket: string; status: string; count: number }[];

  const map = new Map<string, Record<string, number>>();
  for (const row of rows) {
    let entry = map.get(row.bucket);
    if (!entry) {
      entry = {};
      map.set(row.bucket, entry);
    }
    entry[row.status] = row.count;
  }

  const buckets = Array.from(map, ([bucket, counts]) => ({ bucket, counts }));

  return jsonOk(buckets);
}
