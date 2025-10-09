import type { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "登录 - 平潭旅游",
  description: "登录您的平潭旅游账户",
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-ocean/5 via-background to-sand/5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">欢迎回来</h1>
          <p className="text-muted-foreground">登录您的账户，继续探索平潭之美</p>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-lg p-8">
          <LoginForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">还没有账户？</span>{" "}
            <Link href="/register" className="text-ocean hover:underline font-medium">
              立即注册
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          登录即表示您同意我们的{" "}
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
