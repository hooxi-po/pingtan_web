'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Clock, MapPin, Share2, Heart, Camera, Navigation } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';
import MapComponent from '@/components/map/MapComponent';

interface Attraction {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  image: string;
  gallery: string[];
  rating: number;
  reviewCount: number;
  location: string;
  address: string;
  tags: string[];
  estimatedTime: string;
  price?: string;
  openingHours: string;
  bestVisitTime: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  facilities: string[];
  tips: string[];
}

interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
}

const mockAttractions: { [key: string]: Attraction } = {
  '1': {
    id: '1',
    name: '坛南湾',
    description: '平潭最美的海湾之一，拥有细腻的沙滩和清澈的海水',
    detailedDescription: '坛南湾位于平潭岛南部，是平潭最著名的海滩之一。这里拥有长达3公里的金色沙滩，沙质细腻，海水清澈见底。湾内风浪较小，非常适合游泳和各种水上运动。每年夏季，这里都会举办各种海滩音乐节和文化活动，是年轻人的聚集地。',
    image: '/images/attractions/tannan-bay.jpg',
    gallery: [
      '/images/attractions/tannan-bay.jpg',
      '/images/attractions/tannan-bay-2.jpg',
      '/images/attractions/tannan-bay-3.jpg'
    ],
    rating: 4.8,
    reviewCount: 1234,
    location: '平潭县坛南湾',
    address: '福建省平潭综合实验区坛南湾旅游度假区',
    tags: ['海滩', '游泳', '日出', '摄影'],
    estimatedTime: '3-4小时',
    price: '免费',
    openingHours: '全天开放',
    bestVisitTime: '4月-10月',
    coordinates: { lat: 25.4444, lng: 119.7906 },
    facilities: ['停车场', '洗手间', '淋浴间', '餐厅', '商店'],
    tips: [
      '建议早上6点前到达观看日出',
      '夏季紫外线强烈，请做好防晒',
      '海边风大，注意保暖',
      '退潮时可以在沙滩上捡贝壳'
    ]
  },
  '2': {
    id: '2',
    name: '石牌洋',
    description: '平潭标志性景观，两座巨大的海蚀柱屹立在海中',
    detailedDescription: '石牌洋是平潭最著名的地标景观，由两座高约30米的海蚀柱组成，矗立在海中央，形似一对夫妻相依而立，因此也被称为"夫妻岩"。这里是观赏日落的绝佳地点，每当夕阳西下，金色的阳光洒在石柱上，景色壮观迷人。',
    image: '/images/attractions/shipaiyang.jpg',
    gallery: [
      '/images/attractions/shipaiyang.jpg',
      '/images/attractions/shipaiyang-2.jpg',
      '/images/attractions/shipaiyang-3.jpg'
    ],
    rating: 4.9,
    reviewCount: 2156,
    location: '平潭县苏澳镇',
    address: '福建省平潭综合实验区苏澳镇石牌洋景区',
    tags: ['地质奇观', '摄影', '日落', '观景'],
    estimatedTime: '2-3小时',
    price: '¥30',
    openingHours: '8:00-18:00',
    bestVisitTime: '全年适宜，日落时分最佳',
    coordinates: { lat: 25.5167, lng: 119.8333 },
    facilities: ['观景台', '停车场', '洗手间', '小卖部'],
    tips: [
      '日落时分景色最美，建议17:30前到达',
      '观景台风大，注意安全',
      '带好相机，这里是摄影圣地',
      '可以沿着栈道走到海边近距离观赏'
    ]
  }
};

const mockReviews: Review[] = [
  {
    id: '1',
    userName: '旅行达人小王',
    avatar: '/images/avatars/user1.jpg',
    rating: 5,
    comment: '真的太美了！日出时分的坛南湾简直就是人间仙境，沙滩很干净，海水也很清澈。强烈推荐！',
    date: '2024-01-15',
    images: ['/images/reviews/review1-1.jpg', '/images/reviews/review1-2.jpg']
  },
  {
    id: '2',
    userName: '摄影爱好者',
    avatar: '/images/avatars/user2.jpg',
    rating: 5,
    comment: '摄影师的天堂！这里的光线和构图都非常棒，拍出来的照片不用修图就很美。',
    date: '2024-01-10'
  },
  {
    id: '3',
    userName: '家庭游客',
    avatar: '/images/avatars/user3.jpg',
    rating: 4,
    comment: '带着孩子来的，孩子们玩得很开心。沙滩很适合小朋友玩沙子，就是人有点多。',
    date: '2024-01-08'
  }
];

