"use client"

import { useEffect, useRef, useState } from "react"

export type BaiduMarker = { lng: number; lat: number; title?: string }
export default function BaiduMap({
  center,
  zoom = 13,
  markers = [],
}: {
  center: { lng: number; lat: number }
  zoom?: number
  markers?: BaiduMarker[]
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)

  const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
  const [inView, setInView] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // 视口懒加载：仅在地图容器进入视口后再初始化
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!("IntersectionObserver" in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry && entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Load Baidu Maps JS SDK once
  useEffect(() => {
    if (!ak) return
    const existing = document.querySelector<HTMLScriptElement>("script[data-baidu-map-sdk]")
    if (existing) return

    const script = document.createElement("script")
    script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(ak)}&callback=__initBMap__`
    script.async = true
    script.defer = true
    script.setAttribute("data-baidu-map-sdk", "true")

    ;(window as any).__initBMap__ = () => {
      // callback placeholder; initialization happens in the next effect
    }

    script.onerror = () => setLoadError("地图脚本加载失败，请重试")
    const timeout = setTimeout(() => {
      if (!(window as any).BMapGL) setLoadError("地图加载超时，请稍后重试")
    }, 12000)

    document.head.appendChild(script)
    return () => clearTimeout(timeout)
  }, [ak])

  // Initialize map
  useEffect(() => {
    if (!ak) return
    if (!containerRef.current) return
    if (!inView || loadError) return

    const start = () => {
      const BMapGL = (window as any).BMapGL
      if (!BMapGL) {
        // Wait a bit if script not finished yet
        const timer = setTimeout(start, 120)
        return () => clearTimeout(timer)
      }
      // Ensure constructor exists
      if (typeof BMapGL.Map !== "function") {
        setLoadError("地图SDK初始化异常：Map 构造器不可用")
        return
      }
      // Create map once
      if (!mapRef.current && containerRef.current) {
        const map = new BMapGL.Map(containerRef.current)
        const point = new BMapGL.Point(center.lng, center.lat)
        map.centerAndZoom(point, zoom)
        map.enableScrollWheelZoom(true)
        map.addControl(new BMapGL.ZoomControl())
        map.addControl(new BMapGL.ScaleControl())
        mapRef.current = map
      }
      // Render markers
      const map = mapRef.current
      if (map) {
        // Clear overlays then add new markers
        map.clearOverlays()
        const pointCenter = new (window as any).BMapGL.Point(center.lng, center.lat)
        map.centerAndZoom(pointCenter, zoom)
        markers.forEach((m) => {
          const pt = new (window as any).BMapGL.Point(m.lng, m.lat)
          const marker = new (window as any).BMapGL.Marker(pt)
          map.addOverlay(marker)
          if (m.title) {
            const label = new (window as any).BMapGL.Label(m.title, { position: pt })
            label.setStyle({
              color: "#111827",
              fontSize: "12px",
              backgroundColor: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.4)",
              borderRadius: "9999px",
              padding: "2px 8px",
              backdropFilter: "blur(6px)",
            })
            map.addOverlay(label)
          }
        })
      }
    }

    const cleanup = start()
    return () => {
      if (typeof cleanup === "function") cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ak, inView, loadError, center.lng, center.lat, zoom, JSON.stringify(markers)])

  if (!ak) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-red-600">
        请配置 NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY 以启用地图
      </div>
    )
  }

  return <div ref={containerRef} className="h-full w-full" />
}