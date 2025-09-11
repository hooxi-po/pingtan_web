'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Clock, Filter, Map } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import MapComponent from '@/components/map/MapComponent';
import { useAttractionMap } from '@/hooks/useMap';

interface SearchFilters {
  keyword: string;
  location: string;
  category: string;
  priceRange: string;
  rating: number;
  duration: string;
  tags: string[];
  sortBy: 'rating' | 'reviewCount' | 'name' | 'distance';
  sortOrder: 'asc' | 'desc';
}

interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  tags: string[];
  estimatedTime: string;
  price?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 标签映射函数
const getCategoryTags = (category: string) => {
  const tagMappings: Record<string, string[]> = {
    'beach': ['海滩', '游泳', '水上运动'],
    'scenic': ['地质奇观', '观景', '摄影', '日出', '日落'],
    'cultural': ['古村落', '文艺', '古建筑'],
    'adventure': ['探险', '潜水', '无人岛'],
    'historical': ['古建筑', '古村落'],
    'entertainment': ['购物', '美食', '休闲娱乐']
  };
  return tagMappings[category] || [];
};

// 时长匹配函数
const matchesDurationFilter = (estimatedTime: string, durationFilter: string) => {
  switch (durationFilter) {
    case '1-2': return estimatedTime.includes('1') || estimatedTime.includes('2');
    case '2-4': return estimatedTime.includes('2') || estimatedTime.includes('3') || estimatedTime.includes('4');
    case 'half-day': return estimatedTime.includes('半天');
    case 'full-day': return estimatedTime.includes('全天');
    case 'multi-day': return estimatedTime.includes('多天');
    default: return true;
  }
};

const mockAttractions: Attraction[] = [
  {
    id: '1',
    name: '坛南湾',
    description: '平潭最美的海湾之一，拥有细腻的沙滩和清澈的海水',
    image: '/images/attractions/tannan-bay.jpg',
    rating: 4.8,
    reviewCount: 1234,
    location: '平潭县坛南湾',
    tags: ['海滩', '游泳', '日出'],
    estimatedTime: '3-4小时',
    price: '免费',
    coordinates: { lat: 25.4444, lng: 119.7906 }
  },
  {
    id: '2',
    name: '石牌洋',
    description: '平潭标志性景观，两座巨大的海蚀柱屹立在海中',
    image: '/images/attractions/shipaiyang.jpg',
    rating: 4.9,
    reviewCount: 2156,
    location: '平潭县苏澳镇',
    tags: ['地质奇观', '摄影', '日落'],
    estimatedTime: '2-3小时',
    price: '¥30',
    coordinates: { lat: 25.5167, lng: 119.8333 }
  },
  {
    id: '3',
    name: '龙凤头海滨浴场',
    description: '平潭最大的海滨浴场，设施完善，适合全家游玩',
    image: '/images/attractions/longfengtou.jpg',
    rating: 4.6,
    reviewCount: 987,
    location: '平潭县龙凤头',
    tags: ['海滩', '游泳', '水上运动'],
    estimatedTime: '半天',
    price: '免费',
    coordinates: { lat: 25.5028, lng: 119.7889 }
  },
  {
    id: '4',
    name: '北港村',
    description: '充满文艺气息的石头村落，保留了传统的闽南建筑风格',
    image: '/images/attractions/beigang.jpg',
    rating: 4.7,
    reviewCount: 756,
    location: '平潭县流水镇北港村',
    tags: ['古村落', '文艺', '民宿'],
    estimatedTime: '2-3小时',
    price: '免费',
    coordinates: { lat: 25.4167, lng: 119.7500 }
  },
  {
    id: '5',
    name: '猴研岛',
    description: '神秘的无人岛屿，拥有独特的地质景观和丰富的海洋生物',
    image: '/images/attractions/houyan.jpg',
    rating: 4.5,
    reviewCount: 432,
    location: '平潭县东南海域',
    tags: ['无人岛', '探险', '潜水'],
    estimatedTime: '全天',
    price: '¥80',
    coordinates: { lat: 25.3833, lng: 119.8667 }
  },
  {
    id: '6',
    name: '海坛古城',
    description: '仿古建筑群，集文化、商业、娱乐于一体的旅游综合体',
    image: '/images/attractions/ancient-city.jpg',
    rating: 4.3,
    reviewCount: 1089,
    location: '平潭县潭城镇',
    tags: ['古建筑', '购物', '美食'],
    estimatedTime: '3-4小时',
    price: '免费',
    coordinates: { lat: 25.5000, lng: 119.7833 }
  }
];

