import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // Note: 这里 demo 直接接收文件并存储为 base64 或公共 URL。
    // 生产环境建议上传到对象存储（如 OSS/S3），并保存返回的 URL。
    const formData = await req.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "未找到上传文件" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "仅支持图片类型" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar: dataUrl },
    })

    return NextResponse.json({ message: "上传成功", avatar: dataUrl })
  } catch (e) {
    console.error("Avatar upload error:", e)
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}