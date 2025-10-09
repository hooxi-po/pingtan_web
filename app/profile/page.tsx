import type { Metadata } from "next"
import { ProfileDashboard } from "@/components/profile-dashboard"

export const metadata: Metadata = {
  title: "个人中心 - 平潭旅游",
  description: "管理您的个人信息和订单",
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileDashboard />
    </div>
  )
}
