export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ak = process.env.NEXT_PUBLIC_BAIDU_WEATHER_API_KEY || process.env.BAIDU_WEATHER_API_KEY
  if (!ak) {
    return new Response(JSON.stringify({ error: "缺少天气AK" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }

  const base = "https://api.map.baidu.com/weather/v1/"
  const params = new URLSearchParams()
  const district_id = searchParams.get("district_id")
  const location = searchParams.get("location")
  const data_type = searchParams.get("data_type") || "all"
  const coordtype = searchParams.get("coordtype") || "bd09ll"

  if (district_id) {
    params.set("district_id", district_id)
  }
  if (location) {
    params.set("location", location)
    params.set("coordtype", coordtype)
  }
  params.set("data_type", data_type)
  params.set("ak", ak)
  params.set("output", "json")

  const url = `${base}?${params.toString()}`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    const text = await res.text()
    return new Response(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    })
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: "天气服务请求失败", detail: e?.message ?? "" }),
      { status: 502, headers: { "content-type": "application/json" } }
    )
  }
}