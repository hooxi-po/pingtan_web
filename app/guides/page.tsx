import { GuideHero } from "@/components/guide-hero"
import { GuideCategories } from "@/components/guide-categories"
import { GuideFeatured } from "@/components/guide-featured"
import { GuideList } from "@/components/guide-list"

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      <GuideHero />
      <main className="container mx-auto px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-balance mb-3 text-foreground">平潭旅游攻略</h1>
          <p className="text-lg text-muted-foreground text-pretty">精选旅游攻略，助您轻松玩转平潭，发现海岛之美</p>
        </div>

        <GuideCategories />
        <GuideFeatured />
        <GuideList />
      </main>
    </div>
  )
}
