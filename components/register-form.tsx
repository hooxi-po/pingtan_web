"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const form = new FormData(event.currentTarget)
    const name = String(form.get("username") || "")
    const email = String(form.get("email") || "")
    const phone = String(form.get("phone") || "")
    const password = String(form.get("password") || "")
    const confirm = String(form.get("confirm-password") || "")

    // 基础前端校验，避免后端 422 验证错误
    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError("用户名至少 2 个字符")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("密码至少 8 个字符")
      setIsLoading(false)
      return
    }

    if (password !== confirm) {
      setError("两次输入的密码不一致")
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email, phone, password }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (!res.ok) {
        if (res.status === 409) {
          setError("邮箱已被注册")
        } else if (res.status === 422) {
          setError("信息格式不正确，请检查用户名、邮箱和密码")
        } else {
          setError((data as any).error || "注册失败，请稍后重试")
        }
        setIsLoading(false)
        return
      }

      setSuccess("注册成功，正在跳转登录")
      setIsLoading(false)
      setTimeout(() => router.push("/login"), 800)
    } catch (e) {
      setError("网络异常，请稍后重试")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">用户名</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="请输入用户名"
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">邮箱地址</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">手机号码</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="请输入手机号"
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="至少8个字符"
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">确认密码</Label>
        <Input
          id="confirm-password"
          name="confirm-password"
          type="password"
          placeholder="再次输入密码"
          required
          disabled={isLoading}
          className="h-11"
        />
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox id="terms" required />
        <label
          htmlFor="terms"
          className="text-sm leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          我已阅读并同意{" "}
          <a href="/terms" className="text-ocean hover:underline">
            服务条款
          </a>{" "}
          和{" "}
          <a href="/privacy" className="text-ocean hover:underline">
            隐私政策
          </a>
        </label>
      </div>

      <Button type="submit" className="w-full h-11 bg-ocean hover:bg-ocean/90 text-sand" disabled={isLoading}>
        {isLoading ? "注册中..." : "注册"}
      </Button>

      {error ? <p className="text-sm text-red-600 text-center">{error}</p> : null}
      {success ? <p className="text-sm text-green-600 text-center">{success}</p> : null}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">或使用以下方式注册</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button type="button" variant="outline" disabled={isLoading} className="h-11 bg-transparent">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
            />
          </svg>
          微信
        </Button>
        <Button type="button" variant="outline" disabled={isLoading} className="h-11 bg-transparent">
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            />
          </svg>
          QQ
        </Button>
      </div>
    </form>
  )
}
