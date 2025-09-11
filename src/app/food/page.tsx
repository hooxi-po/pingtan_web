'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Phone, Filter, Search, ChefHat, Utensils } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MapComponent from '@/components/map/MapComponent';
import { useMap } from '@/hooks/useMap';
import { MapMarker } from '@/components/map/MapComponent';

// 添加样式支持
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// 美食类型接口
interface Food {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  category: string;
  price: string;
  rating: number;
  cookTime: string;
  location: string;
  address: string;
  phone?: string;
  image: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  specialty: string;
  openingHours: string;
  ingredients: string[];
  // 百度地图额外数据
  baiduData?: {
    uid?: string;
    province?: string;
    city?: string;
    area?: string;
    adcode?: number;
    status?: string;
    classified_poi_tag?: string;
    distance?: number;
    label?: string;
    brand?: string;
    content_tag?: string;
    overall_rating?: string;
    service_rating?: string;
    environment_rating?: string;
    taste_rating?: string;
    facility_rating?: string;
    hygiene_rating?: string;
    technology_rating?: string;
    food_rating?: string;
    atmosphere_rating?: string;
    image_num?: string;
    groupon_num?: number;
    discount_num?: number;
    comment_num?: string;
    favorite_num?: string;
    checkin_num?: string;
    telephone?: string;
    street_id?: string;
    detail?: number;
    detail_url?: string;
    tag?: string;
    type?: string;
    navi_location?: {
      lat: number;
      lng: number;
    };
    alias?: string[];
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
    photos?: string[];
  };
}

// 模拟美食数据
const mockFoods: Food[] = [
  {
    id: '1',
    name: '时来运转海蛎煎',
    nameEn: 'Shi Lai Yun Zhuan Oyster Omelet',
    description: '选用新鲜海蛎，配以鸡蛋和地瓜粉，煎制而成，外酥内嫩，海味浓郁',
    category: '传统小吃',
    price: '¥15-25',
    rating: 4.8,
    cookTime: '15分钟',
    location: '老街小吃店',
    address: '平潭县潭城镇老街15号',
    phone: '13800138001',
    image: '/images/food/oyster-pancake.svg',
    coordinates: {
      lng: 119.7906,
      lat: 25.5018
    },
    specialty: '传统工艺',
    openingHours: '07:00-19:00',
    ingredients: ['新鲜海蛎', '鸡蛋', '地瓜粉', '韭菜']
  },
  {
    id: '2',
    name: '平潭鱼丸',
    nameEn: 'Pingtan Fish Balls',
    description: '选用新鲜海鱼制作，手工打制，Q弹爽滑，汤汁鲜美清香',
    category: '汤品',
    price: '¥20-30',
    rating: 4.7,
    cookTime: '20分钟',
    location: '海鲜大排档',
    address: '平潭县澳前镇海鲜街8号',
    phone: '13900139002',
    image: '/images/food/fish-balls.svg',
    coordinates: {
      lng: 119.7889,
      lat: 25.5044
    },
    specialty: '手工制作',
    openingHours: '10:00-22:00',
    ingredients: ['新鲜海鱼', '地瓜粉', '盐', '胡椒']
  },
  {
    id: '3',
    name: '海鲜面线',
    nameEn: 'Seafood Noodles',
    description: '面线爽滑，海鲜丰富，汤头浓郁香醇，营养丰富',
    category: '面食',
    price: '¥25-35',
    rating: 4.6,
    cookTime: '25分钟',
    location: '渔家乐餐厅',
    address: '平潭县流水镇渔港路66号',
    phone: '13700137003',
    image: '/images/food/seafood-noodles.svg',
    coordinates: {
      lng: 119.8156,
      lat: 25.4892
    },
    specialty: '秘制汤底',
    openingHours: '11:00-21:30',
    ingredients: ['面线', '虾', '蟹肉', '紫菜', '鸡蛋']
  },
  {
    id: '4',
    name: '地瓜丸',
    nameEn: 'Sweet Potato Balls',
    description: '香甜软糯，外焦内嫩，是平潭人的童年回忆，传统手艺制作',
    category: '甜品',
    price: '¥10-18',
    rating: 4.5,
    cookTime: '10分钟',
    location: '街边小摊',
    address: '平潭县苏澳镇市场街',
    phone: '13600136004',
    image: '/images/food/sweet-potato-balls.svg',
    coordinates: {
      lng: 119.7654,
      lat: 25.5234
    },
    specialty: '传统手艺',
    openingHours: '06:00-18:00',
    ingredients: ['地瓜', '糯米粉', '红糖', '芝麻']
  },
  {
    id: '5',
    name: '紫菜包饭',
    nameEn: 'Seaweed Rice Roll',
    description: '当地特产紫菜包裹新鲜米饭，配以各种海鲜和蔬菜，营养均衡',
    category: '主食',
    price: '¥18-28',
    rating: 4.4,
    cookTime: '12分钟',
    location: '海边小屋',
    address: '平潭县坛南湾海滨路88号',
    phone: '13500135005',
    image: '/images/food/seaweed-rice.svg',
    coordinates: {
      lng: 119.7234,
      lat: 25.4567
    },
    specialty: '当地紫菜',
    openingHours: '08:00-20:00',
    ingredients: ['紫菜', '米饭', '黄瓜', '胡萝卜', '鸡蛋']
  },
  {
    id: '6',
    name: '花生汤',
    nameEn: 'Peanut Soup',
    description: '香甜可口的传统甜品，花生软糯，汤汁香甜，老少皆宜',
    category: '甜品',
    price: '¥8-15',
    rating: 4.3,
    cookTime: '8分钟',
    location: '传统茶室',
    address: '平潭县潭城镇文化街12号',
    phone: '13400134006',
    image: '/images/food/peanut-soup.svg',
    coordinates: {
      lng: 119.7890,
      lat: 25.5100
    },
    specialty: '传统配方',
    openingHours: '09:00-22:00',
    ingredients: ['花生', '冰糖', '桂花', '莲子']
  }
];

