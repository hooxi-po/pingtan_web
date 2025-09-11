import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const districtId = searchParams.get('city') || '350128'; // 默认平潭县
  const dataType = searchParams.get('extensions') || 'all'; // 获取完整数据
  
  const apiKey = process.env.BAIDU_MAP_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: '百度地图API密钥未配置' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.map.baidu.com/weather/v1/?district_id=${districtId}&data_type=${dataType}&ak=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Weather API URL:', `https://api.map.baidu.com/weather/v1/?district_id=${districtId}&data_type=${dataType}&ak=${apiKey}`);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather API Response:', JSON.stringify(data, null, 2));
    
    // 检查百度API返回的错误状态
    if (data.status !== 0) {
      console.error('百度天气API错误:', data);
      return NextResponse.json({
        error: '百度天气API错误',
        status: data.status,
        message: data.message || '未知错误',
        details: '请检查API密钥配置和白名单设置'
      }, { status: 400 });
    }
    
    // 添加CORS头
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('获取天气数据失败:', error);
    return NextResponse.json(
      { 
        error: '获取天气数据失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}