'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Eye, MessageCircle, Share2, Search, Filter, ChevronRight } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';
import Image from 'next/image';
import Link from 'next/link';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  views: number;
  comments: number;
  featured: boolean;
}

interface NewsCategory {
  id: string;
  name: string;
  count: number;
}

// 模拟新闻数据
const mockNews: NewsArticle[] = [
  {
    id: '1',
    title: '平潭国际旅游岛建设取得新进展',
    summary: '平潭综合实验区在推进国际旅游岛建设方面取得重要进展，多个重点项目即将投入使用。',
    content: '近日，平潭综合实验区在推进国际旅游岛建设方面取得重要进展。据了解，包括海峡恋岛、石牌洋景区提升工程等多个重点旅游项目正在加快建设中，预计将在今年内陆续投入使用。这些项目的建设将进一步提升平潭的旅游接待能力和服务水平，为游客提供更加丰富多样的旅游体验。',
    image: '/images/news/news-1.jpg',
    author: '平潭日报',
    publishDate: '2024-01-15',
    category: '旅游发展',
    tags: ['旅游岛', '建设', '发展'],
    views: 1234,
    comments: 56,
    featured: true
  },
  {
    id: '2',
    title: '坛南湾获评国家级海洋公园',
    summary: '坛南湾凭借其优美的自然环境和丰富的海洋生物资源，成功获评国家级海洋公园。',
    content: '坛南湾以其独特的地理位置、优美的自然环境和丰富的海洋生物资源，成功获评国家级海洋公园。这一荣誉的获得，不仅是对坛南湾生态保护工作的肯定，也为平潭旅游业发展注入了新的活力。未来，坛南湾将在保护生态环境的前提下，合理开发旅游资源，为游客提供更加优质的海洋旅游体验。',
    image: '/images/news/news-2.jpg',
    author: '海峡都市报',
    publishDate: '2024-01-12',
    category: '生态保护',
    tags: ['海洋公园', '生态', '保护'],
    views: 987,
    comments: 34,
    featured: true
  },
  {
    id: '3',
    title: '平潭民宿产业蓬勃发展',
    summary: '随着旅游业的快速发展，平潭民宿产业呈现出蓬勃发展的态势，为游客提供了更多住宿选择。',
    content: '近年来，随着平潭旅游业的快速发展，民宿产业也呈现出蓬勃发展的态势。据统计，目前平潭已有各类民宿超过500家，涵盖了海景民宿、乡村民宿、文艺民宿等多种类型。这些民宿不仅为游客提供了更多的住宿选择，也成为了展示平潭本土文化的重要窗口。',
    image: '/images/news/news-3.jpg',
    author: '福建日报',
    publishDate: '2024-01-10',
    category: '住宿服务',
    tags: ['民宿', '住宿', '发展'],
    views: 756,
    comments: 23,
    featured: false
  },
  {
    id: '4',
    title: '石牌洋景区推出夜游项目',
    summary: '为丰富游客的旅游体验，石牌洋景区推出了全新的夜游项目，让游客感受不一样的海岛夜色。',
    content: '为了丰富游客的旅游体验，石牌洋景区近日推出了全新的夜游项目。该项目通过灯光秀、音乐表演等形式，让游客在夜晚也能欣赏到石牌洋的壮美景色。夜游项目的推出，不仅延长了游客的停留时间，也为平潭夜间旅游经济的发展注入了新的活力。',
    image: '/images/news/news-4.jpg',
    author: '平潭时报',
    publishDate: '2024-01-08',
    category: '景区动态',
    tags: ['夜游', '灯光秀', '体验'],
    views: 654,
    comments: 18,
    featured: false
  },
  {
    id: '5',
    title: '平潭美食文化节即将开幕',
    summary: '第五届平潭美食文化节将于本月底开幕，届时将有来自两岸的特色美食汇聚平潭。',
    content: '第五届平潭美食文化节将于本月底在海坛古城开幕。本届美食节以"品味平潭，共享美食"为主题，将有来自两岸的100多种特色美食参展。活动期间，还将举办厨艺比赛、美食品鉴、文化表演等丰富多彩的活动，为游客和市民带来一场味觉与文化的盛宴。',
    image: '/images/news/news-5.jpg',
    author: '平潭网',
    publishDate: '2024-01-05',
    category: '文化活动',
    tags: ['美食节', '文化', '活动'],
    views: 543,
    comments: 12,
    featured: false
  },
  {
    id: '6',
    title: '平潭开通直达台湾客运航线',
    summary: '平潭至台湾的直达客运航线正式开通，为两岸交流合作提供了更加便利的交通条件。',
    content: '平潭至台湾的直达客运航线正式开通，这是两岸交流合作的又一重要里程碑。该航线的开通，不仅为台湾同胞来平潭旅游提供了更加便利的交通条件，也为平潭与台湾在经贸、文化、旅游等领域的合作交流搭建了新的桥梁。',
    image: '/images/news/news-6.jpg',
    author: '中新网',
    publishDate: '2024-01-03',
    category: '交通出行',
    tags: ['航线', '台湾', '交通'],
    views: 432,
    comments: 8,
    featured: false
  }
];

