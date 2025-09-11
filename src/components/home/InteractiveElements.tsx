'use client'

import { useState } from 'react'
import { TrendingUp, Heart, Share2, Eye, Hash } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content: string
  time: string
  views: number
  likes: number
  comments: number
  type: 'news' | 'event' | 'weather' | 'traffic'
}

interface HotTopic {
  id: string
  name: string
  count: number
  trend: 'up' | 'down' | 'stable'
  color: string
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: '坛南湾今日海况良好',
    content: '今日风力2-3级，海浪平缓，非常适合海边游玩和拍照。建议游客上午10点后前往，光线最佳。',
    time: '2小时前',
    views: 1234,
    likes: 89,
    comments: 23,
    type: 'weather'
  },
  {
    id: '2',
    title: '海坛古城夜市开放',
    content: '海坛古城夜市今晚正常开放，特色小吃、手工艺品应有尽有。推荐尝试当地特色海蛎煎。',
    time: '4小时前',
    views: 2156,
    likes: 156,
    comments: 45,
    type: 'event'
  },
  {
    id: '3',
    title: '平潭大桥交通顺畅',
    content: '目前平潭大桥双向交通正常，无拥堵情况。预计晚高峰时段车流量会有所增加。',
    time: '6小时前',
    views: 987,
    likes: 34,
    comments: 12,
    type: 'traffic'
  }
]

const mockTopics: HotTopic[] = [
  { id: '1', name: '坛南湾日出', count: 2341, trend: 'up', color: 'bg-orange-500' },
  { id: '2', name: '海坛古城', count: 1876, trend: 'up', color: 'bg-blue-500' },
  { id: '3', name: '平潭美食', count: 1654, trend: 'stable', color: 'bg-green-500' },
  { id: '4', name: '石头厝', count: 1432, trend: 'up', color: 'bg-purple-500' },
  { id: '5', name: '海岛风光', count: 1298, trend: 'down', color: 'bg-pink-500' },
  { id: '6', name: '民宿推荐', count: 1156, trend: 'stable', color: 'bg-indigo-500' },
  { id: '7', name: '交通攻略', count: 987, trend: 'up', color: 'bg-yellow-500' },
  { id: '8', name: '摄影打卡', count: 876, trend: 'stable', color: 'bg-red-500' }
]

export default function InteractiveElements() {
  const [news] = useState(mockNews)
  const [topics] = useState(mockTopics)
  const [activeTab, setActiveTab] = useState<'news' | 'topics'>('news')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return '🌤️'
      case 'event':
        return '🎉'
      case 'traffic':
        return '🚗'
      default:
        return '📰'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
      {/* 标题和切换按钮 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">
          实时动态
        </h2>
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              activeTab === 'news'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            今日平潭
          </button>
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              activeTab === 'topics'
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            热门话题
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'news' ? (
        <div className="space-y-4">
          {news.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-lg">{getTypeIcon(item.type)}</span>
                <span className="text-white/60 text-xs">{item.time}</span>
              </div>
              
              <h3 className="text-white font-medium mb-2 text-sm group-hover:text-blue-200 transition-colors">
                {item.title}
              </h3>
              
              <p className="text-white/80 text-xs mb-3 line-clamp-2">
                {item.content}
              </p>
              
              <div className="flex items-center justify-between text-white/60 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{item.views}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{item.likes}</span>
                  </span>
                </div>
                <button className="hover:text-white transition-colors">
                  <Share2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 6).map((topic) => (
              <button
                key={topic.id}
                className={`group flex items-center space-x-1 bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10 hover:bg-white/10 transition-all duration-300`}
              >
                <Hash className="w-3 h-3 text-white/70" />
                <span className="text-white font-medium text-xs">{topic.name}</span>
                <span className="text-white/60 text-xs">{topic.count.toLocaleString()}</span>
                {getTrendIcon(topic.trend)}
              </button>
            ))}
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h3 className="text-white font-medium mb-3 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
              热度趋势
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {topics.slice(0, 4).map((topic) => (
                <div key={topic.id} className="text-center">
                  <div className={`w-8 h-8 ${topic.color} rounded-full mx-auto mb-1 flex items-center justify-center`}>
                    <Hash className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-white text-xs font-medium">{topic.name}</p>
                  <p className="text-white/60 text-xs">{topic.count.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}