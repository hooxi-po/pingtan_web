'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, MapPin, Clock, Phone, ChefHat, Utensils, ArrowLeft, Heart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import MapComponent from '@/components/map/MapComponent';
import { MapMarker } from '@/components/map/MapComponent';

// 美食类型接口（与主页面相同）
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
  detailedDescription?: string;
  history?: string;
  nutritionInfo?: string;
  cookingMethod?: string;
  tips?: string[];
  relatedFoods?: string[];
}

// 模拟美食详细数据
const mockFoodDetails: { [key: string]: Food } = {
  '1': {
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
    ingredients: ['新鲜海蛎', '鸡蛋', '地瓜粉', '韭菜'],
    detailedDescription: '时来运转海蛎煎是平潭最具代表性的传统小吃之一，有着悠久的历史传承。这道美食选用平潭海域最新鲜的海蛎，搭配优质鸡蛋和当地特产地瓜粉，经过传统工艺精心制作而成。外皮金黄酥脆，内馅鲜美嫩滑，每一口都能品尝到浓郁的海洋风味。',
    history: '海蛎煎起源于明朝时期，当时平潭渔民为了充分利用海蛎资源，创造了这道美食。经过数百年的传承和改良，形成了今天独特的制作工艺和口味特色。',
    nutritionInfo: '富含蛋白质、维生素B12、锌、铁等营养成分，具有滋阴养血、补肾壮阳的功效。每份约含热量280卡路里。',
    cookingMethod: '1. 将新鲜海蛎洗净沥干；2. 调制地瓜粉浆，加入适量盐和胡椒；3. 热锅下油，倒入粉浆摊成饼状；4. 放入海蛎和韭菜，淋上蛋液；5. 煎至两面金黄即可。',
    tips: ['选择新鲜海蛎是关键', '火候要掌握好，避免煎糊', '趁热食用口感最佳', '可搭配蒜蓉辣椒酱'],
    relatedFoods: ['平潭鱼丸', '海鲜面线']
  },
  '2': {
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
    ingredients: ['新鲜海鱼', '地瓜粉', '盐', '胡椒'],
    detailedDescription: '平潭鱼丸以其独特的制作工艺和鲜美的口感闻名遐迩。选用当日捕获的新鲜海鱼，经过精心去骨、打浆、调味等工序，全程手工制作，确保每颗鱼丸都Q弹爽滑，汤汁清香鲜美。',
    history: '鱼丸制作技艺在平潭已有300多年历史，最初是渔民为了保存鱼肉而发明的方法，后来逐渐发展成为当地特色美食。',
    nutritionInfo: '富含优质蛋白质、不饱和脂肪酸、钙、磷等营养成分，易消化吸收，适合各个年龄段人群食用。',
    cookingMethod: '1. 选用新鲜海鱼，去骨取肉；2. 将鱼肉打成细腻的鱼浆；3. 加入地瓜粉和调料，搅拌均匀；4. 用手挤成丸子状；5. 下锅煮熟，配以清汤即可。',
    tips: ['鱼肉要新鲜，去骨要彻底', '打浆时要有耐心，确保细腻', '煮制时间不宜过长', '汤底可加紫菜提鲜'],
    relatedFoods: ['海蛎煎', '海鲜面线']
  },
  '3': {
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
    ingredients: ['面线', '虾', '蟹肉', '紫菜', '鸡蛋'],
    detailedDescription: '海鲜面线是平潭渔家的传统美食，以其丰富的海鲜配料和浓郁的汤头著称。精选优质面线，搭配新鲜的虾、蟹肉、紫菜等海鲜，配以秘制汤底，营养丰富，口感层次分明。',
    history: '海鲜面线起源于平潭渔民的日常饮食，渔民出海归来后，用当天的海鲜配制面线，既能快速补充体力，又能享受美味。',
    nutritionInfo: '含有丰富的蛋白质、碳水化合物、维生素和矿物质，具有滋补强身、增强免疫力的功效。',
    cookingMethod: '1. 准备新鲜海鲜和面线；2. 制作海鲜高汤；3. 煮制面线至软硬适中；4. 加入海鲜配料；5. 调味装盘，撒上紫菜和葱花。',
    tips: ['面线不宜煮得过软', '海鲜要新鲜，不宜久煮', '汤底是关键，要用心熬制', '可根据个人喜好调整海鲜种类'],
    relatedFoods: ['平潭鱼丸', '紫菜包饭']
  }
};

