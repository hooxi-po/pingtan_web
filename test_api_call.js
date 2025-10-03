const http = require('http')

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = ''
      
      res.on('data', (chunk) => {
        data += chunk
      })
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: res.statusCode >= 200 && res.statusCode < 300,
            data: jsonData
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            ok: false,
            data: data
          })
        }
      })
    })
    
    req.on('error', (error) => {
      reject(error)
    })
    
    req.setTimeout(10000, () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function testNotificationAPI() {
  try {
    console.log('🧪 测试通知API调用...\n')

    // 测试基本的通知API调用
    const baseUrl = 'http://localhost:3000'
    
    console.log('1. 测试获取所有应用内通知:')
    const response1 = await makeRequest(`${baseUrl}/api/notifications?channel=IN_APP&limit=10`)
    
    if (response1.ok) {
      console.log(`   状态: ${response1.status} ${response1.statusText}`)
      console.log(`   返回数据结构:`, JSON.stringify(response1.data, null, 2))
    } else {
      console.log(`   ❌ API调用失败: ${response1.status} ${response1.statusText}`)
      console.log(`   错误信息: ${response1.data}`)
    }

    console.log('\n2. 测试获取特定用户的通知:')
    const userId = 'cmg04jlin0000s4nc4yrhs8ur' // 刘剑涛的用户ID
    const response2 = await makeRequest(`${baseUrl}/api/notifications?userId=${userId}&channel=IN_APP&limit=5`)
    
    if (response2.ok) {
      console.log(`   状态: ${response2.status} ${response2.statusText}`)
      console.log(`   用户 ${userId} 的通知数量: ${response2.data?.data?.notifications?.length || 0}`)
      if (response2.data?.data?.notifications?.length > 0) {
        console.log('   通知列表:')
        response2.data.data.notifications.forEach((notif, index) => {
          console.log(`     ${index + 1}. [${notif.status}] ${notif.title}`)
          console.log(`        创建时间: ${notif.createdAt}`)
          console.log(`        类型: ${notif.type}`)
        })
      }
    } else {
      console.log(`   ❌ API调用失败: ${response2.status} ${response2.statusText}`)
    }

    console.log('\n3. 测试获取订单确认通知:')
    const response3 = await makeRequest(`${baseUrl}/api/notifications?type=ORDER_CONFIRMED&channel=IN_APP&limit=5`)
    
    if (response3.ok) {
      console.log(`   状态: ${response3.status} ${response3.statusText}`)
      console.log(`   订单确认通知数量: ${response3.data?.data?.notifications?.length || 0}`)
      if (response3.data?.data?.notifications?.length > 0) {
        console.log('   订单确认通知:')
        response3.data.data.notifications.forEach((notif, index) => {
          console.log(`     ${index + 1}. [${notif.status}] ${notif.title}`)
          console.log(`        用户: ${notif.user?.name || '未知'}`)
          console.log(`        订单ID: ${notif.orderId || 'N/A'}`)
          console.log(`        创建时间: ${notif.createdAt}`)
        })
      }
    } else {
      console.log(`   ❌ API调用失败: ${response3.status} ${response3.statusText}`)
    }

  } catch (error) {
    console.error('❌ API测试失败:', error.message)
  }
}

testNotificationAPI()