'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Star, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

import Image from 'next/image';
import Link from 'next/link';
import MapComponent from '@/components/map/MapComponent';
import { useRouteMap } from '@/hooks/useMap';

interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  duration: string;
  price: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
  tags: string[];
}

interface ItineraryItem {
  id: string;
  attraction: Attraction;
  startTime: string;
  endTime: string;
  notes: string;
  day: number;
}

interface Itinerary {
  id: string;
  name: string;
  description: string;
  days: number;
  totalBudget: number;
  groupSize: number;
  items: ItineraryItem[];
  createdAt: string;
  isPublic: boolean;
}

// 模拟景点数据
const mockAttractions: Attraction[] = [
  {
    id: '1',
    name: '坛南湾',
    description: '被誉为"福建的马尔代夫"，拥有细腻的白沙滩和清澈的海水',
    image: '/images/attractions/tannan-bay.jpg',
    rating: 4.8,
    reviewCount: 1234,
    duration: '3-4小时',
    price: '免费',
    coordinates: { lat: 25.4315, lng: 119.7909 },
    address: '福建省平潭县坛南湾',
    tags: ['海滩', '摄影', '日出']
  },
  {
    id: '2',
    name: '石牌洋',
    description: '平潭最著名的地标，两座巨大的海蚀柱屹立在海中',
    image: '/images/attractions/shipaiyang.jpg',
    rating: 4.7,
    reviewCount: 987,
    duration: '2-3小时',
    price: '免费',
    coordinates: { lat: 25.5012, lng: 119.6891 },
    address: '福建省平潭县看澳村',
    tags: ['地标', '摄影', '日落']
  },
  {
    id: '3',
    name: '龙凤头海滨浴场',
    description: '平潭最大的天然海滨浴场，是游泳和水上运动的理想场所',
    image: '/images/attractions/longfengtou.jpg',
    rating: 4.5,
    reviewCount: 756,
    duration: '半天',
    price: '免费',
    coordinates: { lat: 25.5234, lng: 119.7123 },
    address: '福建省平潭县龙凤头',
    tags: ['海滩', '游泳', '水上运动']
  },
  {
    id: '4',
    name: '北港村',
    description: '保存完好的石头厝古村落，体验传统闽南建筑文化',
    image: '/images/attractions/beigang.jpg',
    rating: 4.6,
    reviewCount: 543,
    duration: '2-3小时',
    price: '免费',
    coordinates: { lat: 25.4567, lng: 119.7234 },
    address: '福建省平潭县流水镇北港村',
    tags: ['古村', '文化', '建筑']
  },
  {
    id: '5',
    name: '猴研岛',
    description: '神秘的无人岛屿，拥有独特的海蚀地貌和丰富的海洋生物',
    image: '/images/attractions/houyan.jpg',
    rating: 4.4,
    reviewCount: 321,
    duration: '半天',
    price: '船票100元',
    coordinates: { lat: 25.3891, lng: 119.8123 },
    address: '福建省平潭县猴研岛',
    tags: ['岛屿', '探险', '海洋']
  },
  {
    id: '6',
    name: '海坛古城',
    description: '仿古建筑群，集文化、商业、娱乐于一体的旅游综合体',
    image: '/images/attractions/ancient-city.jpg',
    rating: 4.3,
    reviewCount: 654,
    duration: '3-4小时',
    price: '免费',
    coordinates: { lat: 25.5123, lng: 119.7456 },
    address: '福建省平潭县海坛古城',
    tags: ['古城', '购物', '美食']
  }
];

// 模拟行程数据
const mockItineraries: Itinerary[] = [
  {
    id: '1',
    name: '平潭经典三日游',
    description: '涵盖平潭最著名景点的经典路线，适合首次来访的游客',
    days: 3,
    totalBudget: 800,
    groupSize: 2,
    items: [
      {
        id: '1-1',
        attraction: mockAttractions[0],
        startTime: '09:00',
        endTime: '12:00',
        notes: '建议早上前往，避开人群',
        day: 1
      },
      {
        id: '1-2',
        attraction: mockAttractions[1],
        startTime: '14:00',
        endTime: '17:00',
        notes: '下午光线最佳，适合摄影',
        day: 1
      }
    ],
    createdAt: '2024-01-15',
    isPublic: true
  }
];

