"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react"
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<SignUpInput>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Partial<SignUpInput>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (field: keyof SignUpInput, value: string) => {
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
      signUpSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const fieldErrors: Partial<SignUpInput> = {}
      error.errors?.forEach((err: any) => {
        if (err.path?.[0]) {
          fieldErrors[err.path[0] as keyof SignUpInput] = err.message
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSubmitError(data.error || "注册失败，请稍后重试")
      } else {
        setSubmitSuccess(true)
        // 3秒后跳转到登录页面
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      }
    } catch (error) {
      setSubmitError("注册失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  if (submitSuccess) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md mx-4 rounded-3xl shadow-xl bg-white/80 backdrop-blur border-0">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">注册成功！</h2>
            <p className="text-gray-600 mb-4">
              您的账户已创建成功，即将跳转到登录页面...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
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
            <UserPlus className="w-4 h-4 mr-2" />
            用户注册
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              加入我们
            </h1>
            <p className="text-gray-600 text-lg">
              创建您的账户，开始探索平潭之美
            </p>
          </div>

          {/* Signup Form */}
          <Card className="rounded-3xl shadow-xl bg-white/80 backdrop-blur border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                创建账户
              </CardTitle>
              <CardDescription className="text-gray-600">
                请填写以下信息完成注册
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    姓名
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-200"
                      }`}
                      placeholder="请输入您的姓名"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

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
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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

                {/* Phone Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    手机号码 <span className="text-gray-400">(可选)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="请输入您的手机号码"
                      disabled={isLoading}
                    />
                  </div>
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
                      className={`w-full pl-10 pr-12 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    确认密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 rounded-2xl border bg-white/70 backdrop-blur transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-200"
                      }`}
                      placeholder="请再次输入您的密码"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
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
                  className="w-full py-3 rounded-2xl text-base font-medium shadow-lg hover:shadow-xl transition-all bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      注册中...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <UserPlus className="w-4 h-4 mr-2" />
                      立即注册
                    </div>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-4">
                <div className="text-sm text-gray-600">
                  已有账户？{" "}
                  <Link 
                    href="/auth/signin" 
                    className="text-green-600 hover:text-green-700 font-medium hover:underline"
                  >
                    立即登录
                  </Link>
                </div>
                <div className="text-xs text-gray-500">
                  注册即表示您同意我们的{" "}
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