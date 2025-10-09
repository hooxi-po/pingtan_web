import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function FoodHero() {
  return (
    <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
      <Image
        src="/seafood-restaurant-fresh-catch.jpg"
        alt="平潭美食"
        fill
        className="object-cover brightness-75"
        sizes="100vw"
        priority
      />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <div className="bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <h2 className="text-2xl font-bold mb-4 text-center text-foreground">搜索平潭美食</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="搜索餐厅、菜品或美食街..." className="pl-10 h-12 bg-background" />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="位置或区域" className="pl-10 h-12 bg-background" />
            </div>
            <Button size="lg" className="bg-ocean hover:bg-ocean/90 text-sand h-12 px-8">
              搜索
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
