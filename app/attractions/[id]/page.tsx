import type { Metadata } from "next"
import { AttractionDetails } from "@/components/attraction-details"
import { BookingSection } from "@/components/booking-section"

export const metadata: Metadata = {
  title: "景点详情 - 平潭旅游",
  description: "探索平潭精彩景点",
}

export default function AttractionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <AttractionDetails id={params.id} />
      <BookingSection type="attraction" itemId={Number(params.id)} />
    </div>
  )
}
