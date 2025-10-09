import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Hotel, UtensilsCrossed, BookOpen, Star, Users, Award } from "lucide-react"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <Image src="/beautiful-pingtan-island-beach-blue-tears-phenomen.jpg" alt="平潭岛美景" fill className="object-cover brightness-75" priority />
        <div className="relative z-10 text-center text-sand px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">探索平潭岛</h1>
          <p className="text-xl md:text-2xl mb-8 text-pretty max-w-2xl mx-auto">蓝眼泪奇观 · 石头厝古韵 · 碧海金沙</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-ocean hover:bg-ocean/90 text-sand text-lg px-8">
              开始探索
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-sand/90 hover:bg-sand text-ocean border-sand text-lg px-8"
            >
              查看攻略
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">为什么选择平潭</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            中国第五大岛，福建第一大岛，独特的海岛风光和文化体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-border/50 hover:border-ocean/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-ocean/10 flex items-center justify-center mb-4">
                  <Star className="h-8 w-8 text-ocean" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">自然奇观</h3>
                <p className="text-muted-foreground text-pretty">蓝眼泪、海蚀地貌、石头厝等独特自然与人文景观</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-ocean/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-coral/10 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-coral" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">海岛文化</h3>
                <p className="text-muted-foreground text-pretty">闽南文化与海洋文化交融，体验独特的海岛生活方式</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 hover:border-ocean/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-sand/30 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-sand-dark" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">便捷交通</h3>
                <p className="text-muted-foreground text-pretty">平潭海峡大桥连接大陆，高铁直达，交通便利</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/attractions" className="group">
              <Card className="h-full border-border/50 hover:border-ocean transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-ocean/10 flex items-center justify-center mb-4 group-hover:bg-ocean/20 transition-colors">
                      <MapPin className="h-10 w-10 text-ocean" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">热门景点</h3>
                    <p className="text-sm text-muted-foreground text-pretty">探索平潭最美的自然风光和人文景观</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/accommodations" className="group">
              <Card className="h-full border-border/50 hover:border-ocean transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-ocean/10 flex items-center justify-center mb-4 group-hover:bg-ocean/20 transition-colors">
                      <Hotel className="h-10 w-10 text-ocean" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">精选住宿</h3>
                    <p className="text-sm text-muted-foreground text-pretty">从海景酒店到特色民宿，找到理想住处</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/food" className="group">
              <Card className="h-full border-border/50 hover:border-ocean transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-ocean/10 flex items-center justify-center mb-4 group-hover:bg-ocean/20 transition-colors">
                      <UtensilsCrossed className="h-10 w-10 text-ocean" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">特色美食</h3>
                    <p className="text-sm text-muted-foreground text-pretty">品尝地道的海鲜和闽南特色美食</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/guides" className="group">
              <Card className="h-full border-border/50 hover:border-ocean transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-ocean/10 flex items-center justify-center mb-4 group-hover:bg-ocean/20 transition-colors">
                      <BookOpen className="h-10 w-10 text-ocean" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">旅游攻略</h3>
                    <p className="text-sm text-muted-foreground text-pretty">获取实用的旅行建议和行程规划</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">热门目的地</h2>
          <p className="text-lg text-muted-foreground text-pretty">不容错过的平潭精选景点</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image src="/pingtan-blue-tears-bioluminescence-beach-night.jpg" alt="蓝眼泪" fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground">蓝眼泪奇观</h3>
              <p className="text-muted-foreground text-sm text-pretty mb-4">
                每年4-8月，海滩上出现的梦幻蓝色荧光，大自然的神奇馈赠
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                了解更多
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image src="/pingtan-stone-house-traditional-architecture.jpg" alt="石头厝" fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground">石头厝古村</h3>
              <p className="text-muted-foreground text-sm text-pretty mb-4">
                独特的石头建筑，承载着平潭人世代相传的海岛记忆
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                了解更多
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image src="/pingtan-beach-coastline-blue-ocean.jpg" alt="海滨沙滩" fill className="object-cover" />
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-foreground">碧海金沙</h3>
              <p className="text-muted-foreground text-sm text-pretty mb-4">
                绵延的海岸线，细软的沙滩，是休闲度假的理想之地
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                了解更多
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ocean text-sand py-16">
        <div className="container mx-auto px-4 text-center lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">准备好开启您的平潭之旅了吗？</h2>
          <p className="text-lg mb-8 text-pretty max-w-2xl mx-auto opacity-90">
            立即注册，获取专属旅行优惠和个性化推荐
          </p>
          <Button size="lg" className="bg-sand text-ocean hover:bg-sand/90 text-lg px-8">
            立即注册
          </Button>
        </div>
      </section>
    </div>
  )
}