// 美食分类
const foodCategories = ['全部', '传统小吃', '汤品', '面食', '甜品', '主食'];

export default function FoodPage() {
  const [foods, setFoods] = useState<Food[]>(mockFoods);
  const [filteredFoods, setFilteredFoods] = useState<Food[]>(mockFoods);
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [priceFilter, setPriceFilter] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'local' | 'baidu'>('local');
  const [searchRegion, setSearchRegion] = useState('平潭');
  const [saveToDatabase, setSaveToDatabase] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<any>(null);

  // 本地搜索功能
  const searchLocalFoods = (query: string) => {
    const filtered = mockFoods.filter(food => 
      food.name.toLowerCase().includes(query.toLowerCase()) ||
      food.description.toLowerCase().includes(query.toLowerCase()) ||
      food.category.toLowerCase().includes(query.toLowerCase()) ||
      food.specialty.toLowerCase().includes(query.toLowerCase())
    );
    setFoods(filtered);
    setFilteredFoods(filtered);
    setSearchMode('local');
  };

  // 搜索百度地图Place API
  const searchBaiduPlaces = async (query: string, region: string = '平潭', saveToDb: boolean = false) => {
    setIsSearching(true);
    if (saveToDb) {
      setIsSaving(true);
      setSaveResult(null);
    }
    
    try {
      const url = `/api/baidu-place?query=${encodeURIComponent(query)}&region=${encodeURIComponent(region)}&tag=美食&page_size=20${saveToDb ? '&save_to_db=true' : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        setFoods(data.data);
        setFilteredFoods(data.data);
        setSearchMode('baidu');
        
        // 处理保存结果
        if (saveToDb && data.saveResult) {
          setSaveResult(data.saveResult);
          const { restaurants, attractions, accommodations, errors } = data.saveResult.data;
          const totalSaved = restaurants + attractions + accommodations;
          
          if (totalSaved > 0) {
            alert(`✅ 成功保存 ${totalSaved} 个POI数据到数据库！\n餐厅: ${restaurants}个\n景点: ${attractions}个\n住宿: ${accommodations}个${errors.length > 0 ? `\n\n⚠️ ${errors.length}个数据保存失败` : ''}`);
          } else if (errors.length > 0) {
            alert(`⚠️ POI数据保存失败：\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`);
          } else {
            alert('ℹ️ 没有新的POI数据需要保存（可能已存在）');
          }
        }
      } else if (data.fallback) {
        // 百度API不可用，降级到本地搜索
        console.warn('百度地图API不可用，使用本地搜索:', data.message);
        searchLocalFoods(query);
        // 显示提示信息
        alert(`百度地图搜索暂不可用：${data.message}\n\n已为您在本地数据中搜索相关内容。`);
      } else {
        console.error('搜索失败:', data.message);
        // 搜索失败时也尝试本地搜索
        searchLocalFoods(query);
      }
    } catch (error) {
      console.error('搜索请求失败:', error);
      // 请求失败时降级到本地搜索
      searchLocalFoods(query);
      alert('网络请求失败，已为您在本地数据中搜索相关内容。');
    } finally {
      setIsSearching(false);
      if (saveToDb) {
        setIsSaving(false);
      }
    }
  };

  // 保存当前搜索结果到数据库
  const savePOIToDatabase = async () => {
    if (searchMode !== 'baidu' || foods.length === 0) {
      alert('请先进行百度地图搜索，然后再保存数据');
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

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

      const response = await fetch('/api/poi/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pois: poisToSave })
      });

      const result = await response.json();
      setSaveResult(result);

      if (result.success) {
        const { restaurants, attractions, accommodations, errors } = result.data;
        const totalSaved = restaurants + attractions + accommodations;
        
        if (totalSaved > 0) {
          alert(`✅ 成功保存 ${totalSaved} 个POI数据到数据库！\n餐厅: ${restaurants}个\n景点: ${attractions}个\n住宿: ${accommodations}个${errors.length > 0 ? `\n\n⚠️ ${errors.length}个数据保存失败` : ''}`);
        } else if (errors.length > 0) {
          alert(`⚠️ POI数据保存失败：\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}`);
        } else {
          alert('ℹ️ 没有新的POI数据需要保存（可能已存在）');
        }
      } else {
        alert(`❌ 保存失败：${result.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('保存POI数据失败:', error);
      alert('❌ 保存POI数据时发生错误，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 重置到本地数据
  const resetToLocalData = () => {
    setFoods(mockFoods);
    setFilteredFoods(mockFoods);
    setSearchMode('local');
    setSearchQuery('');
    setCategoryFilter('全部');
    setPriceFilter('');
  };

  // 处理搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      resetToLocalData();
      return;
    }
    await searchBaiduPlaces(searchQuery, searchRegion, saveToDatabase);
  };

  // 使用地图Hook
  const mapHook = useMap({
    autoFitMarkers: true,
    initialConfig: {
      center: [119.7906, 25.5018],
      zoom: 12
    },
    onMarkerClick: (marker: MapMarker) => {
      const food = foods.find(f => f.id === marker.id);
      setSelectedFood(food || null);
    }
  });

  // 筛选逻辑
  useEffect(() => {
    let filtered = foods;

    // 分类筛选
    if (categoryFilter !== '全部') {
      filtered = filtered.filter(food => food.category === categoryFilter);
    }

    // 价格筛选
    if (priceFilter) {
      filtered = filtered.filter(food => {
        const price = parseInt(food.price.match(/\d+/)?.[0] || '0');
        switch (priceFilter) {
          case '10-20':
            return price >= 10 && price <= 20;
          case '20-30':
            return price >= 20 && price <= 30;
          case '30+':
            return price >= 30;
          default:
            return true;
        }
      });
    }

    setFilteredFoods(filtered);
  }, [categoryFilter, priceFilter, foods]);

  // 更新地图标记点
  useEffect(() => {
    const markers: MapMarker[] = filteredFoods.map(food => {
      // 根据数据来源构建内容
      let content = '';
      if (food.baiduData) {
        // 百度地图数据 - 显示更丰富的信息
        const ratings = [];
        if (food.baiduData.overall_rating) ratings.push(`总评: ${food.baiduData.overall_rating}`);
        if (food.baiduData.taste_rating) ratings.push(`口味: ${food.baiduData.taste_rating}`);
        if (food.baiduData.service_rating) ratings.push(`服务: ${food.baiduData.service_rating}`);
        if (food.baiduData.environment_rating) ratings.push(`环境: ${food.baiduData.environment_rating}`);
        
        const stats = [];
        if (food.baiduData.comment_num) stats.push(`${food.baiduData.comment_num}条评论`);
        if (food.baiduData.favorite_num) stats.push(`${food.baiduData.favorite_num}收藏`);
        if (food.baiduData.checkin_num) stats.push(`${food.baiduData.checkin_num}签到`);
        
        const tags = [];
        if (food.baiduData.brand) tags.push(food.baiduData.brand);
        if (food.baiduData.label) tags.push(food.baiduData.label);
        if (food.specialty && !tags.includes(food.specialty)) tags.push(food.specialty);
        
        content = `
          <div class="p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${food.name}</h3>
            ${food.baiduData.brand ? `<p class="text-sm font-medium text-blue-600 mb-1">${food.baiduData.brand}</p>` : ''}
            <p class="text-sm text-gray-600 mb-2">${food.description}</p>
            
            <div class="flex items-center mb-2">
              <span class="text-yellow-500">★</span>
              <span class="ml-1 text-sm font-medium">${food.rating}</span>
              ${food.baiduData.status ? `<span class="ml-2 text-xs px-1 py-0.5 rounded ${food.baiduData.status === '暂停营业' || food.baiduData.status === '已关闭' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}">${food.baiduData.status}</span>` : ''}
            </div>
            
            ${ratings.length > 0 ? `<div class="text-xs text-gray-500 mb-2">${ratings.join(' | ')}</div>` : ''}
            
            <div class="text-sm text-gray-600 mb-1">
              <strong>价格:</strong> ${food.price}
            </div>
            <div class="text-sm text-gray-600 mb-1">
              <strong>地址:</strong> ${food.address}
            </div>
            ${food.baiduData.telephone ? `<div class="text-sm text-gray-600 mb-1"><strong>电话:</strong> ${food.baiduData.telephone}</div>` : ''}
            <div class="text-sm text-gray-600 mb-2">
              <strong>营业时间:</strong> ${food.openingHours}
            </div>
            
            ${stats.length > 0 ? `<div class="text-xs text-gray-500 mb-2">${stats.join(' | ')}</div>` : ''}
            
            <div class="flex flex-wrap gap-1 mt-2">
              <span class="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">百度地图</span>
              ${tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">${tag}</span>`).join('')}
              ${food.baiduData.groupon_num && food.baiduData.groupon_num > 0 ? `<span class="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">团购</span>` : ''}
              ${food.baiduData.discount_num && food.baiduData.discount_num > 0 ? `<span class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">优惠</span>` : ''}
            </div>
          </div>
        `;
      } else {
        // 本地数据
        content = `
          <div class="p-3 max-w-sm">
            <h3 class="font-bold text-lg mb-2">${food.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${food.description}</p>
            <div class="flex items-center mb-2">
              <span class="text-yellow-500">★</span>
              <span class="ml-1 text-sm font-medium">${food.rating}</span>
            </div>
            <div class="text-sm text-gray-600 mb-1">
              <strong>价格:</strong> ${food.price}
            </div>
            <div class="text-sm text-gray-600 mb-1">
              <strong>地址:</strong> ${food.address}
            </div>
            <div class="text-sm text-gray-600 mb-2">
              <strong>营业时间:</strong> ${food.openingHours}
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              <span class="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">本地推荐</span>
              ${food.specialty ? `<span class="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded">${food.specialty}</span>` : ''}
            </div>
          </div>
        `;
      }
      
      return {
        id: food.id,
        position: [food.coordinates.lng, food.coordinates.lat],
        title: food.name,
        content,
        onClick: () => {
          setSelectedFood(food);
        }
      };
    });

    mapHook.setMarkers(markers);
  }, [filteredFoods, mapHook.setMarkers, searchMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 注入样式 */}
      <style jsx>{styles}</style>
      


      <div className="container mx-auto px-4 py-8">
        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* 搜索输入框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索美食名称或类型（如：海蛎煎、火锅、川菜等）"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  disabled={isSearching}
                />
              </div>
            </div>

            {/* 搜索区域选择 */}
            <div className="lg:w-32">
              <select
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                disabled={isSearching}
              >
                <option value="平潭">平潭</option>
                <option value="福州">福州</option>
                <option value="厦门">厦门</option>
                <option value="泉州">泉州</option>
              </select>
            </div>

            {/* 搜索按钮 */}
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  搜索中...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  搜索
                </>
              )}
            </button>

            {/* 保存到数据库选项 */}
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg">
              <input
                type="checkbox"
                id="saveToDatabase"
                checked={saveToDatabase}
                onChange={(e) => setSaveToDatabase(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="saveToDatabase" className="text-sm text-gray-700 whitespace-nowrap">
                保存到数据库
              </label>
            </div>

            {/* 重置按钮 */}
            {searchMode === 'baidu' && (
              <button
                onClick={resetToLocalData}
                className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                重置
              </button>
            )}

            {/* 分类筛选 */}
            <div className="lg:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {foodCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* 价格筛选 */}
            <div className="lg:w-48">
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">所有价格</option>
                <option value="10-20">¥10-20</option>
                <option value="20-30">¥20-30</option>
                <option value="30+">¥30以上</option>
              </select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>找到 {filteredFoods.length} 个美食推荐</span>
              {searchMode === 'baidu' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-xs">
                  百度地图数据
                </span>
              )}
              {searchMode === 'local' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                  本地推荐
                </span>
              )}
              {/* 保存状态显示 */}
              {isSaving && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-xs flex items-center gap-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                  保存中...
                </span>
              )}
              {saveResult && (
                <span className={`px-2 py-1 rounded text-xs ${
                  saveResult.success 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {saveResult.success 
                    ? `已保存 ${saveResult.saved || 0} 条数据` 
                    : '保存失败'
                  }
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>平均评分: {filteredFoods.length > 0 ? (filteredFoods.reduce((sum, food) => sum + food.rating, 0) / filteredFoods.length).toFixed(1) : '0.0'}</span>
              <span>搜索区域: {searchRegion}</span>
            </div>
          </div>
        </div>

        {/* 地图和搜索结果布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 地图区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">平潭美食地图</h3>
                    <p className="text-sm text-gray-600">点击地图标记查看美食详情</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    找到 {filteredFoods.length} 个美食
                  </div>
                </div>
              </div>
              <div className="h-[calc(100%-80px)]">
                <MapComponent
                  config={{ center: mapHook.center, zoom: mapHook.zoom }}
                   markers={mapHook.markers}
                   onMapReady={mapHook.setMapInstance}
                 />
              </div>
            </div>
          </div>

          {/* 搜索结果列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: '600px' }}>
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">搜索结果</h3>
                <p className="text-sm text-gray-600">
                  {searchMode === 'baidu' ? '百度地图数据' : '本地推荐数据'} · {filteredFoods.length} 个结果
                </p>
              </div>
              <div className="h-[calc(100%-80px)] overflow-y-auto">
                {filteredFoods.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredFoods.map((food) => (
                      <div
                        key={food.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedFood(food);
                          mapHook.panTo([food.coordinates.lng, food.coordinates.lat], 15);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Image
                              src={food.image}
                              alt={food.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {food.name}
                              </h4>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600 ml-1">{food.rating}</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {food.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-orange-600">
                                {food.price}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span className="truncate max-w-20">{food.location}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                {food.category}
                              </span>
                              {food.baiduData && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded">
                                  百度地图
                                </span>
                              )}
                              {food.baiduData?.status && (
                                <span className={`px-2 py-0.5 text-xs rounded ${
                                  food.baiduData.status === '暂停营业' || food.baiduData.status === '已关闭'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-green-100 text-green-600'
                                }`}>
                                  {food.baiduData.status}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm">暂无搜索结果</p>
                    <p className="text-xs mt-1">尝试调整搜索条件或筛选器</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 选中美食详情弹窗 */}
      {selectedFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedFood.name}</h2>
                  {selectedFood.nameEn && (
                    <p className="text-gray-500">{selectedFood.nameEn}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedFood(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="relative h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedFood.image}
                  alt={selectedFood.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed">{selectedFood.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current mr-2" />
                    <span className="font-medium">{selectedFood.rating} 分</span>
                  </div>
                  <div className="text-orange-600 font-bold text-lg">{selectedFood.price}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>制作时间: {selectedFood.cookTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Utensils className="w-5 h-5 mr-2" />
                    <span>营业时间: {selectedFood.openingHours}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{selectedFood.location}</span>
                  </div>
                  {selectedFood.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2" />
                      <span>{selectedFood.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">主要食材:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFood.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-gray-600">
                    <strong>地址:</strong> {selectedFood.address}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href={`/food/${selectedFood.id}`}>
                    <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                      查看完整介绍
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      mapHook.panTo([selectedFood.coordinates.lng, selectedFood.coordinates.lat], 15);
                      setSelectedFood(null);
                    }}
                    className="border border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
                  >
                    地图定位
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}