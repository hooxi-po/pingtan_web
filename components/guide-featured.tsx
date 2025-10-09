import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ThumbsUp } from "lucide-react"

const featuredGuides = [
  {
    id: 1,
    title: "平潭三日游完美行程规划",
    description: "精心设计的三天两夜行程，带你玩转平潭所有必去景点，包含蓝眼泪观赏、石头厝探访、海滩游玩等精彩内容",
    image: "/pingtan-blue-tears-bioluminescence-beach-night.jpg",
    category: "行程规划",
    author: "旅行达人小王",
    readTime: "15分钟",
    views: 12580,
    likes: 856,
    tags: ["三日游", "经典路线", "蓝眼泪"],
  },
  {
    id: 2,
    title: "平潭海鲜美食完全指南",
    description: "从海鲜市场到特色餐厅，教你如何吃遍平潭最地道的海鲜美食，附带价格参考和推荐菜品",
    image: "/pingtan-seafood-feast-table.jpg",
    category: "美食攻略",
    author: "美食博主阿美",
    readTime: "12分钟",
    views: 9420,
    likes: 623,
    tags: ["海鲜", "美食", "餐厅推荐"],
  },
]

export function GuideFeatured() {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">精选攻略</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {featuredGuides.map((guide) => (
          <Card key={guide.id} className="overflow-hidden border-border/50 hover:shadow-lg transition-all group">
            <div className="relative h-64 overflow-hidden">
              <Image
                src={guide.image || "/placeholder.svg"}
                alt={guide.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-coral text-sand">{guide.category}</Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-ocean transition-colors text-balance">
                {guide.title}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2 text-pretty">{guide.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {guide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-muted">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">{guide.author}</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{guide.readTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{guide.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{guide.likes}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-ocean hover:bg-ocean/90 text-sand">阅读攻略</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
