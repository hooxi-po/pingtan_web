// 蓝眼泪观赏点数据类型定义
export interface BlueTearSpot {
  id: string
  name: string
  nameEn?: string
  address: string
  spotType: string
  bestSeason: string
  bestTime: string
  features: string[]
  contact?: string
  images: string[]
  latitude?: number
  longitude?: number
  description?: string
  rating?: number
  difficulty: string
  transportation: string
}

// 蓝眼泪观赏点类型颜色映射
export const spotTypeColors: { [key: string]: string } = {
  '海滩观赏': 'bg-blue-100 text-blue-800',
  '观测台': 'bg-green-100 text-green-800',
  '野生海岸': 'bg-purple-100 text-purple-800',
  '码头观赏': 'bg-cyan-100 text-cyan-800',
  '景区观赏': 'bg-indigo-100 text-indigo-800',
  '其他': 'bg-gray-100 text-gray-800'
}

// Mock 蓝眼泪观赏点数据
export const mockBlueTearSpots: BlueTearSpot[] = [
  {
    id: '1',
    name: '坛南湾蓝眼泪观赏点',
    nameEn: 'Tannan Bay Blue Tears Viewing Point',
    address: '平潭县坛南湾海滩',
    spotType: '海滩观赏',
    bestSeason: '4月-8月',
    bestTime: '晚上8点-凌晨2点',
    features: ['最佳观赏点', '交通便利', '设施完善', '摄影热门'],
    contact: '平潭旅游热线：0591-24311111',
    images: ['/images/blue-tears/tannan-bay.jpg'],
    latitude: 25.4756,
    longitude: 119.8234,
    description: '平潭最著名的蓝眼泪观赏地，每年吸引无数游客前来观赏这一神奇的海洋生物发光现象',
    rating: 4.9,
    difficulty: '简单',
    transportation: '自驾或公交直达'
  },
  {
    id: '2',
    name: '北港村蓝眼泪观测台',
    nameEn: 'Beigang Village Blue Tears Observatory',
    address: '平潭县北港村海岸线',
    spotType: '观测台',
    bestSeason: '5月-7月',
    bestTime: '晚上9点-凌晨1点',
    features: ['专业观测', '视野开阔', '文艺氛围', '民宿配套'],
    contact: '北港村委会：13800138002',
    images: ['/images/blue-tears/beigang-village.jpg'],
    latitude: 25.5156,
    longitude: 119.7823,
    description: '结合石厝文化的蓝眼泪观赏点，在古朴的渔村中感受大自然的奇迹',
    rating: 4.7,
    difficulty: '简单',
    transportation: '自驾推荐，有停车场'
  },
  {
    id: '3',
    name: '长江澳蓝眼泪秘境',
    nameEn: 'Changjiang Au Blue Tears Secret Spot',
    address: '平潭县长江澳风车田海岸',
    spotType: '野生海岸',
    bestSeason: '4月-6月',
    bestTime: '晚上10点-凌晨12点',
    features: ['人少景美', '风车背景', '野生海岸', '摄影天堂'],
    contact: '当地向导：13700137003',
    images: ['/images/blue-tears/changjiang-au.jpg'],
    latitude: 25.5345,
    longitude: 119.7123,
    description: '相对小众的蓝眼泪观赏点，配合风车群的背景，是摄影爱好者的天堂',
    rating: 4.6,
    difficulty: '中等',
    transportation: '需要徒步10分钟'
  },
  {
    id: '4',
    name: '海坛古城蓝眼泪码头',
    nameEn: 'Haitan Ancient City Blue Tears Pier',
    address: '平潭县海坛古城码头区域',
    spotType: '码头观赏',
    bestSeason: '全年',
    bestTime: '晚上8点-11点',
    features: ['古城夜景', '码头风情', '餐饮配套', '夜市热闹'],
    images: ['/images/blue-tears/ancient-city.jpg'],
    latitude: 25.5018,
    longitude: 119.7909,
    description: '在古城的灯火阑珊中观赏蓝眼泪，别有一番风味，适合家庭游客',
    rating: 4.3,
    difficulty: '简单',
    transportation: '公交直达，停车方便'
  },
  {
    id: '5',
    name: '东海仙境蓝眼泪观景台',
    nameEn: 'East Sea Wonderland Blue Tears Platform',
    address: '平潭县东海仙境景区',
    spotType: '景区观赏',
    bestSeason: '5月-8月',
    bestTime: '晚上9点-凌晨1点',
    features: ['景区配套', '安全保障', '导游服务', '团体优惠'],
    contact: '景区服务：0591-24366666',
    images: ['/images/blue-tears/east-sea.jpg'],
    latitude: 25.4892,
    longitude: 119.8156,
    description: '正规景区内的蓝眼泪观赏点，设施完善，安全有保障，适合初次观赏者',
    rating: 4.5,
    difficulty: '简单',
    transportation: '景区大巴接送'
  }
]

// API 接口类型定义
export interface BlueTearSpotsResponse {
  data: BlueTearSpot[]
  total: number
  page: number
  pageSize: number
}

export interface BlueTearSpotDetailResponse {
  data: BlueTearSpot
}

// 筛选参数类型
export interface BlueTearSpotFilters {
  search?: string
  spotType?: string
  difficulty?: string
  bestSeason?: string
}

// 地图标记点接口
export interface BlueTearMapMarker {
  id: string;
  position: [number, number]; // [lng, lat]
  title: string;
  content?: string;
  type: 'beach' | 'viewpoint' | 'wild' | 'dock' | 'scenic';
  rating?: number;
  bestTime?: string;
  features?: string[];
}

// 将蓝眼泪观赏点转换为地图标记点
export function convertToMapMarkers(spots: BlueTearSpot[]): BlueTearMapMarker[] {
  return spots
    .filter(spot => spot.latitude && spot.longitude)
    .map(spot => ({
      id: spot.id,
      position: [spot.longitude!, spot.latitude!],
      title: spot.name,
      content: spot.description || `${spot.spotType} - ${spot.bestSeason}`,
      type: getMapMarkerType(spot.spotType),
      rating: spot.rating,
      bestTime: spot.bestTime,
      features: spot.features
    }));
}

// 将观赏点类型转换为地图标记类型
function getMapMarkerType(spotType: string): BlueTearMapMarker['type'] {
  const typeMap: { [key: string]: BlueTearMapMarker['type'] } = {
    '海滩观赏': 'beach',
    '观测台': 'viewpoint',
    '野生海岸': 'wild',
    '码头观赏': 'dock',
    '景区观赏': 'scenic'
  };
  return typeMap[spotType] || 'beach';
}