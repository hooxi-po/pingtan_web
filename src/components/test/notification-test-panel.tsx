"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Bell, Send, RefreshCw } from "lucide-react"

interface TestResult {
  success: boolean
  testType: string
  result?: any
  error?: string
  timestamp: string
  message: string
  details?: any
}

interface TestStats {
  totalSent: number
  successRate: number
  failedCount: number
  retryCount: number
  averageDeliveryTime: string
  lastTestTime: string
  availableTestTypes: string[]
}

export function NotificationTestPanel() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [stats, setStats] = useState<TestStats | null>(null)
  const [selectedTestType, setSelectedTestType] = useState("basic")

  // 执行通知测试
  const runTest = async (testType: string, options: any = {}) => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/booking-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          ...options
        })
      })

      const result: TestResult = await response.json()
      setTestResults(prev => [result, ...prev.slice(0, 9)]) // 保留最近10条记录
      
      if (result.success) {
        await loadStats() // 刷新统计信息
      }
    } catch (error: any) {
      const errorResult: TestResult = {
        success: false,
        testType,
        error: error.message || '网络错误',
        timestamp: new Date().toISOString(),
        message: '测试执行失败'
      }
      setTestResults(prev => [errorResult, ...prev.slice(0, 9)])
    } finally {
      setLoading(false)
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await fetch('/api/test/booking-notification')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  // 组件挂载时加载统计信息
  React.useEffect(() => {
    loadStats()
  }, [])

  const testTypes = [
    { id: 'basic', name: '基础通知', description: '测试基本的预订确认通知发送' },
    { id: 'multi-channel', name: '多渠道通知', description: '测试站内、邮件、短信多渠道通知' },
    { id: 'reminder', name: '提醒通知', description: '测试预订提醒通知功能' },
    { id: 'error-simulation', name: '错误模拟', description: '模拟发送失败，测试重试机制' },
    { id: 'batch', name: '批量通知', description: '测试批量通知发送性能' }
  ]

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? "成功" : "失败"}
      </Badge>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">预订通知测试面板</h1>
          <p className="text-muted-foreground mt-2">
            测试和验证预订通知系统的功能和性能
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新统计
        </Button>
      </div>

      <Tabs defaultValue="tests" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tests">测试执行</TabsTrigger>
          <TabsTrigger value="results">测试结果</TabsTrigger>
          <TabsTrigger value="stats">统计信息</TabsTrigger>
        </TabsList>

        <TabsContent value="tests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testTypes.map((test) => (
              <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {test.name}
                  </CardTitle>
                  <CardDescription>{test.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runTest(test.id)}
                    disabled={loading}
                    className="w-full"
                    variant={selectedTestType === test.id ? "default" : "outline"}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    执行测试
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 特殊测试选项 */}
          <Card>
            <CardHeader>
              <CardTitle>高级测试选项</CardTitle>
              <CardDescription>执行特定场景的测试</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => runTest('error-simulation', { forceError: true })}
                  disabled={loading}
                  variant="destructive"
                >
                  模拟发送失败
                </Button>
                <Button
                  onClick={() => runTest('batch', { count: 5 })}
                  disabled={loading}
                  variant="secondary"
                >
                  批量测试 (5条)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {testResults.length === 0 ? (
            <Alert>
              <AlertDescription>
                暂无测试结果。请先执行一些测试。
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <CardTitle className="text-lg">
                          {testTypes.find(t => t.id === result.testType)?.name || result.testType}
                        </CardTitle>
                        {getStatusBadge(result.success)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{result.message}</p>
                    {result.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{result.error}</AlertDescription>
                      </Alert>
                    )}
                    {result.result && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(result.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">总发送量</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSent}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">成功率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {(stats.successRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">失败次数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">重试次数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.retryCount}</div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">平均投递时间</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageDeliveryTime}</div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">最后测试时间</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg">
                    {new Date(stats.lastTestTime).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertDescription>
                正在加载统计信息...
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}