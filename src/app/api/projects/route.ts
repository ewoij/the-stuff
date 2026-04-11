import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";

export async function GET() {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(projects.createdAt);
  return NextResponse.json(allProjects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const [created] = await db
    .insert(projects)
    .values({
      name: body.name,
      content: body.content ?? null,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