export default function ItineraryPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<'my' | 'recommended' | 'create'>('recommended');
  const [itineraries, setItineraries] = useState<Itinerary[]>(mockItineraries);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  
  // 创建行程表单状态
  const [newItinerary, setNewItinerary] = useState({
    name: '',
    description: '',
    days: 1,
    groupSize: 2,
    budget: 500
  });
  
  const [selectedAttractions, setSelectedAttractions] = useState<Attraction[]>([]);
  const [showAttractionSelector, setShowAttractionSelector] = useState(false);

  // 智能推荐行程
  const generateRecommendedItinerary = (days: number, budget: number, interests: string[]) => {
    // 简单的推荐算法
    const filteredAttractions = mockAttractions.filter(attraction => 
      interests.some(interest => 
        attraction.tags.some(tag => tag.includes(interest))
      )
    );
    
    return filteredAttractions.slice(0, days * 2); // 每天推荐2个景点
  };

  // 添加景点到行程
  const addAttractionToItinerary = (attraction: Attraction, day: number) => {
    if (!selectedItinerary) return;
    
    const newItem: ItineraryItem = {
      id: `${selectedItinerary.id}-${Date.now()}`,
      attraction,
      startTime: '09:00',
      endTime: '12:00',
      notes: '',
      day
    };
    
    const updatedItinerary = {
      ...selectedItinerary,
      items: [...selectedItinerary.items, newItem]
    };
    
    setSelectedItinerary(updatedItinerary);
    setItineraries(prev => 
      prev.map(it => it.id === selectedItinerary.id ? updatedItinerary : it)
    );
  };

  // 删除行程项目
  const removeItineraryItem = (itemId: string) => {
    if (!selectedItinerary) return;
    
    const updatedItinerary = {
      ...selectedItinerary,
      items: selectedItinerary.items.filter(item => item.id !== itemId)
    };
    
    setSelectedItinerary(updatedItinerary);
    setItineraries(prev => 
      prev.map(it => it.id === selectedItinerary.id ? updatedItinerary : it)
    );
  };

  // 更新行程项目
  const updateItineraryItem = (itemId: string, updates: Partial<ItineraryItem>) => {
    if (!selectedItinerary) return;
    
    const updatedItinerary = {
      ...selectedItinerary,
      items: selectedItinerary.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    };
    
    setSelectedItinerary(updatedItinerary);
    setItineraries(prev => 
      prev.map(it => it.id === selectedItinerary.id ? updatedItinerary : it)
    );
  };

  // 创建新行程
  const createItinerary = () => {
    const itinerary: Itinerary = {
      id: Date.now().toString(),
      name: newItinerary.name,
      description: newItinerary.description,
      days: newItinerary.days,
      totalBudget: newItinerary.budget,
      groupSize: newItinerary.groupSize,
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
      isPublic: false
    };
    
    setItineraries(prev => [...prev, itinerary]);
    setSelectedItinerary(itinerary);
    setIsCreating(false);
    setActiveTab('my');
  };

  // 按天分组行程项目
  const groupItemsByDay = (items: ItineraryItem[]) => {
    const grouped: { [key: number]: ItineraryItem[] } = {};
    items.forEach(item => {
      if (!grouped[item.day]) {
        grouped[item.day] = [];
      }
      grouped[item.day].push(item);
    });
    return grouped;
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('itinerary.title', '行程规划')}
            </h1>
            <p className="text-gray-600">
              {t('itinerary.subtitle', '智能规划您的平潭之旅，发现最佳旅行路线')}
            </p>
          </div>

          {/* 标签页导航 */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'recommended'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('itinerary.recommended', '推荐行程')}
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'my'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('itinerary.my', '我的行程')}
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'create'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('itinerary.create', '创建行程')}
                </button>
              </nav>
            </div>
          </div>

          {/* 推荐行程 */}
          {activeTab === 'recommended' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {itineraries.filter(it => it.isPublic).map((itinerary) => (
                <div key={itinerary.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {itinerary.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {itinerary.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{itinerary.days} {t('itinerary.days', '天')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{itinerary.groupSize} {t('itinerary.people', '人')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>¥{itinerary.totalBudget}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItinerary(itinerary)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        {t('itinerary.viewDetails', '查看详情')}
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        {t('itinerary.copy', '复制行程')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 我的行程 */}
          {activeTab === 'my' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {itineraries.filter(it => !it.isPublic).map((itinerary) => (
                <div key={itinerary.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {itinerary.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {itinerary.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{itinerary.days} {t('itinerary.days', '天')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{itinerary.groupSize} {t('itinerary.people', '人')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItinerary(itinerary)}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        {t('itinerary.edit', '编辑行程')}
                      </button>
                      <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm">
                        {t('itinerary.delete', '删除')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {itineraries.filter(it => !it.isPublic).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('itinerary.noItineraries', '暂无行程')}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('itinerary.createFirst', '创建您的第一个行程计划')}
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t('itinerary.createNow', '立即创建')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 创建行程 */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {t('itinerary.createNew', '创建新行程')}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('itinerary.name', '行程名称')}
                    </label>
                    <input
                      type="text"
                      value={newItinerary.name}
                      onChange={(e) => setNewItinerary(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('itinerary.namePlaceholder', '输入行程名称')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('itinerary.description', '行程描述')}
                    </label>
                    <textarea
                      value={newItinerary.description}
                      onChange={(e) => setNewItinerary(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('itinerary.descriptionPlaceholder', '描述您的行程计划')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('itinerary.days', '天数')}
                      </label>
                      <select
                        value={newItinerary.days}
                        onChange={(e) => setNewItinerary(prev => ({ ...prev, days: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                          <option key={day} value={day}>{day}{t('itinerary.days')}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('itinerary.groupSize', '人数')}
                      </label>
                      <select
                        value={newItinerary.groupSize}
                        onChange={(e) => setNewItinerary(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map(size => (
                          <option key={size} value={size}>{size} {t('itinerary.people', '人')}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('itinerary.budget', '预算')}
                      </label>
                      <input
                        type="number"
                        value={newItinerary.budget}
                        onChange={(e) => setNewItinerary(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={createItinerary}
                      disabled={!newItinerary.name.trim()}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('itinerary.create', '创建行程')}
                    </button>
                    <button
                      onClick={() => setNewItinerary({ name: '', description: '', days: 1, groupSize: 2, budget: 500 })}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {t('itinerary.reset', '重置')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 行程详情模态框 */}
          {selectedItinerary && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedItinerary.name}
                    </h2>
                    <button
                      onClick={() => setSelectedItinerary(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">{selectedItinerary.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 行程列表 */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {t('itinerary.schedule', '行程安排')}
                        </h3>
                        <button
                          onClick={() => setShowAttractionSelector(true)}
                          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          {t('itinerary.addAttraction', '添加景点')}
                        </button>
                      </div>
                      
                      {Array.from({ length: selectedItinerary.days }, (_, i) => i + 1).map(day => {
                        const dayItems = selectedItinerary.items.filter(item => item.day === day);
                        return (
                          <div key={day} className="mb-6">
                            <h4 className="text-md font-medium text-gray-900 mb-3">
                              {t('itinerary.day', '第')} {day} {t('itinerary.days', '天')}
                            </h4>
                            
                            {dayItems.length === 0 ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
                                <p className="text-sm">{t('itinerary.noPlan', '暂无安排')}</p>
                                <button
                                  onClick={() => setShowAttractionSelector(true)}
                                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
                                >
                                  {t('itinerary.addFirst', '添加第一个景点')}
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {dayItems.map((item) => (
                                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                          <Image
                                            src={item.attraction.image}
                                            alt={item.attraction.name}
                                            width={48}
                                            height={48}
                                            className="rounded-lg object-cover"
                                            unoptimized
                                          />
                                          <div>
                                            <h5 className="font-medium text-gray-900">
                                              {item.attraction.name}
                                            </h5>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                              <Clock className="w-4 h-4" />
                                              {editingItem === item.id ? (
                                                <div className="flex items-center gap-2">
                                                  <input
                                                    type="time"
                                                    value={item.startTime}
                                                    onChange={(e) => updateItineraryItem(item.id, { startTime: e.target.value })}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                                                  />
                                                  <span>-</span>
                                                  <input
                                                    type="time"
                                                    value={item.endTime}
                                                    onChange={(e) => updateItineraryItem(item.id, { endTime: e.target.value })}
                                                    className="px-2 py-1 border border-gray-300 rounded text-xs"
                                                  />
                                                </div>
                                              ) : (
                                                <span>{item.startTime} - {item.endTime}</span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {editingItem === item.id ? (
                                          <textarea
                                            value={item.notes}
                                            onChange={(e) => updateItineraryItem(item.id, { notes: e.target.value })}
                                            placeholder={t('itinerary.notesPlaceholder', '添加备注...')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            rows={2}
                                          />
                                        ) : (
                                          item.notes && (
                                            <p className="text-sm text-gray-600 mt-2">{item.notes}</p>
                                          )
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 ml-4">
                                        {editingItem === item.id ? (
                                          <button
                                            onClick={() => setEditingItem(null)}
                                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                                          >
                                            <Save className="w-4 h-4" />
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => setEditingItem(item.id)}
                                            className="p-1 text-gray-600 hover:bg-gray-200 rounded"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => removeItineraryItem(item.id)}
                                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* 地图 */}
                    <div className="lg:col-span-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {t('itinerary.map', '路线地图')}
                      </h3>
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <MapComponent
                          center={[119.7234, 25.4567]}
                          zoom={5}
                          markers={selectedItinerary.items.map(item => ({
                            id: item.id,
                            position: [item.attraction.coordinates.lng, item.attraction.coordinates.lat],
                            title: item.attraction.name,
                            content: `${item.attraction.name}<br/>${item.startTime} - ${item.endTime}`
                          }))}
                          height="400px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 景点选择器 */}
          {showAttractionSelector && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('itinerary.selectAttraction', '选择景点')}
                    </h3>
                    <button
                      onClick={() => setShowAttractionSelector(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {mockAttractions.map((attraction) => (
                      <div key={attraction.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start gap-4">
                          <Image
                            src={attraction.image}
                            alt={attraction.name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {attraction.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {attraction.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span>{attraction.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{attraction.duration}</span>
                              </div>
                              <span>{attraction.price}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {Array.from({ length: selectedItinerary?.days || 1 }, (_, i) => i + 1).map(day => (
                              <button
                                key={day}
                                onClick={() => {
                                  addAttractionToItinerary(attraction, day);
                                  setShowAttractionSelector(false);
                                }}
                                className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                {t('itinerary.addToDay', '添加到第')} {day} {t('itinerary.days', '天')}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}