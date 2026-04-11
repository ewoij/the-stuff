import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Expect body: { orderedIds: number[] }
  // Each id gets a sort_order matching its index in the array
  const orderedIds: number[] = body.orderedIds;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json(
      { error: "orderedIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // Update sort_order for each task in a single transaction
  db.transaction((tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      tx.update(tasks)
        .set({ sortOrder: i })
        .where(eq(tasks.id, orderedIds[i]))
        .run();
    }
  });

  return NextResponse.json({ ok: true });
}
