import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validations/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        language: (body as any).language ?? undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        language: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ message: "更新成功", user: updated })
  } catch (e: any) {
    console.error("Update profile error:", e)
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: e.errors?.[0]?.message || "参数错误" }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}