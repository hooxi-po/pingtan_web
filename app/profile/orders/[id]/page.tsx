import { OrderDetails } from "@/components/order-details"

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return <OrderDetails id={params.id} />
}