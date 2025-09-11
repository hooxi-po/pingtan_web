'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 重定向到蓝眼泪专区
export default function RestaurantsRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/blue-tears')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在跳转到蓝眼泪专区...</p>
      </div>
    </div>
  )
}