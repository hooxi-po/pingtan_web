import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ThumbsUp, ChevronRight } from "lucide-react"

const guides = [
  {
    id: 3,
    title: "平潭蓝眼泪最佳观赏时间和地点",
    description: "详细介绍蓝眼泪的形成原理、最佳观赏季节、推荐观赏地点以及拍摄技巧",
    image: "/blue-tears-beach-night-glow.jpg",
    category: "摄影指南",
    author: "摄影师老李",
    readTime: "8分钟",
    views: 15230,
    likes: 1024,
    tags: ["蓝眼泪", "摄影", "观赏指南"],
  },
  {
    id: 4,
    title: "平潭石头厝古村落探访攻略",
    description: "探索平潭独特的石头厝建筑，了解其历史文化，推荐最值得参观的古村落",
    image: "/stone-house-village-traditional.jpg",
    category: "路线推荐",
    author: "文化爱好者小张",
    readTime: "10分钟",
    views: 7850,
    likes: 542,
    tags: ["石头厝", "古村落", "文化"],
  },
  {
    id: 5,
    title: "平潭两日游省钱攻略",
    description: "教你如何用最少的预算玩转平潭，包含住宿、交通、餐饮等各方面省钱技巧",
    image: "/longfengtou-beach-resort.jpg",
    category: "省钱攻略",
    author: "穷游达人阿强",
    readTime: "12分钟",
    views: 11200,
    likes: 789,
    tags: ["省钱", "两日游", "预算"],
  },
  {
    id: 6,
    title: "平潭最美海滩打卡路线",
    description: "精选平潭最美的海滩景点，规划一日海滩打卡路线，附带交通和游玩建议",
    image: "/longfengtou-beach-resort.jpg",
    category: "路线推荐",
    author: "旅行博主小美",
    readTime: "9分钟",
    views: 9680,
    likes: 671,
    tags: ["海滩", "打卡", "一日游"],
  },
  {
    id: 7,
    title: "平潭特色伴手礼购买指南",
    description: "推荐平潭最值得购买的特色伴手礼，包括海产品、工艺品等，附带购买地点和价格参考",
    image: "/haitan-ancient-city-architecture.jpg",
    category: "实用贴士",
    author: "购物达人小丽",
    readTime: "7分钟",
    views: 6420,
    likes: 445,
    tags: ["伴手礼", "购物", "特产"],
  },
  {
    id: 8,
    title: "平潭亲子游完全攻略",
    description: "适合带孩子游玩的景点推荐、亲子酒店选择、注意事项等全方位指南",
    image: "/beautiful-pingtan-island-beach-blue-tears-phenomen.jpg",
    category: "行程规划",
    author: "亲子游专家小陈",
    readTime: "14分钟",
    views: 8350,
    likes: 598,
    tags: ["亲子游", "家庭", "儿童"],
  },
]

export function GuideList() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">更多攻略</h2>
      </div>

      <div className="space-y-4">
        {guides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden border-border/50 hover:shadow-md transition-all group">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                  <Image
                    src={guide.image || "/placeholder.svg"}
                    alt={guide.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-coral text-sand">{guide.category}</Badge>
                  </div>
                </div>

                <div className="flex-1 p-4 sm:py-4 sm:pr-4 sm:pl-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-ocean transition-colors text-balance">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-pretty">{guide.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {guide.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-muted">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{guide.author}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{guide.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{guide.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>{guide.likes}</span>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" className="text-ocean hover:text-ocean/80">
                      阅读
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" size="lg" className="bg-transparent">
          加载更多攻略
        </Button>
      </div>
    </div>
  )
}
