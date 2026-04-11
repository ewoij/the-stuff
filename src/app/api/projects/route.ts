import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { jsonError, jsonOk } from "@/lib/api-response";

export async function GET() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(projects.createdAt);
  return jsonOk(allProjects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name) {
    return jsonError("name is required", 400);
  }
  const [created] = await db
    .insert(projects)
    .values({
      name: body.name,
      content: body.content ?? null,
    })
    .returning();
  return jsonOk(created, 201);
}