export default function AttractionsPage() {
  const { t } = useLocale();
  const [attractions, setAttractions] = useState<Attraction[]>(mockAttractions);
  const [filteredAttractions, setFilteredAttractions] = useState<Attraction[]>(mockAttractions);
  const [showMap, setShowMap] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 搜索和筛选逻辑
  const handleSearch = (filters: SearchFilters) => {
    let filtered = attractions.filter(attraction => {
      // 关键词搜索
      const matchesKeyword = !filters.keyword || 
        attraction.name.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        attraction.description.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        attraction.location.toLowerCase().includes(filters.keyword.toLowerCase());
      
      // 位置筛选
      const matchesLocation = !filters.location || 
        attraction.location.toLowerCase().includes(filters.location.toLowerCase());
      
      // 类型筛选
      const matchesCategory = !filters.category || 
        attraction.tags.some(tag => getCategoryTags(filters.category).includes(tag));
      
      // 价格筛选
      const matchesPrice = !filters.priceRange || (() => {
        const price = attraction.price || '免费';
        switch (filters.priceRange) {
          case 'free': return price === '免费';
          case '0-50': return price.includes('¥') && parseInt(price.replace(/[^0-9]/g, '')) <= 50;
          case '50-100': {
            const num = parseInt(price.replace(/[^0-9]/g, ''));
            return price.includes('¥') && num > 50 && num <= 100;
          }
          case '100-200': {
            const num = parseInt(price.replace(/[^0-9]/g, ''));
            return price.includes('¥') && num > 100 && num <= 200;
          }
          case '200+': {
            const num = parseInt(price.replace(/[^0-9]/g, ''));
            return price.includes('¥') && num > 200;
          }
          default: return true;
        }
      })();
      
      // 评分筛选
      const matchesRating = filters.rating === 0 || attraction.rating >= filters.rating;
      
      // 时长筛选
      const matchesDuration = !filters.duration || 
        matchesDurationFilter(attraction.estimatedTime, filters.duration);
      
      // 标签筛选
      const matchesTags = filters.tags.length === 0 || 
        filters.tags.some(tag => attraction.tags.includes(tag));
      
      return matchesKeyword && matchesLocation && matchesCategory && 
             matchesPrice && matchesRating && matchesDuration && matchesTags;
    });

    // 排序
    filtered.sort((a, b) => {
      let result = 0;
      switch (filters.sortBy) {
        case 'rating':
          result = b.rating - a.rating;
          break;
        case 'reviewCount':
          result = b.reviewCount - a.reviewCount;
          break;
        case 'name':
          result = a.name.localeCompare(b.name);
          break;
        case 'distance':
          // 这里可以根据用户位置计算距离，暂时使用默认排序
          result = 0;
          break;
        default:
          result = 0;
      }
      return filters.sortOrder === 'asc' ? -result : result;
    });

    setFilteredAttractions(filtered);
  };

  const handleReset = () => {
    setFilteredAttractions(attractions);
  };

  // 获取地图标记点
  const getMapMarkers = () => {
    return filteredAttractions.map(attraction => ({
      id: attraction.id,
      position: [attraction.coordinates?.lng || 119.7906, attraction.coordinates?.lat || 25.4444] as [number, number],
      title: attraction.name,
      content: `${attraction.description}<br/>评分: ${attraction.rating} ⭐<br/>价格: ${attraction.price || '免费'}`
    }));
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('attractions.title', '平潭景点')}
            </h1>
            <p className="text-gray-600 max-w-2xl">
              {t('attractions.subtitle', '探索平潭岛的自然美景和人文景观，发现属于你的完美旅程')}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 高级搜索组件 */}
          <AdvancedSearch
            onSearch={handleSearch}
            onReset={handleReset}
            className="mb-8"
          />

          {/* 视图控制和结果统计 */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {t('attractions.searchResults', `找到 ${filteredAttractions.length} 个景点`)}
            </p>
            
            <div className="flex items-center gap-3">
              {/* 地图切换按钮 */}
              <button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showMap
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Map className="w-4 h-4" />
                {showMap ? t('attractions.hideMap', '隐藏地图') : t('attractions.showMap', '显示地图')}
              </button>
              
              {/* 视图模式切换 */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('attractions.gridView', '网格')}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('attractions.listView', '列表')}
                </button>
              </div>
            </div>
          </div>

          {/* 地图视图 */}
          {showMap && (
            <div className="mb-8">
              <MapComponent
                config={{
                  center: [119.7906, 25.4444],
                  zoom: 5
                }}
                markers={getMapMarkers()}
                height="400px"
                onMarkerClick={(markerId) => {
                  // 可以添加点击标记的处理逻辑
                  console.log('Clicked marker:', markerId);
                }}
              />
            </div>
          )}

          {/* 景点展示 */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
          }>
            {filteredAttractions.map(attraction => (
              <Link
                key={attraction.id}
                href={`/attractions/${attraction.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="relative h-48">
                  <Image
                    src={attraction.image}
                    alt={attraction.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {attraction.price && (
                    <div className="absolute top-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-medium">
                      {attraction.price}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {attraction.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {attraction.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{attraction.rating}</span>
                      <span>({attraction.reviewCount})</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{attraction.estimatedTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{attraction.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {attraction.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {attraction.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{attraction.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 无搜索结果 */}
          {filteredAttractions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('attractions.noResults', '未找到相关景点')}
              </h3>
              <p className="text-gray-600">
                {t('attractions.noResultsDesc', '尝试调整搜索关键词或筛选条件')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}