"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Camera, User, Lock, Bell, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("profile")

  const [profileData, setProfileData] = useState({
    name: "张三",
    email: "zhangsan@example.com",
    phone: "13888888888",
    gender: "male",
    birthday: "1990-01-01",
    location: "福建省福州市",
    bio: "热爱旅行，喜欢探索新的地方",
  })

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: true,
  })

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationToggle = (field: string) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="ghost" className="gap-2 mb-4 bg-transparent">
            <ChevronLeft className="h-4 w-4" />
            返回个人中心
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">个人设置</h1>
        <p className="text-muted-foreground">管理您的个人信息和账号设置</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">个人资料</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">账号安全</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">通知设置</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">隐私设置</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="头像"
                    width={100}
                    height={100}
                    className="rounded-full"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-ocean hover:bg-ocean/90 text-sand"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">更换头像</p>
                  <p className="text-sm text-muted-foreground">支持 JPG、PNG 格式，文件小于 5MB</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleProfileUpdate("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <select
                    id="gender"
                    value={profileData.gender}
                    onChange={(e) => handleProfileUpdate("gender", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="male">男</option>
                    <option value="female">女</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthday">生日</Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => handleProfileUpdate("birthday", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">所在地</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleProfileUpdate("location", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                  rows={4}
                  placeholder="介绍一下自己..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="bg-transparent">
                  取消
                </Button>
                <Button className="bg-ocean hover:bg-ocean/90 text-sand">保存更改</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>联系方式</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱地址</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleProfileUpdate("email", e.target.value)}
                  />
                  <Button variant="outline" className="bg-transparent">
                    验证
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号码</Label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                  />
                  <Button variant="outline" className="bg-transparent">
                    更换
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>密码管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input id="current-password" type="password" placeholder="请输入当前密码" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input id="new-password" type="password" placeholder="请输入新密码" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input id="confirm-password" type="password" placeholder="请再次输入新密码" />
              </div>

              <div className="flex justify-end">
                <Button className="bg-ocean hover:bg-ocean/90 text-sand">修改密码</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>账号安全</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">登录密码</p>
                  <p className="text-sm text-muted-foreground">定期更换密码可以提高账号安全性</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  修改
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">手机验证</p>
                  <p className="text-sm text-muted-foreground">已绑定手机：138****8888</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  更换
                </Button>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">邮箱验证</p>
                  <p className="text-sm text-muted-foreground">已绑定邮箱：zhan****@example.com</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  更换
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">两步验证</p>
                  <p className="text-sm text-muted-foreground">增强账号安全性，防止账号被盗</p>
                </div>
                <Button variant="outline" className="bg-transparent">
                  开启
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知偏好</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">订单更新通知</p>
                  <p className="text-sm text-muted-foreground">接收订单状态变更、支付成功等通知</p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={() => handleNotificationToggle("orderUpdates")}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">优惠活动通知</p>
                  <p className="text-sm text-muted-foreground">接收最新优惠、促销活动信息</p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={() => handleNotificationToggle("promotions")}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">旅游资讯推送</p>
                  <p className="text-sm text-muted-foreground">接收旅游攻略、景点推荐等内容</p>
                </div>
                <Switch
                  checked={notifications.newsletter}
                  onCheckedChange={() => handleNotificationToggle("newsletter")}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-foreground">短信通知</p>
                  <p className="text-sm text-muted-foreground">通过短信接收重要通知</p>
                </div>
                <Switch checked={notifications.sms} onCheckedChange={() => handleNotificationToggle("sms")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>隐私设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">个人资料可见性</p>
                  <p className="text-sm text-muted-foreground">控制其他用户是否可以查看您的个人资料</p>
                </div>
                <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>公开</option>
                  <option>仅好友</option>
                  <option>私密</option>
                </select>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">活动记录</p>
                  <p className="text-sm text-muted-foreground">是否显示您的浏览和预订记录</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">数据分析</p>
                  <p className="text-sm text-muted-foreground">允许我们使用您的数据改进服务</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full bg-transparent text-destructive hover:bg-destructive/10">
                  删除账号
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  删除账号后，您的所有数据将被永久删除且无法恢复
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
