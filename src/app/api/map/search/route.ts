import { NextRequest, NextResponse } from "next/server"

// 服务端代理百度地点检索，避免在客户端暴露 AK，并可绕开浏览器跨域
export async function GET(req: NextRequest) {
  try {
    const ak = process.env.BAIDU_MAP_AK
    if (!ak) {
      return NextResponse.json({ error: "服务未配置 BAIDU_MAP_AK" }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query") || "餐厅"
    const region = searchParams.get("region") || "平潭"
    const tag = searchParams.get("tag") || "美食"
    const pageSize = searchParams.get("page_size") || "10"
    const pageNum = searchParams.get("page_num") || "0"
    const location = searchParams.get("location") // 可选："lat,lng"
    const radius = searchParams.get("radius") || "2000" // 米
    const scope = searchParams.get("scope") || "1" // 1=基础，2=详细
    const output = "json"

    const params: Record<string, string> = {
      query,
      tag,
      region,
      output,
      ak,
      page_size: pageSize,
      page_num: pageNum,
      scope,
    }
    if (location) params.location = location
    if (location && radius) params.radius = radius

    const qs = new URLSearchParams(params).toString()
    const url = `https://api.map.baidu.com/place/v2/search?${qs}`

    const resp = await fetch(url, { cache: "no-store" })
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: "上游服务异常", detail: text }, { status: resp.status })
    }
    const data = await resp.json()
    // 直接透传百度响应，额外附带元信息，便于前端调试
    return NextResponse.json({ ok: true, data })
  } catch (e: any) {
    return NextResponse.json({ error: "服务内部错误", message: e?.message || String(e) }, { status: 500 })
  }
}