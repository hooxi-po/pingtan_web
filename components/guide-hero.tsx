import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GuideHero() {
  return (
    <div className="relative h-[400px] bg-gradient-to-br from-ocean via-ocean/90 to-teal overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pingtan-scenic-coastline-panorama.jpg')] bg-cover bg-center opacity-20" />

      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-sand mb-4 text-balance">平潭旅游攻略</h1>
        <p className="text-lg md:text-xl text-sand/90 mb-8 max-w-2xl text-pretty">
          从行程规划到实用贴士，为您提供全方位的旅游指南
        </p>

        <div className="w-full max-w-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="搜索攻略关键词..." className="pl-10 h-12 bg-sand border-sand text-foreground" />
            </div>
            <Button size="lg" className="bg-coral hover:bg-coral/90 text-sand px-8">
              搜索
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
