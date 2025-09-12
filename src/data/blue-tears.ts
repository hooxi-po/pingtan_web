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
    name: '长江澳',
    nameEn: 'Changjiang Au',
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
    id: '2',
    name: '镜沙',
    nameEn: 'Jingsha Beach',
    address: '平潭县镜沙海滩',
    spotType: '海滩观赏',
    bestSeason: '5月-7月',
    bestTime: '晚上9点-凌晨1点',
    features: ['沙质细腻', '视野开阔', '交通便利', '适合摄影'],
    contact: '平潭旅游热线：0591-24311111',
    images: ['/images/blue-tears/jingsha.jpg'],
    latitude: 25.4823,
    longitude: 119.8156,
    description: '镜沙海滩以其细腻的沙质和开阔的视野著称，是观赏蓝眼泪的绝佳地点',
    rating: 4.5,
    difficulty: '简单',
    transportation: '自驾推荐，有停车场'
  },
  {
    id: '3',
    name: '龙王头',
    nameEn: 'Longwangtou Beach',
    address: '平潭县龙王头海滨浴场',
    spotType: '海滩观赏',
    bestSeason: '4月-8月',
    bestTime: '晚上8点-凌晨2点',
    features: ['知名海滩', '设施完善', '交通便利', '游客较多'],
    contact: '平潭旅游热线：0591-24311111',
    images: ['/images/blue-tears/longwangtou.jpg'],
    latitude: 25.4912,
    longitude: 119.8445,
    description: '平潭最著名的海滨浴场，沙滩广阔平缓，是热门的蓝眼泪观赏地',
    rating: 4.7,
    difficulty: '简单',
    transportation: '自驾或公交直达'
  },
  {
    id: '4',
    name: '东美村',
    nameEn: 'Dongmei Village',
    address: '平潭县东美村海岸线',
    spotType: '渔村观赏',
    bestSeason: '4月-7月',
    bestTime: '晚上9点-凌晨1点',
    features: ['渔村风情', '蓝眼泪频现', '毗邻仙人井', '依山傍海'],
    contact: '东美村委会：13800138004',
    images: ['/images/blue-tears/dongmei.jpg'],
    latitude: 25.5234,
    longitude: 119.8012,
    description: '蓝眼泪频繁光顾之地，毗邻仙人井景区，是平潭重要渔业港口之一',
    rating: 4.4,
    difficulty: '简单',
    transportation: '自驾推荐'
  },
  {
    id: '5',
    name: '坛南湾',
    nameEn: 'Tannan Bay',
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