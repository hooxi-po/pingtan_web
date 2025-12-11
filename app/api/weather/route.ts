import { NextResponse } from "next/server"
import crypto from "crypto"

// Server-side AK/SK
const AK = process.env.BAIDU_WEATHER_API_KEY || ""
const SK = process.env.BAIDU_WEATHER_SK || ""

function encode(val: string) {
  // UTF-8 encode, space should be %20 (encodeURIComponent already does this)
  return encodeURIComponent(val)
}

function buildSignedUrl(path: string, params: Record<string, string>, sk: string) {
  // 1) sort by key asc
  const keys = Object.keys(params).sort()
  // 2) canonical k=v with value encoded
  const canonical = keys.map((k) => `${k}=${encode(params[k])}`).join("&")
  // 3) sn = md5( encodeURIComponent(`${path}?${canonical}${sk}`) )
  const raw = `${path}?${canonical}${sk}`
  const sn = crypto.createHash("md5").update(encode(raw)).digest("hex")
  // 4) final URL
  return `https://api.map.baidu.com${path}?${canonical}&sn=${sn}`
}

export async function GET(request: Request) {
  if (!AK) {
    return NextResponse.json({ error: "Missing BAIDU_WEATHER_API_KEY" }, { status: 500 })
  }
  if (!SK) {
    return NextResponse.json({ error: "Missing BAIDU_WEATHER_SK" }, { status: 500 })
  }

  const url = new URL(request.url)
  const lat = url.searchParams.get("lat")
  const lng = url.searchParams.get("lng")
  const districtId = url.searchParams.get("district_id")
  const dataType = url.searchParams.get("data_type") || "all"

  const path = "/weather/v1/"
  const params: Record<string, string> = { ak: AK, data_type: dataType }

  if (districtId) {
    params["district_id"] = districtId
  } else if (lat && lng) {
    // Baidu expects location="lng,lat"
    params["location"] = `${lng},${lat}`
  } else {
    // default: Pingtan (lng,lat)
    params["location"] = `119.791,25.519`
  }

  const target = buildSignedUrl(path, params, SK)

  try {
    const res = await fetch(target, { cache: "no-store" })
    const text = await res.text()
    let json: any
    try {
      json = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: "Invalid upstream response", text }, { status: 502 })
    }

    if (!res.ok || json.status !== 0) {
      return NextResponse.json({ error: "Weather upstream error", status: json.status, message: json.message, result: json.result }, { status: 502 })
    }

    return NextResponse.json(json, {
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=120",
      },
    })
  } catch (e) {
    return NextResponse.json({ error: "Weather request failed" }, { status: 500 })
  }
}
