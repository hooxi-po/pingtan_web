import type { Metadata } from "next"
import { RestaurantDetails } from "@/components/restaurant-details"
import { BookingSection } from "@/components/booking-section"

export const metadata: Metadata = {
  title: "美食预订 - 平潭旅游",
  description: "预订平潭特色美食餐厅",
}

export default function FoodBookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <RestaurantDetails id={params.id} />
      <BookingSection type="food" itemId={Number(params.id)} />
    </div>
  )
}
