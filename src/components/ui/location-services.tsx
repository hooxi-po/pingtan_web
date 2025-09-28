"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Clock, Phone, Star } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { locationServicesData, nearbyAttractionsData } from "@/lib/location-data"
import { Skeleton } from "@/components/ui/skeleton"


// 动态引入，避免 SSR 阶段加载地图脚本
const BaiduMap = dynamic(() => import("@/components/ui/baidu-map"), { ssr: false })

export default function LocationServices() {
  const [currentLocation, setCurrentLocation] = useState<string>("正在定位...")
  const [locationPermission, setLocationPermission] = useState<boolean>(false)
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null)
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true)

  // 平潭默认坐标（近似）
  const DEFAULT_CENTER = { lng: 119.7903, lat: 25.5043 }

  useEffect(() => {
    // 模拟获取位置权限和当前位置
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            setCoords({ lng: longitude, lat: latitude })
            setCurrentLocation("平潭县坛南湾附近")
            setLocationPermission(true)
            setLoadingLocation(false)
          },
          (error) => {
            setCurrentLocation("位置获取失败")
            setLocationPermission(false)
            setLoadingLocation(false)
          }
        )
      } else {
        setCurrentLocation("浏览器不支持定位")
        setLocationPermission(false)
        setLoadingLocation(false)
      }
    }

    getLocation()
  }, [])

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setCoords({ lng: longitude, lat: latitude })
          setCurrentLocation("平潭县坛南湾附近")
          setLocationPermission(true)
          setLoadingLocation(false)
        },
        (error) => {
          alert("请允许访问您的位置信息以获得更好的服务体验")
          setLoadingLocation(false)
        }
      )
    }
  }

  const openBaiduDirection = (destinationName: string) => {
    const ak = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY
    // 优先使用官方方向页，其次退回搜索
    if (coords && ak) {
      const origin = `${coords.lat},${coords.lng}`
      const url = `https://api.map.baidu.com/direction?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destinationName)}&mode=walking&region=${encodeURIComponent("平潭")}&output=html&src=pingtan-web&ak=${encodeURIComponent(ak)}`
      window.open(url, "_blank")
      return
    }
    const fallback = `https://map.baidu.com/search/${encodeURIComponent(destinationName + " 平潭")}`
    window.open(fallback, "_blank")
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 rounded-full bg-white/60 backdrop-blur px-3 py-1 text-xs">
            <MapPin className="w-4 h-4 mr-2" />
            位置服务
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            智能位置服务
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            基于您的实时位置，为您提供个性化的旅游服务和推荐
          </p>
        </div>


        {/* Map Preview */}
        <div className="mb-12">
          <Card className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-xl">地图预览</CardTitle>
              <CardDescription>查看附近区域与当前位置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-80 md:h-96 lg:h-[480px] w-full rounded-xl overflow-hidden">
                {loadingLocation ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <>
                    <BaiduMap
                      center={coords ?? DEFAULT_CENTER}
                      zoom={13}
                      markers={coords ? [{ lng: coords!.lng, lat: coords!.lat, title: "我的位置" }] : []}
                    />
                    <div className="absolute top-3 right-3 z-10">
                      <div className="rounded-xl bg-white/85 backdrop-blur px-3 py-2 shadow-md border border-white/50 w-64">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">定位状态</span>
                          {locationPermission ? (
                            <Badge variant="secondary" className="bg-green-100/80 text-green-800 rounded-full">
                              定位成功
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-yellow-100/80 text-yellow-800 rounded-full">
                              未授权
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {currentLocation}
                        </div>
                        {!locationPermission && (
                          <Button size="sm" variant="outline" className="w-full rounded-full" onClick={handleLocationRequest}>
                            <Navigation className="w-4 h-4 mr-1" />
                            获取位置权限
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Services */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-center">位置服务功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {locationServicesData.map((service, index) => (
              <Card key={index} className="text-center rounded-2xl bg-white/70 backdrop-blur border border-white/40 hover:shadow-lg transition-all duration-300 group">
                <CardHeader>
                  <div className="mx-auto mb-4 p-3 rounded-full w-fit transition-colors bg-primary/20">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="default"
                    className="w-full rounded-full transition-colors"
                    disabled={!locationPermission}
                    aria-label={service.action}
                  >
                    {service.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nearby Attractions */}
        {locationPermission && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 text-center">附近景点推荐</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyAttractionsData.map((attraction) => (
                <Card key={attraction.id} className="hover:shadow-lg transition-shadow rounded-2xl bg-white/70 backdrop-blur border border-white/40">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="rounded-full">{attraction.category}</Badge>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{attraction.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                    <CardDescription>{attraction.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          距离 {attraction.distance}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          步行 {attraction.walkTime}
                        </div>
                      </div>

                      {attraction.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 mr-2" />
                          {attraction.phone}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={attraction.isOpen ? "secondary" : "destructive"}
                          className={attraction.isOpen ? "bg-green-100/80 text-green-800 rounded-full" : "rounded-full"}
                        >
                          {attraction.isOpen ? "营业中" : "已关闭"}
                        </Badge>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1 rounded-full" asChild>
                          <Link href={`/attractions/${attraction.id}`}>
                            查看详情
                          </Link>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 rounded-full"
                          onClick={() => openBaiduDirection(attraction.name)}
                        >
                          <Navigation className="w-4 h-4 mr-1" />
                          导航
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state when denied */}
        {!loadingLocation && !locationPermission && (
          <div className="max-w-2xl mx-auto text-center py-8">
            <div className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 p-6">
              <p className="text-sm text-muted-foreground mb-4">无法获取您的位置信息，可重新尝试或手动浏览推荐内容。</p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={handleLocationRequest} className="rounded-full">
                  重新尝试定位
                </Button>
                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/attractions">浏览景点</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Services */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-xl text-red-800">紧急服务</CardTitle>
              <CardDescription className="text-red-600">
                遇到紧急情况时，可快速联系相关服务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="destructive" className="flex items-center justify-center rounded-full">
                  <Phone className="w-4 h-4 mr-2" />
                  报警 110
                </Button>
                <Button variant="destructive" className="flex items-center justify-center rounded-full">
                  <Phone className="w-4 h-4 mr-2" />
                  急救 120
                </Button>
                <Button variant="destructive" className="flex items-center justify-center rounded-full">
                  <Phone className="w-4 h-4 mr-2" />
                  旅游热线
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}