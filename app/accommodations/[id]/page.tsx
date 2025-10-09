import type { Metadata } from "next"
import { BookingSection } from "@/components/booking-section"
import { AccommodationDetails } from "@/components/accommodation-details"

export const metadata: Metadata = {
  title: "住宿预订 - 平潭旅游",
  description: "预订平潭优质住宿",
}

export default function AccommodationBookingPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <AccommodationDetails id={params.id} />
      <BookingSection type="accommodation" itemId={Number(params.id)} />
    </div>
  )
}
