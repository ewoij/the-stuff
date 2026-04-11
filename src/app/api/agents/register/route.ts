import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { agents } from "@/lib/db/schema";
import { jsonError, jsonOk } from "@/lib/api-response";

const ADJECTIVES = [
  "Swift", "Bright", "Silent", "Vivid", "Bold",
  "Calm", "Eager", "Gentle", "Keen", "Lively",
  "Noble", "Quick", "Sharp", "Warm", "Wise",
  "Brave", "Clear", "Deft", "Fair", "Grand",
];

const NOUNS = [
  "Maple", "Storm", "River", "Falcon", "Cedar",
  "Coral", "Ember", "Frost", "Jade", "Lark",
  "Moss", "Pebble", "Quartz", "Sage", "Thorn",
  "Birch", "Dusk", "Flint", "Haze", "Ivy",
];

function generateName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const projectId: number | undefined = body.projectId;

  if (!projectId) {
    return jsonError("projectId is required", 400);
  }

  const name = generateName();

  const [created] = await db
    .insert(agents)
    .values({ projectId, name })
    .returning();

  return jsonOk({ id: created.id, name: created.name }, 201);
}
