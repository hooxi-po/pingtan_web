"use client"
import { Search, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function AttractionHero({
  query,
  onQueryChange,
  onSubmit,
}: {
  query: string
  onQueryChange: (q: string) => void
  onSubmit?: () => void
}) {
  return (
    <div className="relative h-[400px] flex items-center justify-center overflow-hidden">
      <Image
        src="/pingtan-scenic-coastline-panorama.jpg"
        alt="平潭景点"
        fill
        className="object-cover brightness-75"
        priority
      />
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <div className="bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-border/50">
          <h2 className="text-2xl font-bold mb-4 text-center text-foreground">搜索平潭景点</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜索景点名称或关键词..."
                className="pl-10 h-12 bg-background"
                value={query}
                onChange={(e) => onQueryChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit?.()
                }}
              />
            </div>
            <div className="flex-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="date" className="pl-10 h-12 bg-background" />
            </div>
            <Button
              size="lg"
              className="bg-ocean hover:bg-ocean/90 text-sand h-12 px-8"
              onClick={() => onSubmit?.()}
            >
              搜索
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
