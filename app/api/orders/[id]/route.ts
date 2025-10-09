import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"
import { getUserBySession } from "@/lib/auth"
import type { Order } from "@/lib/schema"

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getUserBySession(token)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  try {
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        item_id INT NOT NULL,
        item_name TEXT,
        image TEXT,
        status TEXT NOT NULL DEFAULT '待使用',
        total_price INT NOT NULL,
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        address TEXT,
        phone TEXT,
        check_in DATE,
        check_out DATE,
        nights INT,
        guests INT,
        rooms INT,
        room_type TEXT,
        date DATE,
        time TEXT
      )
    `)

    const res = await db.query<Order>(
      `SELECT
        id,
        user_id AS "userId",
        type,
        item_id AS "itemId",
        COALESCE(item_name, '') AS "itemName",
        image,
        status,
        total_price AS "totalPrice",
        to_char(order_date, 'YYYY-MM-DD HH24:MI') AS "orderDate",
        address,
        phone,
        room_type AS "roomType",
        COALESCE(to_char(check_in, 'YYYY-MM-DD'), '') AS "checkIn",
        COALESCE(to_char(check_out, 'YYYY-MM-DD'), '') AS "checkOut",
        COALESCE(nights, 0) AS nights,
        COALESCE(guests, 0) AS guests,
        COALESCE(rooms, 0) AS rooms,
        COALESCE(to_char(date, 'YYYY-MM-DD'), '') AS date,
        COALESCE(time, '') AS time
      FROM orders
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
      [id, user.id]
    )
    const row = res.rows[0]
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await getUserBySession(token)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = getDb()
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 })
  }

  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const action = (body as any)?.action as string
  if (!["pay", "use", "cancel"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  try {
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        item_id INT NOT NULL,
        item_name TEXT,
        image TEXT,
        status TEXT NOT NULL DEFAULT '待使用',
        total_price INT NOT NULL,
        order_date TIMESTAMP NOT NULL DEFAULT NOW(),
        address TEXT,
        phone TEXT,
        check_in DATE,
        check_out DATE,
        nights INT,
        guests INT,
        rooms INT,
        room_type TEXT,
        date DATE,
        time TEXT
      )
    `)

    // Get current status
    const curRes = await db.query<{ status: string }>(`SELECT status FROM orders WHERE id = $1 AND user_id = $2`, [id, user.id])
    const cur = curRes.rows[0]
    if (!cur) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    let nextStatus = cur.status
    if (action === "pay" && cur.status === "待付款") nextStatus = "待使用"
    else if (action === "use" && cur.status === "待使用") nextStatus = "已完成"
    else if (action === "cancel" && ["待付款", "待使用"].includes(cur.status)) nextStatus = "已取消"
    else {
      return NextResponse.json({ error: "Invalid state transition" }, { status: 400 })
    }

    await db.query(`UPDATE orders SET status = $1 WHERE id = $2 AND user_id = $3`, [nextStatus, id, user.id])

    const res = await db.query<Order>(
      `SELECT
        id,
        user_id AS "userId",
        type,
        item_id AS "itemId",
        COALESCE(item_name, '') AS "itemName",
        image,
        status,
        total_price AS "totalPrice",
        to_char(order_date, 'YYYY-MM-DD HH24:MI') AS "orderDate",
        address,
        phone,
        room_type AS "roomType",
        COALESCE(to_char(check_in, 'YYYY-MM-DD'), '') AS "checkIn",
        COALESCE(to_char(check_out, 'YYYY-MM-DD'), '') AS "checkOut",
        COALESCE(nights, 0) AS nights,
        COALESCE(guests, 0) AS guests,
        COALESCE(rooms, 0) AS rooms,
        COALESCE(to_char(date, 'YYYY-MM-DD'), '') AS date,
        COALESCE(time, '') AS time
      FROM orders
      WHERE id = $1 AND user_id = $2
      LIMIT 1`,
      [id, user.id]
    )
    const row = res.rows[0]
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}