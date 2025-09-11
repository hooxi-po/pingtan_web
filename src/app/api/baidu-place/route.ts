import { NextRequest, NextResponse } from 'next/server';

// 百度地图Place API响应接口
interface BaiduPlaceResult {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  province?: string;
  city?: string;
  area?: string;
  adcode?: number;
  telephone?: string;
  uid?: string;
  status?: string;
  street_id?: string;
  detail?: number;
  classified_poi_tag?: string;
  distance?: number;
  type?: string;
  tag?: string;
  label?: string;
  navi_location?: {
    lat: number;
    lng: number;
  };
  alias?: string[];
  detail_url?: string;
  children?: {
    uid?: string;
    name?: string;
    show_name?: string;
    tag?: string;
    location?: {
      lat: number;
      lng: number;
    };
    address?: string;
  }[];
  price?: string;
  shop_hours?: string;
  overall_rating?: string;
  taste_rating?: string;
  service_rating?: string;
  environment_rating?: string;
  facility_rating?: string;
  hygiene_rating?: string;
  technology_rating?: string;
  image_num?: string;
  groupon_num?: number;
  discount_num?: number;
  comment_num?: string;
  favorite_num?: string;
  checkin_num?: string;
  brand?: string;
  content_tag?: string;
  photos?: string[];
  detail_info?: {
    distance?: number;
    navi_location?: {
      lat: number;
      lng: number;
    };
    children?: any[];
    price?: string;
    shop_hours?: string;
    tag?: string;
    overall_rating?: string;
    service_rating?: string;
    food_rating?: string;
    atmosphere_rating?: string;
    hygiene_rating?: string;
    image_num?: number;
    groupon_num?: number;
    discount_num?: number;
    comment_num?: number;
    score?: number;
  };
}

interface BaiduPlaceResponse {
  status: number;
  message: string;
  results: BaiduPlaceResult[];
  total?: number;
  result_type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '美食';
    const region = searchParams.get('region') || '平潭';
    const tag = searchParams.get('tag') || '美食';
    const pageSize = searchParams.get('page_size') || '20';
    const pageNum = searchParams.get('page_num') || '0';
    const scope = searchParams.get('scope') || '2'; // 返回详细信息
    
    // 从环境变量获取百度地图API密钥
    const ak = process.env.BAIDU_MAP_API_KEY;
    if (!ak) {
      return NextResponse.json(
        { error: '百度地图API密钥未配置' },
        { status: 500 }
      );
    }

    // 构建百度地图Place API请求URL
    const baiduApiUrl = new URL('https://api.map.baidu.com/place/v2/search');
    baiduApiUrl.searchParams.set('query', query);
    baiduApiUrl.searchParams.set('region', region);
    baiduApiUrl.searchParams.set('tag', tag);
    baiduApiUrl.searchParams.set('output', 'json');
    baiduApiUrl.searchParams.set('ak', ak);
    baiduApiUrl.searchParams.set('page_size', pageSize);
    baiduApiUrl.searchParams.set('page_num', pageNum);
    baiduApiUrl.searchParams.set('scope', scope);
    baiduApiUrl.searchParams.set('city_limit', 'true'); // 限制在指定区域内
    baiduApiUrl.searchParams.set('extensions_adcode', 'true'); // 返回行政区划编码

    console.log('请求百度地图Place API:', baiduApiUrl.toString());

