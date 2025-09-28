import Navigation from "@/components/ui/navigation"
import { Suspense } from "react"
import RestaurantsContent from "./restaurants-content"

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <Suspense>
          <RestaurantsContent />
        </Suspense>
      </div>
    </main>
  )
}