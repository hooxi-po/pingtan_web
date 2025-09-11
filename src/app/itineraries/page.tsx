'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Star, Heart, Share2, Filter, Search, Plus } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  tags: string[];
  days: number;
  budget: number;
  creator: {
    id: string;
    name: string;
    image: string;
  };
  dayGroups: { [key: number]: any[] };
  attractionCount: number;
  createdAt: string;
}

export default function ItinerariesPage() {
  const { t } = useLocale();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDays, setSelectedDays] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取行程列表
  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (selectedDays) params.append('days', selectedDays);
      if (selectedBudget) params.append('budget', selectedBudget);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      
      const response = await fetch(`/api/itineraries?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setItineraries(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取行程列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
  }, [currentPage, selectedDays, selectedBudget, selectedTags]);

  // 筛选行程
  const filteredItineraries = itineraries.filter(itinerary => {
    if (searchTerm) {
      return itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             itinerary.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // 常用标签
  const popularTags = ['海滩', '文化', '美食', '摄影', '亲子', '情侣', '冒险', '放松'];

  // 预算选项
  const budgetOptions = [
    { value: '500', label: '500元以下' },
    { value: '1000', label: '1000元以下' },
    { value: '2000', label: '2000元以下' },
    { value: '5000', label: '5000元以下' }
  ];

  // 天数选项
  const dayOptions = [
    { value: '1', label: '1天' },
    { value: '2', label: '2天' },
    { value: '3', label: '3天' },
    { value: '5', label: '5天' },
    { value: '7', label: '7天' }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('itineraries.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('itineraries.subtitle')}
            </p>
          </div>

          {/* 搜索和筛选 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            {/* 搜索框 */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('itineraries.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 筛选选项 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* 天数筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('itineraries.days', '天数')}
                </label>
                <select
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('itineraries.allDays', '所有天数')}</option>
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 预算筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('itineraries.budget', '预算')}
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">{t('itineraries.allBudgets', '所有预算')}</option>
                  {budgetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 创建行程按钮 */}
              <div className="flex items-end">
                <Link href="/itinerary">
                  <Button className="w-full flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    {t('itineraries.create', '创建行程')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* 标签筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('itineraries.tags', '标签')}
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(prev => prev.filter(t => t !== tag));
                      } else {
                        setSelectedTags(prev => [...prev, tag]);
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 行程列表 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredItineraries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItineraries.map((itinerary) => (
                    <div key={itinerary.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* 行程封面 */}
                      <div className="relative h-48">
                        {itinerary.dayGroups[1] && itinerary.dayGroups[1][0]?.attraction?.images?.[0] ? (
                          <Image
                            src={itinerary.dayGroups[1][0].attraction.images[0]}
                            alt={itinerary.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <div className="absolute top-4 right-4">
                          <button className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                            <Heart className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            {itinerary.days} {t('itineraries.days', '天')}
                          </span>
                        </div>
                      </div>

                      {/* 行程信息 */}
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                          {itinerary.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {itinerary.description}
                        </p>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {itinerary.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {itinerary.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{itinerary.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* 行程统计 */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{itinerary.attractionCount} 个景点</span>
                          </div>
                          {itinerary.budget && (
                            <div className="flex items-center gap-1">
                              <span>¥{itinerary.budget}</span>
                            </div>
                          )}
                        </div>

                        {/* 创建者信息 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {itinerary.creator?.image ? (
                              <Image
                                src={itinerary.creator.image}
                                alt={itinerary.creator.name}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="w-3 h-3 text-gray-600" />
                              </div>
                            )}
                            <span className="text-sm text-gray-600">
                              {itinerary.creator?.name || '匿名用户'}
                            </span>
                          </div>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <Share2 className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>

                        {/* 查看详情按钮 */}
                        <div className="mt-4">
                          <Link href={`/itineraries/${itinerary.id}`}>
                            <Button className="w-full">
                              {t('itineraries.viewDetails', '查看详情')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('itineraries.noResults', '没有找到相关行程')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('itineraries.noResultsDesc', '尝试调整搜索条件或创建新的行程')}
                  </p>
                  <Link href="/itinerary">
                    <Button className="inline-flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {t('itineraries.create', '创建行程')}
                    </Button>
                  </Link>
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      上一页
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (page === currentPage || 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 border rounded-lg ${
                              page === currentPage
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}