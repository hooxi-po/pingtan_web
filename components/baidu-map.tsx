"use client"

import { useEffect, useRef, useState } from "react"
import { BAIDU_MAP_AK } from "@/lib/env"

function appendScriptOnce(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no-window"))
    if (document.getElementById(id)) {
      // already present
      const s = document.getElementById(id) as HTMLScriptElement
      if ((window as any).BMapGL || (window as any).BMap) return resolve()
      s.addEventListener("load", () => resolve())
      s.addEventListener("error", () => reject(new Error("script-error")))
      return
    }
    const script = document.createElement("script")
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("script-error"))
    document.head.appendChild(script)
  })
}

async function loadBaiduGL(ak: string) {
  // Try GL API first
  const cb = "__bmapgl_cb_" + Math.random().toString(36).slice(2)
  const url = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(ak)}&callback=${cb}`
  await new Promise<void>((resolve, reject) => {
    ;(window as any)[cb] = () => resolve()
    appendScriptOnce("bmap-gl", url).catch(reject)
    // Safety timeout if callback not called
    setTimeout(() => resolve(), 1500)
  })
}

async function loadBaidu2D(ak: string) {
  const cb = "__bmap2d_cb_" + Math.random().toString(36).slice(2)
  const url = `https://api.map.baidu.com/api?v=3.0&ak=${encodeURIComponent(ak)}&callback=${cb}`
  await new Promise<void>((resolve, reject) => {
    ;(window as any)[cb] = () => resolve()
    appendScriptOnce("bmap-2d", url).catch(reject)
    setTimeout(() => resolve(), 1500)
  })
}

export function BaiduMap({
  center = { lng: 119.791, lat: 25.519 },
  zoom = 12,
  height = 360,
  className = "",
}: {
  center?: { lng: number; lat: number }
  zoom?: number
  height?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const ak = BAIDU_MAP_AK
    if (!ak) {
      setError("缺少 NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY 环境变量")
      return
    }

    ;(async () => {
      try {
        // 1) Try GL first
        await loadBaiduGL(ak)
        if (cancelled) return
        const BMapGL = (window as any).BMapGL
        if (BMapGL && ref.current) {
          const map = new BMapGL.Map(ref.current)
          const point = new BMapGL.Point(center.lng, center.lat)
          map.centerAndZoom(point, zoom)
          map.enableScrollWheelZoom(true)
          const marker = new BMapGL.Marker(point)
          map.addOverlay(marker)
          return
        }

        // 2) Fallback to 2D API
        await loadBaidu2D(ak)
        if (cancelled) return
        const BMap = (window as any).BMap
        if (BMap && ref.current) {
          const map = new BMap.Map(ref.current)
          const point = new BMap.Point(center.lng, center.lat)
          map.centerAndZoom(point, zoom)
          map.enableScrollWheelZoom(true)
          const marker = new BMap.Marker(point)
          map.addOverlay(marker)
          return
        }

        setError("BMapGL/BMap 未加载")
      } catch (e) {
        setError("地图脚本加载失败")
      }
    })()

    return () => {
      cancelled = true
    }
  }, [center.lng, center.lat, zoom])

  return (
    <div className={className}>
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div ref={ref} style={{ width: "100%", height }} className="rounded-lg border border-border bg-muted" />
      )}
    </div>
  )
}
