import { NotificationTestPanel } from '@/components/test/notification-test-panel'

export default function NotificationTestPage() {
  return (
    <div className="min-h-screen bg-background">
      <NotificationTestPanel />
    </div>
  )
}

export const metadata = {
  title: '预订通知测试 - 平潭旅游',
  description: '测试和验证预订通知系统的功能和性能',
}