    // 调用百度地图Place API
    const response = await fetch(baiduApiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`百度地图API请求失败: ${response.status}`);
    }

    const data: BaiduPlaceResponse = await response.json();
    
    if (data.status !== 0) {
      console.warn(`百度地图API返回错误 (状态码: ${data.status}): ${data.message}`);
      
      // 返回友好的错误信息，让前端知道需要降级处理
      return NextResponse.json(
        { 
          success: false,
          error: 'BAIDU_API_UNAVAILABLE',
          message: data.status === 302 ? 'Place API服务未开通，请联系管理员开通相关服务' : `百度地图API错误: ${data.message}`,
          fallback: true // 标识可以降级到本地数据
        },
        { status: 200 } // 返回200状态码，让前端正常处理
      );
    }

    // 转换数据格式以匹配前端Food接口
    const foods = data.results.map((result, index) => {
      // 处理评分数据
      const overallRating = result.overall_rating || result.detail_info?.overall_rating;
      const rating = overallRating ? parseFloat(overallRating) : 4.0;
      
      // 处理价格信息
      const price = result.price || result.detail_info?.price || '价格面议';
      
      // 处理营业时间
      const openingHours = result.shop_hours || result.detail_info?.shop_hours || '营业时间请咨询商家';
      
      // 处理分类和标签
      const category = result.classified_poi_tag || result.tag || result.type || '美食';
      const specialty = result.label || result.content_tag || result.tag || '特色美食';
      
      // 处理描述信息
      let description = result.address || '暂无描述';
      if (result.brand) {
        description = `${result.brand} - ${description}`;
      }
      if (result.status && result.status !== '') {
        description += ` (${result.status})`;
      }
      
      return {
        id: result.uid || result.street_id || `baidu_${index}`,
        name: result.name,
        nameEn: result.name,
        description,
        category,
        price,
        rating,
        cookTime: '15-30分钟',
        location: result.name,
        address: result.address,
        phone: result.telephone || '',
        image: '/images/food/default-food.svg',
        coordinates: {
          lng: result.location.lng,
          lat: result.location.lat
        },
        specialty,
        openingHours,
        ingredients: [],
        // 额外的百度地图数据
        baiduData: {
          uid: result.uid,
          province: result.province,
          city: result.city,
          area: result.area,
          adcode: result.adcode,
          status: result.status,
          classified_poi_tag: result.classified_poi_tag,
          distance: result.distance,
          label: result.label,
          brand: result.brand,
          content_tag: result.content_tag,
          overall_rating: result.detail_info?.overall_rating || result.overall_rating,
          service_rating: result.detail_info?.service_rating || result.service_rating,
          taste_rating: result.taste_rating,
          environment_rating: result.environment_rating,
          facility_rating: result.facility_rating,
          hygiene_rating: result.detail_info?.hygiene_rating || result.hygiene_rating,
          technology_rating: result.technology_rating,
          food_rating: result.detail_info?.food_rating,
          atmosphere_rating: result.detail_info?.atmosphere_rating,
          comment_num: result.detail_info?.comment_num || result.comment_num,
          image_num: result.detail_info?.image_num || result.image_num,
          groupon_num: result.detail_info?.groupon_num || result.groupon_num,
          discount_num: result.detail_info?.discount_num || result.discount_num,
          favorite_num: result.favorite_num,
          checkin_num: result.checkin_num,
          telephone: result.telephone,
          street_id: result.street_id,
          detail: result.detail,
          detail_url: result.detail_url,
          tag: result.tag,
          type: result.type,
          navi_location: result.navi_location,
          alias: result.alias,
          children: result.children,
          photos: result.photos
        }
      };
    });

    // 检查是否需要保存POI数据到数据库
    const saveToDb = searchParams.get('save_to_db') === 'true';
    let saveResult = null;
    
    if (saveToDb && foods.length > 0) {
      try {
        // 转换为POI数据格式
        const poisToSave = foods.map(food => ({
          name: food.name,
          address: food.address,
          latitude: food.coordinates.lat,
          longitude: food.coordinates.lng,
          type: 'restaurant' as const,
          phone: food.phone,
          rating: food.rating,
          price: food.price,
          openingHours: food.openingHours,
          description: food.description,
          images: [],
          tags: [food.category, food.specialty].filter(Boolean),
          source: 'baidu' as const,
          baiduPlaceId: food.baiduData?.uid,
          cuisine: [food.category, food.specialty].filter(Boolean)
        }));
        
        // 调用POI保存API
        const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 3000}`;
        const saveResponse = await fetch(`${baseUrl}/api/poi/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pois: poisToSave })
        });
        
        if (saveResponse.ok) {
          saveResult = await saveResponse.json();
          console.log('POI数据保存成功:', saveResult);
        } else {
          console.error('POI数据保存失败:', await saveResponse.text());
        }
      } catch (saveError) {
        console.error('保存POI数据时出错:', saveError);
      }
    }

    return NextResponse.json({
      success: true,
      data: foods,
      total: data.total,
      message: '搜索成功',
      ...(saveResult && { saveResult })
    });

  } catch (error) {
    console.error('百度地图Place API调用失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '搜索失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}

// 支持POST请求用于复杂查询
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query = '美食',
      region = '平潭',
      tag = '美食',
      page_size = 20,
      page_num = 0,
      scope = 2,
      center,
      filter,
      coord_type = 3,
      city_limit = true
    } = body;

    const ak = process.env.BAIDU_MAP_API_KEY;
    if (!ak) {
      return NextResponse.json(
        { error: '百度地图API密钥未配置' },
        { status: 500 }
      );
    }

    const baiduApiUrl = new URL('https://api.map.baidu.com/place/v2/search');
    baiduApiUrl.searchParams.set('query', query);
    baiduApiUrl.searchParams.set('region', region);
    baiduApiUrl.searchParams.set('tag', tag);
    baiduApiUrl.searchParams.set('output', 'json');
    baiduApiUrl.searchParams.set('ak', ak);
    baiduApiUrl.searchParams.set('page_size', page_size.toString());
    baiduApiUrl.searchParams.set('page_num', page_num.toString());
    baiduApiUrl.searchParams.set('scope', scope.toString());
    baiduApiUrl.searchParams.set('city_limit', city_limit.toString());
    baiduApiUrl.searchParams.set('coord_type', coord_type.toString());
    
    if (center) {
      baiduApiUrl.searchParams.set('center', center);
    }
    
    if (filter) {
      baiduApiUrl.searchParams.set('filter', filter);
    }

    const response = await fetch(baiduApiUrl.toString());
    const data: BaiduPlaceResponse = await response.json();
    
    if (data.status !== 0) {
      throw new Error(`百度地图API返回错误: ${data.message}`);
    }

    const foods = data.results.map((result, index) => ({
      id: result.street_id || `baidu_${index}`,
      name: result.name,
      nameEn: result.name,
      description: result.address || '暂无描述',
      category: result.detail_info?.tag || result.tag || '美食',
      price: result.detail_info?.price || result.price || '价格面议',
      rating: result.detail_info?.overall_rating ? parseFloat(result.detail_info.overall_rating) : 4.0,
      cookTime: '15-30分钟',
      location: result.name,
      address: result.address,
      phone: result.telephone || '',
      image: '/images/food/default-food.svg',
      coordinates: {
        lng: result.location.lng,
        lat: result.location.lat
      },
      specialty: result.detail_info?.tag || '特色美食',
      openingHours: result.detail_info?.shop_hours || result.shop_hours || '营业时间请咨询商家',
      ingredients: [],
      baiduData: {
        overall_rating: result.detail_info?.overall_rating || result.overall_rating,
        service_rating: result.detail_info?.service_rating || result.service_rating,
        food_rating: result.detail_info?.food_rating,
        atmosphere_rating: result.detail_info?.atmosphere_rating,
        hygiene_rating: result.detail_info?.hygiene_rating,
        comment_num: result.detail_info?.comment_num || result.comment_num,
        image_num: result.detail_info?.image_num || result.image_num,
        groupon_num: result.detail_info?.groupon_num || result.groupon_num,
        discount_num: result.detail_info?.discount_num || result.discount_num
      }
    }));

    return NextResponse.json({
      success: true,
      data: foods,
      total: data.total,
      message: '搜索成功'
    });

  } catch (error) {
    console.error('百度地图Place API调用失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '搜索失败，请稍后重试'
      },
      { status: 500 }
    );
  }
}