export default function AttractionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLocale();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const attractionData = mockAttractions[id];
    if (attractionData) {
      setAttraction(attractionData);
    }
  }, [params.id]);

  if (!attraction) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('attraction.notFound', '景点未找到')}
            </h2>
            <Link
              href="/attractions"
              className="text-blue-500 hover:text-blue-600"
            >
              {t('attraction.backToList', '返回景点列表')}
            </Link>
          </div>
        </div>
      </>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: attraction.name,
          text: attraction.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* 返回按钮 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('common.back', '返回')}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 主要内容 */}
            <div className="lg:col-span-2">
              {/* 图片画廊 */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
                <div className="relative h-96">
                  <Image
                    src={attraction.gallery[selectedImageIndex]}
                    alt={attraction.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`p-2 rounded-full ${isFavorited ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:scale-105 transition-transform`}
                    >
                      <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 bg-white text-gray-600 rounded-full hover:scale-105 transition-transform"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {attraction.gallery.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {attraction.gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                            selectedImageIndex === index ? 'ring-2 ring-blue-500' : ''
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${attraction.name} ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {attraction.name}
                </h1>
                
                <div className="flex items-center gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-lg">{attraction.rating}</span>
                    <span className="text-gray-500">({attraction.reviewCount} 条评论)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span>{attraction.estimatedTime}</span>
                  </div>
                  
                  {attraction.price && (
                    <div className="text-lg font-semibold text-green-600">
                      {attraction.price}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span>{attraction.address}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {attraction.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  {attraction.detailedDescription}
                </p>
              </div>

              {/* 实用信息 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('attraction.practicalInfo', '实用信息')}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t('attraction.openingHours', '开放时间')}
                    </h3>
                    <p className="text-gray-600">{attraction.openingHours}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t('attraction.bestVisitTime', '最佳游览时间')}
                    </h3>
                    <p className="text-gray-600">{attraction.bestVisitTime}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t('attraction.facilities', '设施服务')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attraction.facilities.map(facility => (
                        <span
                          key={facility}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {t('attraction.tips', '游览贴士')}
                    </h3>
                    <ul className="text-gray-600 text-sm space-y-1">
                      {attraction.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 用户评论 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('attraction.reviews', '用户评论')} ({reviews.length})
                </h2>
                
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {review.userName.charAt(0)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">{review.userName}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{review.comment}</p>
                          
                          {review.images && review.images.length > 0 && (
                            <div className="flex gap-2">
                              {review.images.map((image, index) => (
                                <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={image}
                                    alt={`评论图片 ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="lg:col-span-1">
              {/* 地图卡片 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('attraction.location', '位置信息')}
                </h3>
                
                <div className="mb-4">
                  <MapComponent
                    center={[attraction.coordinates.lng, attraction.coordinates.lat]}
                    zoom={15}
                    markers={[{
                      id: attraction.id,
                      position: [attraction.coordinates.lng, attraction.coordinates.lat],
                      title: attraction.name,
                      content: `${attraction.description}<br/>评分: ${attraction.rating} ⭐<br/>价格: ${attraction.price || '免费'}`
                    }]}
                    height="200px"
                  />
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{attraction.address}</p>
                
                <button
                  onClick={() => {
                    const { lng, lat } = attraction.coordinates;
                    window.open(`https://uri.amap.com/navigation?to=${lng},${lat}&mode=car&policy=1&src=myapp&coordinate=gaode`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {t('attraction.getDirections', '获取路线')}
                </button>
              </div>

              {/* 相关推荐 - 景点 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('attraction.relatedAttractions', '相关景点')}
                </h3>
                
                <div className="space-y-3">
                  {Object.values(mockAttractions)
                    .filter(a => a.id !== attraction.id)
                    .slice(0, 2)
                    .map(relatedAttraction => (
                      <Link
                        key={relatedAttraction.id}
                        href={`/attractions/${relatedAttraction.id}`}
                        className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={relatedAttraction.image}
                            alt={relatedAttraction.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {relatedAttraction.name}
                          </h4>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">
                              {relatedAttraction.rating}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  }
                </div>
              </div>

              {/* 附近民宿推荐 */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('attraction.nearbyAccommodations', '附近民宿')}
                </h3>
                
                <div className="space-y-3">
                  <Link
                    href="/accommodations"
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-medium">海景</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {t('accommodations.oceanView', '海景度假民宿')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('accommodations.oceanViewDesc', '面朝大海，春暖花开')}
                      </p>
                      <span className="text-xs text-blue-600 font-medium">¥200-400/晚</span>
                    </div>
                  </Link>
                  
                  <Link
                    href="/accommodations"
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-xs font-medium">石厝</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {t('accommodations.stoneHouse', '石头厝特色民宿')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('accommodations.stoneHouseDesc', '体验传统建筑文化')}
                      </p>
                      <span className="text-xs text-blue-600 font-medium">¥150-300/晚</span>
                    </div>
                  </Link>
                </div>
                
                <Link
                  href="/accommodations"
                  className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('common.viewMore', '查看更多民宿')}
                </Link>
              </div>

              {/* 附近美食推荐 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('attraction.nearbyRestaurants', '附近美食')}
                </h3>
                
                <div className="space-y-3">
                  <Link
                    href="/restaurants"
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 text-xs font-medium">海鲜</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {t('restaurants.seafood', '时来运转海鲜店')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('restaurants.seafoodDesc', '招牌海蛎煎，新鲜美味')}
                      </p>
                      <span className="text-xs text-orange-600 font-medium">
                        {t('restaurants.specialty', '特色：海蛎煎')}
                      </span>
                    </div>
                  </Link>
                  
                  <Link
                    href="/restaurants"
                    className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-red-100 flex items-center justify-center">
                      <span className="text-red-600 text-xs font-medium">小吃</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {t('restaurants.fishBall', '鱼丸世家')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('restaurants.fishBallDesc', '手工制作，Q弹爽滑')}
                      </p>
                      <span className="text-xs text-red-600 font-medium">
                        {t('restaurants.specialty', '特色：鱼丸汤')}
                      </span>
                    </div>
                  </Link>
                </div>
                
                <Link
                  href="/restaurants"
                  className="block mt-3 text-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('common.viewMore', '查看更多美食')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}