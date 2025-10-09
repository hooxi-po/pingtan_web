import type { Metadata } from "next"
import { ProfileSettings } from "@/components/profile-settings"

export const metadata: Metadata = {
  title: "个人设置 - 平潭旅游",
  description: "编辑您的个人信息和账号设置",
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileSettings />
    </div>
  )
}
