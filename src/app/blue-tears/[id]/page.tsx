'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MapPin, Phone, Clock, Star, Eye, Moon, Waves, ArrowLeft, 
  Share2, Copy, Shield, AlertTriangle, Flashlight, Shirt, 
  Navigation, Camera, Users
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { BlueTearSpot, spotTypeColors } from '@/data/blue-tears'

export default function BlueTearSpotDetail() {
  const params = useParams()
  const router = useRouter()
  const [spot, setSpot] = useState<BlueTearSpot | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchSpotDetail = async () => {
      try {
        const response = await fetch(`/api/blue-tears/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setSpot(data.data)
        } else {
          console.error('观赏点不存在')
        }
      } catch (error) {
        console.error('获取观赏点详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchSpotDetail()
    }
  }, [params.id])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${spot?.name} - 平潭蓝眼泪专区`,
          text: spot?.description || '探寻神秘蓝眼泪，感受大自然的奇迹光芒',
          url: url
        })
      } catch (error) {
        console.log('分享取消')
      }
    } else {
      // 降级到复制链接
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const handleNavigation = () => {
    if (spot?.latitude && spot?.longitude) {
      // 尝试打开地图应用
      const mapUrl = `https://maps.google.com/maps?q=${spot.latitude},${spot.longitude}`
      window.open(mapUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">观赏点不存在</h1>
          <Link href="/blue-tears">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blue-tears">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回列表
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyLink}
                className={copied ? 'bg-green-50 text-green-600' : ''}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? '已复制' : '复制链接'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本信息卡片 */}
            <Card>
              <div className="relative h-64 md:h-80">
                <Image
                  src={spot.images[0] || '/images/blue-tears/placeholder.jpg'}
                  alt={spot.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
                {spot.rating && (
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{spot.rating}</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className={spotTypeColors[spot.spotType] || 'bg-gray-100 text-gray-800'}>
                    {spot.spotType}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">
                  {spot.name}
                  {spot.nameEn && (
                    <span className="block text-lg font-normal text-gray-500 mt-1">
                      {spot.nameEn}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900">地址</span>
                      <p className="text-gray-600">{spot.address}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">最佳时间</span>
                        <p className="text-gray-600">{spot.bestTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">最佳季节</span>
                        <p className="text-gray-600">{spot.bestSeason}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Navigation className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-900">交通方式</span>
                      <p className="text-gray-600">{spot.transportation}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Moon className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="font-medium text-gray-900">难度等级</span>
                      <Badge variant="outline" className="ml-2">{spot.difficulty}</Badge>
                    </div>
                  </div>
                  
                  {spot.contact && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">联系方式</span>
                        <p className="text-gray-600">{spot.contact}</p>
                      </div>
                    </div>
                  )}
                  
                  {spot.description && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">详细介绍</h3>
                      <p className="text-gray-600 leading-relaxed">{spot.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Waves className="h-5 w-5 text-blue-500" />
                      <span className="font-medium text-gray-900">特色亮点</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {spot.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 安全提示卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  夜间观赏安全提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">结伴出行</h4>
                      <p className="text-sm text-gray-600">建议2-3人结伴前往，相互照应确保安全</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Flashlight className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">照明设备</h4>
                      <p className="text-sm text-gray-600">携带手电筒或头灯，注意脚下安全</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Shirt className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">保暖衣物</h4>
                      <p className="text-sm text-gray-600">海边夜晚较凉，建议携带薄外套</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">潮汐安全</h4>
                      <p className="text-sm text-gray-600">注意潮汐变化，避免被海水困住</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 地图定位卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  地图定位
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">地图组件</p>
                    <p className="text-xs text-gray-400">将显示观赏点位置</p>
                  </div>
                  
                  {spot.latitude && spot.longitude && (
                    <div className="text-sm text-gray-600">
                      <p>纬度: {spot.latitude}</p>
                      <p>经度: {spot.longitude}</p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={handleNavigation}
                    disabled={!spot.latitude || !spot.longitude}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    打开地图导航
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 推荐装备卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-500" />
                  推荐装备
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flashlight className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">手电筒或头灯</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">相机（三脚架）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-green-500" />
                    <span className="text-sm">防风外套</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 bg-brown-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm">防滑运动鞋</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}