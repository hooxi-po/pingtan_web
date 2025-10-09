import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { z } from "zod"
import { verifyPassword, createSession } from "@/lib/auth"
import { cookies } from "next/headers"

const LoginSchema = z.object({
  email: z.string().email(),
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

  const parsed = LoginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 })
  }

  const { email, password } = parsed.data

  try {
    const res = await db.query(
      `SELECT id, name, email, phone, password_hash FROM users WHERE email = $1 LIMIT 1`,
      [email]
    )
    const user = res.rows[0]
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ok = verifyPassword(password, user.password_hash)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const session = await createSession(user.id)
    if (!session) {
      return NextResponse.json({ error: "Session creation failed" }, { status: 500 })
    }

    const cookieStore = await cookies()
    cookieStore.set("session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } })
  } catch (e) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}