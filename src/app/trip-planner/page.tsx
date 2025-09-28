import Navigation from "@/components/ui/navigation"
import TripPlanner from "@/components/ui/trip-planner"
import LocationServices from "@/components/ui/location-services"

export default function TripPlannerPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <TripPlanner />
        <LocationServices />
      </div>
    </main>
  )
}