export default function FoodDetailPage() {
  const params = useParams();
  const foodId = params.id as string;
  const [food, setFood] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // 模拟API调用
    const fetchFoodDetail = async () => {
      setLoading(true);
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foodDetail = mockFoodDetails[foodId];
      setFood(foodDetail || null);
      setLoading(false);
    };

    if (foodId) {
      fetchFoodDetail();
    }
  }, [foodId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food?.name,
        text: food?.description,
        url: window.location.href,
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">正在加载美食详情...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">美食未找到</h2>
          <p className="text-gray-600 mb-6">抱歉，您查找的美食信息不存在</p>
          <Link href="/food">
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">
              返回美食地图
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const mapMarkers: MapMarker[] = [{
    id: food.id,
    position: [food.coordinates.lng, food.coordinates.lat],
    title: food.name,
    content: `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${food.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${food.description}</p>
        <div class="text-sm text-gray-600">
          <strong>地址:</strong> ${food.address}
        </div>
      </div>
    `
  }];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/food" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回美食地图
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 美食头部信息 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96">
                <Image
                  src={food.image}
                  alt={food.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* 评分和特色标签 */}
                <div className="absolute top-6 right-6 flex gap-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-800">{food.rating}</span>
                  </div>
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {food.specialty}
                  </div>
                </div>
                
                {/* 底部信息 */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="text-3xl font-bold text-white mb-2">{food.name}</h1>
                  {food.nameEn && (
                    <p className="text-white/90 text-lg">{food.nameEn}</p>
                  )}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <span className="text-white font-bold text-xl">{food.price}</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                      <span className="text-white">{food.category}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <p className="text-gray-600 text-lg leading-relaxed">{food.description}</p>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`p-3 rounded-full transition-colors ${
                        isFavorite
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 基本信息网格 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">制作时间</div>
                    <div className="font-semibold">{food.cookTime}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Utensils className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">营业时间</div>
                    <div className="font-semibold text-sm">{food.openingHours}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <div className="text-sm text-gray-600">推荐地点</div>
                    <div className="font-semibold text-sm">{food.location}</div>
                  </div>
                  {food.phone && (
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-sm text-gray-600">联系电话</div>
                      <div className="font-semibold text-sm">{food.phone}</div>
                    </div>
                  )}
                </div>

                {/* 主要食材 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">主要食材</h3>
                  <div className="flex flex-wrap gap-3">
                    {food.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-medium"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 详细介绍 */}
            {food.detailedDescription && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">详细介绍</h2>
                <p className="text-gray-600 leading-relaxed">{food.detailedDescription}</p>
              </div>
            )}

            {/* 历史文化 */}
            {food.history && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">历史文化</h2>
                <p className="text-gray-600 leading-relaxed">{food.history}</p>
              </div>
            )}

            {/* 制作方法 */}
            {food.cookingMethod && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">制作方法</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{food.cookingMethod}</p>
              </div>
            )}

            {/* 小贴士 */}
            {food.tips && food.tips.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">小贴士</h2>
                <ul className="space-y-2">
                  {food.tips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-600">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 营养信息 */}
            {food.nutritionInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">营养信息</h2>
                <p className="text-gray-600 leading-relaxed">{food.nutritionInfo}</p>
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 位置地图 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">位置信息</h3>
              </div>
              <div className="h-64">
                <MapComponent
                  config={{
                    center: [food.coordinates.lng, food.coordinates.lat],
                    zoom: 15
                  }}
                  markers={mapMarkers}
                />
              </div>
              <div className="p-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{food.location}</div>
                    <div className="text-sm text-gray-600">{food.address}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 相关美食推荐 */}
            {food.relatedFoods && food.relatedFoods.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">相关美食</h3>
                <div className="space-y-3">
                  {food.relatedFoods.map((relatedFood, index) => (
                    <Link key={index} href={`/food`} className="block">
                      <div className="p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                        <div className="flex items-center">
                          <ChefHat className="w-8 h-8 text-orange-500 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">{relatedFood}</div>
                            <div className="text-sm text-gray-600">点击查看详情</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="space-y-3">
                <Link href="/food" className="block">
                  <button className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    返回美食地图
                  </button>
                </Link>
                <Link href="/restaurants" className="block">
                  <button className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                    查看推荐餐厅
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}