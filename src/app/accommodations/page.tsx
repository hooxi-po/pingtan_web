import Navigation from "@/components/ui/navigation"
import AccommodationShowcase from "@/components/ui/accommodation-showcase"

export default function AccommodationsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        {/* Page Header */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-green-800 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              平潭住宿推荐
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              从传统石头厝到现代度假酒店，为您提供舒适的住宿体验
            </p>
          </div>
        </section>
        
        <AccommodationShowcase />
      </div>
    </main>
  )
}