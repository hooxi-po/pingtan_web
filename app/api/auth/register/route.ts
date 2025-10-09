import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { z } from "zod"
import { hashPassword } from "@/lib/auth"

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
})

export async function POST(request: Request) {
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

  const parsed = RegisterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 })
  }
  const { name, email, phone, password } = parsed.data

  try {
    const exists = await db.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [email])
    if (exists.rows[0]) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const passwordHash = hashPassword(password)
    const res = await db.query(
      `INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
      [name, email, phone || null, passwordHash]
    )
    return NextResponse.json({ user: res.rows[0] }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}