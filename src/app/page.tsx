import Navigation from "@/components/ui/navigation"
import HeroSection from "@/components/ui/hero-section"
import FeaturedAttractions from "@/components/ui/featured-attractions"
import AccommodationShowcase from "@/components/ui/accommodation-showcase"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturedAttractions />
      <AccommodationShowcase />
    </main>
  )
}
