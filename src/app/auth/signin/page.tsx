"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"

export default function SignInPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignInInput>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<SignInInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const handleInputChange = (field: keyof SignInInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // 清除提交错误
    if (submitError) {
      setSubmitError("")
    }
  }

  const validateForm = (): boolean => {
    try {
      signInSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<SignInInput> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof SignInInput] = err.message
        }
      })
      setErrors(fieldErrors)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setSubmitError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setSubmitError("邮箱或密码错误，请重试")
      } else {
        // 登录成功，重定向到首页
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setSubmitError("登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="rounded-2xl">
            <Link href="/" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>
          <Badge variant="outline" className="rounded-full bg-white/60 backdrop-blur">
            <LogIn className="w-4 h-4 mr-2" />
            用户登录
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              欢迎回来
            </h1>
            <p className="text-gray-600 text-lg">
              登录您的账户，继续探索平潭之美
            </p>
          </div>

          {/* Login Form */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                账户登录
              </CardTitle>
              <CardDescription className="text-gray-600">
                请输入您的邮箱和密码
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-200"
                      }`}
                      placeholder="请输入您的邮箱地址"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-200"
                      }`}
                      placeholder="请输入您的密码"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="p-3 rounded-2xl bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600 text-center">{submitError}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-3 rounded-2xl text-base font-medium shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      登录中...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <LogIn className="w-4 h-4 mr-2" />
                      立即登录
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-4">
                <div className="text-sm text-gray-600">
                  还没有账户？{" "}
                  <Link 
                    href="/auth/signup" 
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    立即注册
                  </Link>
                </div>
                <div className="text-xs text-gray-500">
                  登录即表示您同意我们的{" "}
                  <Link href="/terms" className="hover:underline">服务条款</Link>
                  {" "}和{" "}
                  <Link href="/privacy" className="hover:underline">隐私政策</Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}