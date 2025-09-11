'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Star, Clock, DollarSign } from 'lucide-react';
import { useLocale } from '@/components/providers/LocaleProvider';

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

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

const defaultFilters: SearchFilters = {
  keyword: '',
  location: '',
  category: '',
  priceRange: '',
  rating: 0,
  duration: '',
  tags: [],
  sortBy: 'rating',
  sortOrder: 'desc'
};

const getCategories = (t: (key: string) => string) => [
  { value: '', label: t('search.allTypes') },
  { value: 'beach', label: t('search.beach') },
  { value: 'scenic', label: t('search.scenic') },
  { value: 'cultural', label: t('search.cultural') },
  { value: 'adventure', label: t('search.adventure') },
  { value: 'historical', label: t('search.historical') },
  { value: 'entertainment', label: t('search.entertainment') }
];

const getLocations = (t: (key: string) => string) => [
  { value: '', label: t('search.allAreas') },
  { value: 'tannan', label: t('search.tannanBay') },
  { value: 'suao', label: t('search.suao') },
  { value: 'liushui', label: t('search.liushui') },
  { value: 'tancheng', label: t('search.tancheng') },
  { value: 'pingtan-center', label: t('search.pingtanCenter') }
];

const getPriceRanges = (t: (key: string) => string) => [
  { value: '', label: t('search.noLimit') },
  { value: 'free', label: t('search.free') },
  { value: '0-50', label: t('search.price0to50') },
  { value: '50-100', label: t('search.price50to100') },
  { value: '100-200', label: t('search.price100to200') },
  { value: '200+', label: t('search.price200plus') }
];

const getDurations = (t: (key: string) => string) => [
  { value: '', label: t('search.noDurationLimit') },
  { value: '1-2', label: t('search.duration1to2') },
  { value: '2-4', label: t('search.duration2to4') },
  { value: 'half-day', label: t('search.halfDay') },
  { value: 'full-day', label: t('search.fullDay') },
  { value: 'multi-day', label: t('search.multiDay') }
];

const getPopularTags = (t: (key: string) => string) => [
  t('search.tag.beach'), t('search.tag.swimming'), t('search.tag.sunrise'), t('search.tag.sunset'), t('search.tag.photography'), t('search.tag.geological'),
  t('search.tag.ancientVillage'), t('search.tag.artistic'), t('search.tag.homestay'), t('search.tag.uninhabitedIsland'), t('search.tag.adventure'), t('search.tag.diving'),
  t('search.tag.ancientArchitecture'), t('search.tag.shopping'), t('search.tag.food'), t('search.tag.waterSports'), t('search.tag.sightseeing')
];

const getSortOptions = (t: (key: string) => string) => [
  { value: 'rating', label: t('search.sortByRating') },
  { value: 'reviewCount', label: t('search.sortByReviews') },
  { value: 'name', label: t('search.sortByName') },
  { value: 'distance', label: t('search.sortByDistance') }
];

export default function AdvancedSearch({
  onSearch,
  onReset,
  initialFilters = {},
  className = ''
}: AdvancedSearchProps) {
  const { t } = useLocale();
  
  // 获取本地化的选项数据
  const categories = getCategories(t);
  const locations = getLocations(t);
  const priceRanges = getPriceRanges(t);
  const durations = getDurations(t);
  const popularTags = getPopularTags(t);
  const sortOptions = getSortOptions(t);
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // 检查是否有活跃的筛选条件
  useEffect(() => {
    const isActive = filters.keyword !== '' ||
                    filters.location !== '' ||
                    filters.category !== '' ||
                    filters.priceRange !== '' ||
                    filters.rating > 0 ||
                    filters.duration !== '' ||
                    filters.tags.length > 0;
    setHasActiveFilters(isActive);
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setHasActiveFilters(false);
    onReset();
  };

  const handleKeywordSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* 主搜索栏 */}
      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleKeywordSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('search.placeholder', '搜索景点名称、描述或位置...')}
              value={filters.keyword}
              onChange={(e) => updateFilter('keyword', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
            {t('search.advancedFilters', '高级筛选')}
            {hasActiveFilters && (
              <span className="bg-white bg-opacity-20 text-xs px-1.5 py-0.5 rounded-full">
                {Object.values(filters).filter(v => 
                  Array.isArray(v) ? v.length > 0 : v !== '' && v !== 0
                ).length}
              </span>
            )}
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('search.search', '搜索')}
          </button>
        </form>
      </div>

      {/* 高级筛选面板 */}
      {showAdvanced && (
        <div className="p-4 space-y-6">
          {/* 第一行：位置和类型 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {t('search.location', '位置区域')}
              </label>
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {locations.map(location => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search.category', '景点类型')}
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 第二行：价格和时长 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                {t('search.priceRange', '价格范围')}
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {t('search.duration', '游览时长')}
              </label>
              <select
                value={filters.duration}
                onChange={(e) => updateFilter('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {durations.map(duration => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 评分筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              {t('search.minRating', '最低评分')}
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                    filters.rating >= rating
                      ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Star className={`w-4 h-4 ${
                    filters.rating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                  }`} />
                  <span className="text-sm">{rating}+</span>
                </button>
              ))}
            </div>
          </div>

          {/* 标签筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.tags', '特色标签')}
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 排序选项 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('search.sortBy', '排序方式')}
            </label>
            <div className="flex gap-3">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.sortOrder}
                onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desc">{t('search.descending', '降序')}</option>
                <option value="asc">{t('search.ascending', '升序')}</option>
              </select>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {hasActiveFilters && (
                <span>
                  {t('search.activeFilters', '已应用')} {Object.values(filters).filter(v => 
                    Array.isArray(v) ? v.length > 0 : v !== '' && v !== 0
                  ).length} {t('search.filters', '个筛选条件')}
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {hasActiveFilters && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  {t('search.reset', '重置')}
                </button>
              )}
              
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('search.collapse', '收起')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 活跃筛选条件显示 */}
      {hasActiveFilters && !showAdvanced && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">{t('search.activeFilters', '筛选条件')}:</span>
            
            {filters.location && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {locations.find(l => l.value === filters.location)?.label}
                <button onClick={() => updateFilter('location', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {categories.find(c => c.value === filters.category)?.label}
                <button onClick={() => updateFilter('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.priceRange && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {priceRanges.find(p => p.value === filters.priceRange)?.label}
                <button onClick={() => updateFilter('priceRange', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.rating > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {filters.rating}{t('search.starsAndAbove', '星以上')}
                <button onClick={() => updateFilter('rating', 0)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tag}
                <button onClick={() => toggleTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {t('search.clearAll', '清除全部')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}