import { randomBytes, scryptSync, timingSafeEqual } from "crypto"
import { getDb } from "@/lib/db"

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  const newHash = scryptSync(password, salt, 64).toString("hex")
  const a = Buffer.from(hash, "hex")
  const b = Buffer.from(newHash, "hex")
  return timingSafeEqual(a, b)
}

export async function createSession(userId: number) {
  const db = getDb()
  if (!db) return null
  const token = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await db.query(
    `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
    [token, userId, expiresAt]
  )
  return { token, expiresAt }
}

export async function getUserBySession(token: string) {
  const db = getDb()
  if (!db) return null
  const res = await db.query(
    `SELECT u.id, u.name, u.email, u.phone FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = $1 AND s.expires_at > NOW() LIMIT 1`,
    [token]
  )
  return res.rows[0] || null
}

export async function deleteSession(token: string) {
  const db = getDb()
  if (!db) return null
  await db.query(`DELETE FROM sessions WHERE token = $1`, [token])
  return true
}