// 模拟新闻分类
const mockCategories: NewsCategory[] = [
  { id: 'all', name: '全部', count: mockNews.length },
  { id: 'tourism', name: '旅游发展', count: 2 },
  { id: 'ecology', name: '生态保护', count: 1 },
  { id: 'accommodation', name: '住宿服务', count: 1 },
  { id: 'attractions', name: '景区动态', count: 1 },
  { id: 'culture', name: '文化活动', count: 1 },
  { id: 'transport', name: '交通出行', count: 1 }
];

export default function NewsPage() {
  const { t } = useLocale();
  const [news, setNews] = useState<NewsArticle[]>(mockNews);
  const [categories, setCategories] = useState<NewsCategory[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'comments'>('date');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  // 过滤和排序新闻
  const filteredAndSortedNews = news
    .filter(article => {
      const matchesCategory = selectedCategory === 'all' || 
        article.category === categories.find(cat => cat.id === selectedCategory)?.name;
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        case 'views':
          return b.views - a.views;
        case 'comments':
          return b.comments - a.comments;
        default:
          return 0;
      }
    });

  // 分页
  const totalPages = Math.ceil(filteredAndSortedNews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = filteredAndSortedNews.slice(startIndex, startIndex + itemsPerPage);
  const featuredNews = news.filter(article => article.featured);

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 处理分类筛选
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('news.title', '新闻资讯')}
            </h1>
            <p className="text-gray-600">
              {t('news.subtitle', '了解平潭最新旅游动态和资讯')}
            </p>
          </div>

          {/* 精选新闻 */}
          {featuredNews.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('news.featured', '精选新闻')}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredNews.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative">
                      <Image
                        src={article.image}
                        alt={article.title}
                        width={600}
                        height={300}
                        className="w-full h-48 object-cover"
                        unoptimized
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {t('news.featured', '精选')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {article.category}
                        </span>
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(article.publishDate)}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{article.comments}</span>
                          </div>
                        </div>
                        
                        <Link
                          href={`/news/${article.id}`}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {t('news.readMore', '阅读更多')}
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 侧边栏 */}
            <div className="lg:col-span-1">
              {/* 搜索框 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('news.search', '搜索新闻')}
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('news.searchPlaceholder', '输入关键词搜索...')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* 分类筛选 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('news.categories', '新闻分类')}
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 排序选项 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t('news.sortBy', '排序方式')}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="date"
                      checked={sortBy === 'date'}
                      onChange={(e) => setSortBy(e.target.value as 'date')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{t('news.sortByDate', '按日期')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="views"
                      checked={sortBy === 'views'}
                      onChange={(e) => setSortBy(e.target.value as 'views')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{t('news.sortByViews', '按浏览量')}</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="sortBy"
                      value="comments"
                      checked={sortBy === 'comments'}
                      onChange={(e) => setSortBy(e.target.value as 'comments')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{t('news.sortByComments', '按评论数')}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 新闻列表 */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCategory === 'all' 
                    ? t('news.allNews', '全部新闻')
                    : categories.find(cat => cat.id === selectedCategory)?.name
                  }
                </h2>
                <p className="text-sm text-gray-500">
                  {t('news.totalResults', '共')} {filteredAndSortedNews.length} {t('news.articles', '篇文章')}
                </p>
              </div>

              {paginatedNews.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('news.noResults', '没有找到相关新闻')}
                  </h3>
                  <p className="text-gray-600">
                    {t('news.tryDifferentKeywords', '请尝试使用不同的关键词或筛选条件')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {paginatedNews.map((article) => (
                      <div key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="relative">
                          <Image
                            src={article.image}
                            alt={article.title}
                            width={400}
                            height={200}
                            className="w-full h-40 object-cover"
                            unoptimized
                          />
                        </div>
                        
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {article.category}
                            </span>
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">{formatDate(article.publishDate)}</span>
                          </div>
                          
                          <h3 className="text-md font-semibold text-gray-900 mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                <span>{article.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                <span>{article.comments}</span>
                              </div>
                            </div>
                            
                            <Link
                              href={`/news/${article.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              {t('news.readMore', '阅读更多')}
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 分页 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        {t('news.previous', '上一页')}
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            currentPage === page
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        {t('news.next', '下一页')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}