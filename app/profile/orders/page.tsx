import type { Metadata } from "next"
import { OrdersManagement } from "@/components/orders-management"

export const metadata: Metadata = {
  title: "我的订单 - 平潭旅游",
  description: "管理您的所有订单",
}

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <OrdersManagement />
    </div>
  )
}
