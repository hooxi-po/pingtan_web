import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import type { Restaurant } from "@/lib/schema"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    const res = await db.query<Restaurant>(
      `SELECT id, name, category, image, rating, reviews, avg_price AS "avgPrice", distance, tags, description, specialty, address, phone FROM restaurants WHERE id = $1 LIMIT 1`,
      [id]
    )
    const item = res.rows[0]
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (e) {
    return NextResponse.json({ error: "Query failed" }, { status: 500 })
  }
}