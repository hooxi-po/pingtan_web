import type { Metadata } from "next"
import Link from "next/link"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "注册 - 平潭旅游",
  description: "创建您的平潭旅游账户",
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-ocean/5 via-background to-sand/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">开启旅程</h1>
          <p className="text-muted-foreground">创建账户，开始您的平潭探索之旅</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <RegisterForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">已有账户？</span>{" "}
            <Link href="/login" className="text-ocean hover:underline font-medium">
              立即登录
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          注册即表示您同意我们的{" "}
          <Link href="/terms" className="text-ocean hover:underline">
            服务条款
          </Link>{" "}
          和{" "}
          <Link href="/privacy" className="text-ocean hover:underline">
            隐私政策
          </Link>
        </p>
      </div>
    </div>
  )
}
