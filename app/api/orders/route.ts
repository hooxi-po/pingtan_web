import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getDb } from "@/lib/db"
import { getUserBySession } from "@/lib/auth"
import type { Order } from "@/lib/schema"
import { z } from "zod"

const BaseOrderSchema = z
  .object({
    type: z.enum(["accommodation", "food", "attraction"]),
    itemId: z.number().int().positive(),
    totalPrice: z.number().int().nonnegative(),
  })
  .extend({
    // 是否已支付：true 则创建为“待使用”，false 则为“待付款”
    paid: z.boolean().optional(),
  })

const AccommodationPayload = BaseOrderSchema.extend({
  type: z.literal("accommodation"),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number().int().positive(),
  guests: z.number().int().positive(),
  rooms: z.number().int().positive(),
  roomType: z.string().optional(),
})

const FoodPayload = BaseOrderSchema.extend({
  type: z.literal("food"),
  date: z.string(),
  time: z.string(),
  guests: z.number().int().positive(),
})

const AttractionPayload = BaseOrderSchema.extend({
  type: z.literal("attraction"),
  date: z.string(),
  guests: z.number().int().positive(),
})

export async function GET() {
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
      WHERE user_id = $1
      ORDER BY order_date DESC`,
      [user.id]
    )
    return NextResponse.json(res.rows)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  let parsed:
    | { success: true; data: z.infer<typeof AccommodationPayload> | z.infer<typeof FoodPayload> | z.infer<typeof AttractionPayload> }
    | { success: false; error: z.ZodError }

  const type = (body as any)?.type
  if (type === "accommodation") parsed = AccommodationPayload.safeParse(body)
  else if (type === "food") parsed = FoodPayload.safeParse(body)
  else if (type === "attraction") parsed = AttractionPayload.safeParse(body)
  else parsed = { success: false, error: new z.ZodError([]) }

  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 })
  }

  const data = parsed.data

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

    // Get item snapshot info and contact
    let itemName = ""
    let image = ""
    let orderAddress: string | null = null
    let orderPhone: string | null = null
    if (data.type === "accommodation") {
      const res = await db.query(`SELECT name, image, address, phone FROM accommodations WHERE id = $1 LIMIT 1`, [data.itemId])
      itemName = res.rows[0]?.name || ""
      image = res.rows[0]?.image || ""
      orderAddress = res.rows[0]?.address ?? null
      orderPhone = res.rows[0]?.phone ?? null
    } else if (data.type === "food") {
      const res = await db.query(`SELECT name, image, address, phone FROM restaurants WHERE id = $1 LIMIT 1`, [data.itemId])
      itemName = res.rows[0]?.name || ""
      image = res.rows[0]?.image || ""
      orderAddress = res.rows[0]?.address ?? null
      orderPhone = res.rows[0]?.phone ?? null
    } else {
      const res = await db.query(`SELECT name, image FROM attractions WHERE id = $1 LIMIT 1`, [data.itemId])
      itemName = res.rows[0]?.name || ""
      image = res.rows[0]?.image || ""
    }

    const status = (data as any).paid ? "待使用" : "待付款"
    const insertRes = await db.query(
      `INSERT INTO orders (
        user_id, type, item_id, item_name, image, status, total_price,
        address, phone, check_in, check_out, nights, guests, rooms, room_type, date, time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      ) RETURNING id`,
      [
        user.id,
        data.type,
        data.itemId,
        itemName,
        image,
        status,
        data.totalPrice,
        orderAddress,
        orderPhone,
        data.type === "accommodation" ? data.checkIn : null,
        data.type === "accommodation" ? data.checkOut : null,
        data.type === "accommodation" ? data.nights : null,
        data.guests,
        data.type === "accommodation" ? data.rooms : null,
        data.type === "accommodation" ? data.roomType || null : null,
        data.type === "accommodation" ? null : data.date,
        data.type === "food" ? data.time : null,
      ]
    )

    const id = insertRes.rows[0]?.id as number
    return NextResponse.json({ id }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
  }
}