"use client"

import { useEffect, useState } from "react"

type WeatherNow = {
  temp?: number | string
  text?: string
  feels_like?: number | string
  rh?: number | string // humidity
  wind_dir?: string
  wind_class?: string
}

type WeatherResult = {
  now?: WeatherNow
  location?: { lat?: number; lng?: number; city?: string; name?: string }
  forecasts?: any[]
}

export function WeatherWidget({
  lat = 25.519,
  lng = 119.791,
  className = "",
}: {
  lat?: number
  lng?: number
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<WeatherResult | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`, { cache: "no-store" })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const json = await res.json()
        if (!cancelled) setData(json?.result || json)
      } catch (e) {
        if (!cancelled) setError("天气获取失败")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [lat, lng])

  if (loading) {
    return <div className={className}>正在获取天气...</div>
  }
  if (error) {
    return <div className={className + " text-sm text-red-600"}>{error}</div>
  }
  const now = data?.now || {}

  return (
    <div className={`rounded-lg border border-border p-4 bg-card ${className}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-foreground">平潭实时天气</h3>
        <span className="text-xs text-muted-foreground">来自百度天气</span>
      </div>
      <div className="mt-3 flex items-center gap-4">
        <div className="text-4xl font-bold text-ocean">
          {now.temp !== undefined ? `${now.temp}°` : "--"}
        </div>
        <div className="space-y-1 text-sm">
          <div className="text-foreground">{now.text || "--"}</div>
          <div className="text-muted-foreground">
            体感：{now.feels_like ?? "--"}° · 湿度：{now.rh ?? "--"}%
          </div>
          <div className="text-muted-foreground">
            风向：{now.wind_dir || "--"} · 风力：{now.wind_class || "--"}
          </div>
        </div>
      </div>
    </div>
  )
}

