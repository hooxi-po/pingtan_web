'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Locale = 'zh' | 'en'

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, defaultValue?: string) => string
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

// 翻译字典
const translations = {
  zh: {
    // 通用
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.edit': '编辑',
    'common.delete': '删除',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.more': '更多',
    'common.less': '收起',
    'common.viewAll': '查看全部',
    'common.readMore': '阅读更多',
    
    // 导航
    'nav.home': '首页',
    'nav.attractions': '景点',
    'nav.accommodations': '民宿',
    'nav.restaurants': '美食',
    'nav.itineraries': '行程推荐',
    'nav.news': '新闻资讯',
    'nav.about': '关于我们',
    'nav.profile': '个人资料',
    'nav.favorites': '我的收藏',
    'nav.settings': '设置',
    'nav.signIn': '登录',
    'nav.signUp': '注册',
    'nav.signOut': '退出登录',
    
    // 首页
    'home.hero.title': '探索平潭岛的美丽风光',
    'home.hero.subtitle': '体验独特的海岛文化，享受难忘的旅行时光',
    'home.hero.cta': '开始探索',
    'home.features.title': '为什么选择我们',
    'home.features.attractions.title': '精选景点',
    'home.features.attractions.desc': '为您推荐平潭最美的景点和必游之地',
    'home.features.itineraries.title': '智能行程',
    'home.features.itineraries.desc': '根据您的喜好定制专属旅行路线',
    'home.features.local.title': '本地体验',
    'home.features.local.desc': '深度体验当地文化和特色美食',
    
    // 景点
    'attractions.title': '热门景点',
    'attractions.searchPlaceholder': '搜索景点...',
    'attractions.noResults': '没有找到相关景点',
    'attractions.rating': '评分',
    'attractions.reviews': '条评价',
    'attractions.viewDetails': '查看详情',
    'attractions.addToFavorites': '加入收藏',
    'attractions.removeFromFavorites': '取消收藏',
    
    // Itineraries
    'itineraries.title': '推荐行程',
    'itineraries.subtitle': '发现精心策划的旅行路线，让您的平潭之旅更加精彩',
    'itineraries.days': '天',
    'itineraries.budget': '预算',
    'itineraries.viewItinerary': '查看行程',
    'itineraries.searchPlaceholder': '搜索行程...',
    'itineraries.allDays': '所有天数',
    'itineraries.allBudgets': '所有预算',
    'itineraries.create': '创建行程',
    'itineraries.tags': '标签',
    'itineraries.viewDetails': '查看详情',
    'itineraries.noResults': '没有找到相关行程',
    'itineraries.noResultsDesc': '尝试调整搜索条件或创建新的行程',
    
    // Itinerary (single)
    'itinerary.title': '行程规划',
    'itinerary.subtitle': '智能规划您的平潭之旅，发现最佳旅行路线',
    'itinerary.recommended': '推荐行程',
    'itinerary.my': '我的行程',
    'itinerary.create': '创建行程',
    'itinerary.days': '天',
    'itinerary.people': '人',
    'itinerary.viewDetails': '查看详情',
    'itinerary.copy': '复制行程',
    'itinerary.edit': '编辑行程',
    'itinerary.delete': '删除',
    'itinerary.noItineraries': '暂无行程',
    'itinerary.createFirst': '创建您的第一个行程计划',
    'itinerary.createNow': '立即创建',
    'itinerary.createNew': '创建新行程',
    'itinerary.name': '行程名称',
    'itinerary.namePlaceholder': '输入行程名称',
    'itinerary.description': '行程描述',
    'itinerary.descriptionPlaceholder': '描述您的行程计划',
    'itinerary.groupSize': '人数',
    'itinerary.reset': '重置',
    'itinerary.schedule': '行程安排',
    'itinerary.addAttraction': '添加景点',
    'itinerary.day': '第',
    'itinerary.noPlan': '暂无安排',
    'itinerary.addFirst': '添加第一个景点',
    'itinerary.notesPlaceholder': '添加备注...',
    'itinerary.map': '路线地图',
    'itinerary.selectAttraction': '选择景点',
    'itinerary.addToDay': '添加到第',
    
    // News
    'news.title': '最新资讯',
    'news.subtitle': '了解平潭最新旅游动态和资讯',
    'news.publishedAt': '发布于',
    'news.readMore': '阅读全文',
    'news.notFound': '新闻不存在',
    'news.notFoundDesc': '您访问的新闻可能已被删除或不存在',
    'news.backToList': '返回新闻列表',
    'news.linkCopied': '链接已复制到剪贴板',
    'news.views': '浏览',
    'news.comments': '评论',
    'news.like': '收藏',
    'news.share': '分享',
    'news.fontSize': '字体大小',
    'news.tags': '标签',
    'news.commentsTitle': '评论',
    'news.commentPlaceholder': '写下您的评论...',
    'news.submitComment': '发表评论',
    'news.reply': '回复',
    'news.relatedNews': '相关新闻',
    'news.featured': '精选新闻',
    'news.search': '搜索新闻',
    'news.searchPlaceholder': '输入关键词搜索...',
    'news.categories': '新闻分类',
    'news.sortBy': '排序方式',
    'news.sortByDate': '按日期',
    'news.sortByViews': '按浏览量',
    'news.sortByComments': '按评论数',
    'news.allNews': '全部新闻',
    'news.totalResults': '共',
    'news.articles': '篇文章',
    'news.noResults': '没有找到相关新闻',
    'news.tryDifferentKeywords': '请尝试使用不同的关键词或筛选条件',
    'news.previous': '上一页',
    'news.next': '下一页',
    
    // Attractions
    'attractions.subtitle': '探索平潭岛的自然美景和人文景观，发现属于你的完美旅程',
    'attractions.searchResults': '找到景点',
    'attractions.hideMap': '隐藏地图',
    'attractions.showMap': '显示地图',
    'attractions.gridView': '网格',
    'attractions.listView': '列表',
    'attractions.noResultsDesc': '尝试调整搜索关键词或筛选条件',
    
    // Attraction (single)
    'attraction.notFound': '景点未找到',
    'attraction.backToList': '返回景点列表',
    'attraction.practicalInfo': '实用信息',
    'attraction.openingHours': '开放时间',
    'attraction.bestVisitTime': '最佳游览时间',
    'attraction.facilities': '设施服务',
    'attraction.tips': '游览贴士',
    'attraction.reviews': '用户评论',
    'attraction.location': '位置信息',
    'attraction.getDirections': '获取路线',
    'attraction.relatedAttractions': '相关景点',
    'attraction.nearbyAccommodations': '附近民宿',
    'attraction.nearbyRestaurants': '附近美食',
    
    // Accommodations
    'accommodations.oceanView': '海景度假民宿',
    'accommodations.oceanViewDesc': '面朝大海，春暖花开',
    'accommodations.stoneHouse': '石头厝特色民宿',
    'accommodations.stoneHouseDesc': '体验传统建筑文化',
    
    // Restaurants
    'restaurants.seafood': '时来运转海鲜店',
    'restaurants.seafoodDesc': '招牌海蛎煎，新鲜美味',
    'restaurants.fishBall': '鱼丸世家',
    'restaurants.fishBallDesc': '手工制作，Q弹爽滑',
    'restaurants.specialty': '特色',
    
    // Common
    'common.viewMore': '查看更多',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.days': '天',
    'common.people': '人',
    'common.day': '天',
    
    // Itinerary Generator
    'itineraryGenerator.title': '一键行程生成',
    'itineraryGenerator.basicInfo': '基本信息',
    'itineraryGenerator.days': '旅行天数',
    'itineraryGenerator.groupSize': '出行人数',
    'itineraryGenerator.budget': '预算',
    'itineraryGenerator.preferences': '偏好设置',
    'itineraryGenerator.interests': '兴趣爱好',
    'itineraryGenerator.travelStyle': '旅行风格',
    'itineraryGenerator.generating': '生成中...',
    'itineraryGenerator.generate': '生成行程',
    'itineraryGenerator.regenerate': '重新生成',
    'itineraryGenerator.save': '保存行程',
    
    // Interests
    'interests.photography': '摄影',
    'interests.sightseeing': '观光',
    'interests.culture': '文化',
    'interests.adventure': '探险',
    'interests.relaxation': '休闲',
    'interests.food': '美食',
    'interests.swimming': '游泳',
    'interests.hiking': '徒步',
    
    // Travel Styles
    'travelStyle.relaxed': '悠闲',
    'travelStyle.relaxedDesc': '慢节奏，重点休闲',
    'travelStyle.active': '活力',
    'travelStyle.activeDesc': '运动丰富，体验多样',
    'travelStyle.cultural': '文化',
    'travelStyle.culturalDesc': '深度文化体验',
    'travelStyle.adventure': '探险',
    'travelStyle.adventureDesc': '刺激冒险，挑战自我',
    
    // Errors
    'error.generateFailed': '生成行程失败',
    'error.networkError': '网络错误，请重试',
    
    // Floating Chat
    'chat.minimized': '点击展开聊天窗口',
    
    // Search
    'search.placeholder': '搜索景点名称、描述或位置...',
    'search.advancedFilters': '高级筛选',
    'search.search': '搜索',
    'search.location': '位置区域',
    'search.category': '景点类型',
    'search.priceRange': '价格范围',
    'search.duration': '游览时长',
    'search.minRating': '最低评分',
    'search.tags': '特色标签',
    'search.sortBy': '排序方式',
    'search.descending': '降序',
    'search.ascending': '升序',
    'search.activeFilters': '已应用',
    'search.filters': '个筛选条件',
    'search.reset': '重置',
    'search.collapse': '收起',
    'search.clearAll': '清除全部',
    'search.starsAndAbove': '星以上',
    
    // Search Categories
    'search.allTypes': '全部类型',
    'search.beach': '海滩海岛',
    'search.scenic': '自然风光',
    'search.cultural': '人文景观',
    'search.adventure': '户外探险',
    'search.historical': '历史古迹',
    'search.entertainment': '休闲娱乐',
    
    // Search Locations
    'search.allAreas': '全部区域',
    'search.tannanBay': '坛南湾区域',
    'search.suao': '苏澳镇',
    'search.liushui': '流水镇',
    'search.tancheng': '潭城镇',
    'search.pingtanCenter': '平潭中心区',
    
    // Search Price Ranges
    'search.noLimit': '不限价格',
    'search.free': '免费',
    'search.price0to50': '¥0-50',
    'search.price50to100': '¥50-100',
    'search.price100to200': '¥100-200',
    'search.price200plus': '¥200以上',
    
    // Search Durations
    'search.noDurationLimit': '不限时长',
    'search.duration1to2': '1-2小时',
    'search.duration2to4': '2-4小时',
    'search.halfDay': '半天',
    'search.fullDay': '全天',
    'search.multiDay': '多天',
    
    // Search Tags
    'search.tag.beach': '海滩',
    'search.tag.swimming': '游泳',
    'search.tag.sunrise': '日出',
    'search.tag.sunset': '日落',
    'search.tag.photography': '摄影',
    'search.tag.geological': '地质奇观',
    'search.tag.ancientVillage': '古村落',
    'search.tag.artistic': '文艺',
    'search.tag.homestay': '民宿',
    'search.tag.uninhabitedIsland': '无人岛',
    'search.tag.adventure': '探险',
    'search.tag.diving': '潜水',
    'search.tag.ancientArchitecture': '古建筑',
    'search.tag.shopping': '购物',
    'search.tag.food': '美食',
    'search.tag.waterSports': '水上运动',
    'search.tag.sightseeing': '观景',
    
    // Search Sort Options
    'search.sortByRating': '按评分排序',
    'search.sortByReviews': '按评论数排序',
    'search.sortByName': '按名称排序',
    'search.sortByDistance': '按距离排序',
    
    // Profile
    'profile.location': '位置',
    'profile.bioPlaceholder': '介绍一下自己...',
    'profile.joinedOn': '加入于',
    'profile.save': '保存',
    'profile.cancel': '取消',
    'profile.edit': '编辑资料',
    'profile.visitedAttractions': '已访问景点',
    'profile.totalCheckins': '总打卡次数',
    'profile.photosShared': '分享照片',
    'profile.reviewsWritten': '撰写评论',
    'profile.overview': '概览',
    'profile.checkins': '打卡记录',
    'profile.favorites': '我的收藏',
    'profile.settings': '设置',
    'profile.badges': '成就徽章',
    'profile.earnedOn': '获得于',
    'profile.recentActivity': '最近活动',
    'profile.checkedInAt': '在',
    'profile.checkedIn': '打卡',
    'profile.viewAllCheckins': '查看所有打卡记录',
    'profile.checkinHistory': '打卡历史',
    'profile.reviews': '评论',
    'profile.addedOn': '收藏于',
    'profile.accountSettings': '账户设置',
    'profile.notifications': '通知设置',
    'profile.emailNotifications': '邮件通知',
    'profile.pushNotifications': '推送通知',
    'profile.recommendationNotifications': '推荐通知',
    'profile.privacy': '隐私设置',
    'profile.publicProfile': '公开个人资料',
    'profile.showLocation': '显示位置信息',
    'profile.showStats': '显示统计数据',
    'profile.language': '语言设置',
    'profile.chinese': '中文',
    'profile.english': 'English',
    'profile.dangerZone': '危险操作',
    'profile.deleteAccount': '删除账户',
    
    // Common
    'common.back': '返回',
    
    // User
    'user.profile': '个人资料',
    'user.email': '邮箱',
    'user.name': '姓名',
    'user.avatar': '头像',
    'user.joinedAt': '加入时间',
    
    // Form
    'form.required': '此字段为必填项',
    'form.email.invalid': '请输入有效的邮箱地址',
    'form.password.minLength': '密码至少需要8个字符',
    'form.submit': '提交',
    'form.submitting': '提交中...',
    
    // API Errors
    'api.error.general': '服务器错误，请稍后重试',
    'api.error.network': '网络连接失败',
    'api.error.notFound': '请求的资源不存在',
    'api.error.unauthorized': '未授权访问',
    'api.error.forbidden': '访问被禁止',
    'api.error.validation': '数据验证失败',
    
    // Attractions API
    'api.attractions.fetchFailed': '获取景点列表失败',
    'api.attractions.createFailed': '创建景点失败',
    'api.attractions.updateFailed': '更新景点失败',
    'api.attractions.deleteFailed': '删除景点失败',
    'api.attractions.detailsFailed': '获取景点详情失败',
    'api.attractions.nameRequired': '景点名称（中文）为必填项',
    'api.attractions.invalidId': '无效的景点ID',
    'api.attractions.notFound': '景点不存在',
    'api.attractions.deleteSuccess': '景点删除成功',
    
    // News API
    'api.news.fetchFailed': '获取新闻列表失败',
    'api.news.createFailed': '创建新闻失败',
    'api.news.titleContentRequired': '标题和内容为必填项',
    
    // Itineraries API
    'api.itineraries.fetchFailed': '获取行程推荐失败',
    'api.itineraries.createFailed': '创建行程失败',
    'api.itineraries.titleDaysRequired': '标题和天数为必填项',
    
    // User Actions API
    'api.userActions.fetchFailed': '获取用户行为记录失败',
    'api.userActions.createFailed': '创建用户行为记录失败',
    'api.userActions.deleteFailed': '删除用户行为记录失败',
    'api.userActions.requiredFields': '用户ID、行为类型、目标类型和目标ID为必填项',
    'api.userActions.invalidRating': '评分必须在1-5之间',
    'api.userActions.alreadyExists': '该行为记录已存在',
    'api.userActions.updateSuccess': '点评更新成功',
    'api.userActions.deleteSuccess': '行为记录删除成功',
    'api.userActions.missingParams': '缺少必要参数',
    
    // Accommodation API
    'api.accommodations.fetchSuccess': '获取民宿列表成功',
    'api.accommodations.createSuccess': '创建民宿成功',
    'api.accommodations.updateSuccess': '更新民宿成功',
    'api.accommodations.deleteSuccess': '删除民宿成功',
    
    // Restaurant API
    'api.restaurants.fetchSuccess': '获取餐厅列表成功',
    'api.restaurants.createSuccess': '创建餐厅成功',
    'api.restaurants.updateSuccess': '更新餐厅成功',
    'api.restaurants.deleteSuccess': '删除餐厅成功'
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.more': 'More',
    'common.less': 'Less',
    'common.viewAll': 'View All',
    'common.readMore': 'Read More',
    
    // Navigation
    'nav.home': 'Home',
    'nav.attractions': 'Attractions',
    'nav.accommodations': 'Accommodations',
    'nav.restaurants': 'Restaurants',
    'nav.itineraries': 'Itineraries',
    'nav.news': 'News',
    'nav.about': 'About',
    'nav.profile': 'Profile',
    'nav.favorites': 'Favorites',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.signOut': 'Sign Out',
    
    // Home
    'home.hero.title': 'Explore the Beauty of Pingtan Island',
    'home.hero.subtitle': 'Experience unique island culture and enjoy unforgettable travel moments',
    'home.hero.cta': 'Start Exploring',
    'home.features.title': 'Why Choose Us',
    'home.features.attractions.title': 'Curated Attractions',
    'home.features.attractions.desc': 'Discover the most beautiful spots and must-visit places in Pingtan',
    'home.features.itineraries.title': 'Smart Itineraries',
    'home.features.itineraries.desc': 'Customize exclusive travel routes based on your preferences',
    'home.features.local.title': 'Local Experience',
    'home.features.local.desc': 'Deep dive into local culture and specialty cuisine',
    
    // Attractions
    'attractions.title': 'Popular Attractions',
    'attractions.searchPlaceholder': 'Search attractions...',
    'attractions.noResults': 'No attractions found',
    'attractions.rating': 'Rating',
    'attractions.reviews': 'reviews',
    'attractions.viewDetails': 'View Details',
    'attractions.addToFavorites': 'Add to Favorites',
    'attractions.removeFromFavorites': 'Remove from Favorites',
    
    // Itineraries
    'itineraries.title': 'Recommended Itineraries',
    'itineraries.subtitle': 'Discover carefully planned travel routes to make your Pingtan journey more exciting',
    'itineraries.days': 'days',
    'itineraries.budget': 'Budget',
    'itineraries.viewItinerary': 'View Itinerary',
    'itineraries.searchPlaceholder': 'Search itineraries...',
    'itineraries.allDays': 'All Days',
    'itineraries.allBudgets': 'All Budgets',
    'itineraries.create': 'Create Itinerary',
    'itineraries.tags': 'Tags',
    'itineraries.viewDetails': 'View Details',
    'itineraries.noResults': 'No itineraries found',
    'itineraries.noResultsDesc': 'Try adjusting your search criteria or create a new itinerary',
    
    // Itinerary (single)
    'itinerary.title': 'Itinerary Planning',
    'itinerary.subtitle': 'Intelligently plan your Pingtan journey and discover the best travel routes',
    'itinerary.recommended': 'Recommended Itineraries',
    'itinerary.my': 'My Itineraries',
    'itinerary.create': 'Create Itinerary',
    'itinerary.days': 'days',
    'itinerary.people': 'people',
    'itinerary.viewDetails': 'View Details',
    'itinerary.copy': 'Copy Itinerary',
    'itinerary.edit': 'Edit Itinerary',
    'itinerary.delete': 'Delete',
    'itinerary.noItineraries': 'No itineraries',
    'itinerary.createFirst': 'Create your first itinerary plan',
    'itinerary.createNow': 'Create Now',
    'itinerary.createNew': 'Create New Itinerary',
    'itinerary.name': 'Itinerary Name',
    'itinerary.namePlaceholder': 'Enter itinerary name',
    'itinerary.description': 'Itinerary Description',
    'itinerary.descriptionPlaceholder': 'Describe your itinerary plan',
    'itinerary.groupSize': 'Group Size',
    'itinerary.reset': 'Reset',
    'itinerary.schedule': 'Schedule',
    'itinerary.addAttraction': 'Add Attraction',
    'itinerary.day': 'Day',
    'itinerary.noPlan': 'No plans',
    'itinerary.addFirst': 'Add first attraction',
    'itinerary.notesPlaceholder': 'Add notes...',
    'itinerary.map': 'Route Map',
    'itinerary.selectAttraction': 'Select Attraction',
    'itinerary.addToDay': 'Add to Day',
    
    // News
    'news.title': 'Latest News',
    'news.subtitle': 'Stay updated with the latest tourism news and information about Pingtan',
    'news.publishedAt': 'Published on',
    'news.readMore': 'Read More',
    'news.notFound': 'News not found',
    'news.notFoundDesc': 'The news you are looking for may have been deleted or does not exist',
    'news.backToList': 'Back to News List',
    'news.linkCopied': 'Link copied to clipboard',
    'news.views': 'views',
    'news.comments': 'comments',
    'news.like': 'Like',
    'news.share': 'Share',
    'news.fontSize': 'Font Size',
    'news.tags': 'Tags',
    'news.commentsTitle': 'Comments',
    'news.commentPlaceholder': 'Write your comment...',
    'news.submitComment': 'Submit Comment',
    'news.reply': 'Reply',
    'news.relatedNews': 'Related News',
    'news.featured': 'Featured News',
    'news.search': 'Search News',
    'news.searchPlaceholder': 'Enter keywords to search...',
    'news.categories': 'News Categories',
    'news.sortBy': 'Sort By',
    'news.sortByDate': 'By Date',
    'news.sortByViews': 'By Views',
    'news.sortByComments': 'By Comments',
    'news.allNews': 'All News',
    'news.totalResults': 'Total',
    'news.articles': 'articles',
    'news.noResults': 'No news found',
    'news.tryDifferentKeywords': 'Please try different keywords or filter criteria',
    'news.previous': 'Previous',
    'news.next': 'Next',
    
    // Attractions
    'attractions.subtitle': 'Explore the natural beauty and cultural landscapes of Pingtan Island, discover your perfect journey',
    'attractions.searchResults': 'attractions found',
    'attractions.hideMap': 'Hide Map',
    'attractions.showMap': 'Show Map',
    'attractions.gridView': 'Grid',
    'attractions.listView': 'List',
    'attractions.noResultsDesc': 'Try adjusting your search keywords or filter criteria',
    
    // Attraction (single)
    'attraction.notFound': 'Attraction not found',
    'attraction.backToList': 'Back to Attractions',
    'attraction.practicalInfo': 'Practical Information',
    'attraction.openingHours': 'Opening Hours',
    'attraction.bestVisitTime': 'Best Visit Time',
    'attraction.facilities': 'Facilities',
    'attraction.tips': 'Tips',
    'attraction.reviews': 'Reviews',
    'attraction.location': 'Location',
    'attraction.getDirections': 'Get Directions',
    'attraction.relatedAttractions': 'Related Attractions',
    'attraction.nearbyAccommodations': 'Nearby Accommodations',
    'attraction.nearbyRestaurants': 'Nearby Restaurants',
    
    // Accommodations
    'accommodations.oceanView': 'Ocean View Resort B&B',
    'accommodations.oceanViewDesc': 'Facing the sea with spring blooms',
    'accommodations.stoneHouse': 'Stone House Heritage B&B',
    'accommodations.stoneHouseDesc': 'Experience traditional architecture',
    
    // Restaurants
    'restaurants.seafood': 'Shi Lai Yun Zhuan Seafood',
    'restaurants.seafoodDesc': 'Famous oyster omelet, fresh and delicious',
    'restaurants.fishBall': 'Fish Ball House',
    'restaurants.fishBallDesc': 'Handmade, bouncy and smooth',
    'restaurants.specialty': 'Specialty',
    
    // Common
    'common.viewMore': 'View More',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.days': 'Days',
    'common.people': 'People',
    'common.day': 'Day',
    
    // Itinerary Generator
    'itineraryGenerator.title': 'One-Click Itinerary Generator',
    'itineraryGenerator.basicInfo': 'Basic Information',
    'itineraryGenerator.days': 'Travel Days',
    'itineraryGenerator.groupSize': 'Group Size',
    'itineraryGenerator.budget': 'Budget',
    'itineraryGenerator.preferences': 'Preferences',
    'itineraryGenerator.interests': 'Interests',
    'itineraryGenerator.travelStyle': 'Travel Style',
    'itineraryGenerator.generating': 'Generating...',
    'itineraryGenerator.generate': 'Generate Itinerary',
    'itineraryGenerator.regenerate': 'Regenerate',
    'itineraryGenerator.save': 'Save Itinerary',
    
    // Interests
    'interests.photography': 'Photography',
    'interests.sightseeing': 'Sightseeing',
    'interests.culture': 'Culture',
    'interests.adventure': 'Adventure',
    'interests.relaxation': 'Relaxation',
    'interests.food': 'Food',
    'interests.swimming': 'Swimming',
    'interests.hiking': 'Hiking',
    
    // Travel Styles
    'travelStyle.relaxed': 'Relaxed',
    'travelStyle.relaxedDesc': 'Slow pace, focus on leisure',
    'travelStyle.active': 'Active',
    'travelStyle.activeDesc': 'Rich activities, diverse experiences',
    'travelStyle.cultural': 'Cultural',
    'travelStyle.culturalDesc': 'Deep cultural experiences',
    'travelStyle.adventure': 'Adventure',
    'travelStyle.adventureDesc': 'Exciting adventures, challenge yourself',
    
    // Errors
    'error.generateFailed': 'Failed to generate itinerary',
    'error.networkError': 'Network error, please try again',
    
    // Floating Chat
    'chat.minimized': 'Click to expand chat window',
    
    // Search
    'search.placeholder': 'Search attraction names, descriptions or locations...',
    'search.advancedFilters': 'Advanced Filters',
    'search.search': 'Search',
    'search.location': 'Location',
    'search.category': 'Category',
    'search.priceRange': 'Price Range',
    'search.duration': 'Duration',
    'search.minRating': 'Minimum Rating',
    'search.tags': 'Tags',
    'search.sortBy': 'Sort By',
    'search.descending': 'Descending',
    'search.ascending': 'Ascending',
    'search.activeFilters': 'Applied',
    'search.filters': 'filters',
    'search.reset': 'Reset',
    'search.collapse': 'Collapse',
    'search.clearAll': 'Clear All',
    'search.starsAndAbove': ' stars and above',
    
    // Search Categories
    'search.allTypes': 'All Types',
    'search.beach': 'Beach & Island',
    'search.scenic': 'Natural Scenery',
    'search.cultural': 'Cultural Landscape',
    'search.adventure': 'Outdoor Adventure',
    'search.historical': 'Historical Sites',
    'search.entertainment': 'Entertainment',
    
    // Search Locations
    'search.allAreas': 'All Areas',
    'search.tannanBay': 'Tannan Bay Area',
    'search.suao': 'Suao Town',
    'search.liushui': 'Liushui Town',
    'search.tancheng': 'Tancheng Town',
    'search.pingtanCenter': 'Pingtan Center',
    
    // Search Price Ranges
    'search.noLimit': 'No Limit',
    'search.free': 'Free',
    'search.price0to50': '¥0-50',
    'search.price50to100': '¥50-100',
    'search.price100to200': '¥100-200',
    'search.price200plus': '¥200+',
    
    // Search Durations
    'search.noDurationLimit': 'No Limit',
    'search.duration1to2': '1-2 Hours',
    'search.duration2to4': '2-4 Hours',
    'search.halfDay': 'Half Day',
    'search.fullDay': 'Full Day',
    'search.multiDay': 'Multi-day',
    
    // Search Tags
    'search.tag.beach': 'Beach',
    'search.tag.swimming': 'Swimming',
    'search.tag.sunrise': 'Sunrise',
    'search.tag.sunset': 'Sunset',
    'search.tag.photography': 'Photography',
    'search.tag.geological': 'Geological Wonder',
    'search.tag.ancientVillage': 'Ancient Village',
    'search.tag.artistic': 'Artistic',
    'search.tag.homestay': 'Homestay',
    'search.tag.uninhabitedIsland': 'Uninhabited Island',
    'search.tag.adventure': 'Adventure',
    'search.tag.diving': 'Diving',
    'search.tag.ancientArchitecture': 'Ancient Architecture',
    'search.tag.shopping': 'Shopping',
    'search.tag.food': 'Food',
    'search.tag.waterSports': 'Water Sports',
    'search.tag.sightseeing': 'Sightseeing',
    
    // Search Sort Options
    'search.sortByRating': 'Sort by Rating',
    'search.sortByReviews': 'Sort by Reviews',
    'search.sortByName': 'Sort by Name',
    'search.sortByDistance': 'Sort by Distance',
    
    // Profile
    'profile.location': 'Location',
    'profile.bioPlaceholder': 'Tell us about yourself...',
    'profile.joinedOn': 'Joined on',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.edit': 'Edit Profile',
    'profile.visitedAttractions': 'Visited Attractions',
    'profile.totalCheckins': 'Total Check-ins',
    'profile.photosShared': 'Photos Shared',
    'profile.reviewsWritten': 'Reviews Written',
    'profile.overview': 'Overview',
    'profile.checkins': 'Check-ins',
    'profile.favorites': 'Favorites',
    'profile.settings': 'Settings',
    'profile.badges': 'Badges',
    'profile.earnedOn': 'Earned on',
    'profile.recentActivity': 'Recent Activity',
    'profile.checkedInAt': 'Checked in at',
    'profile.checkedIn': 'checked in',
    'profile.viewAllCheckins': 'View All Check-ins',
    'profile.checkinHistory': 'Check-in History',
    'profile.reviews': 'reviews',
    'profile.addedOn': 'Added on',
    'profile.accountSettings': 'Account Settings',
    'profile.notifications': 'Notifications',
    'profile.emailNotifications': 'Email Notifications',
    'profile.pushNotifications': 'Push Notifications',
    'profile.recommendationNotifications': 'Recommendation Notifications',
    'profile.privacy': 'Privacy Settings',
    'profile.publicProfile': 'Public Profile',
    'profile.showLocation': 'Show Location',
    'profile.showStats': 'Show Statistics',
    'profile.language': 'Language',
    'profile.chinese': '中文',
    'profile.english': 'English',
    'profile.dangerZone': 'Danger Zone',
    'profile.deleteAccount': 'Delete Account',
    
    // Common
    'common.back': 'Back',
    
    // User
    'user.profile': 'Profile',
    'user.email': 'Email',
    'user.name': 'Name',
    'user.avatar': 'Avatar',
    'user.joinedAt': 'Joined',
    
    // Form
    'form.required': 'This field is required',
    'form.email.invalid': 'Please enter a valid email address',
    'form.password.minLength': 'Password must be at least 8 characters',
    'form.submit': 'Submit',
    'form.submitting': 'Submitting...',
    
    // API Errors
    'api.error.general': 'Server error, please try again later',
    'api.error.network': 'Network connection failed',
    'api.error.notFound': 'Requested resource not found',
    'api.error.unauthorized': 'Unauthorized access',
    'api.error.forbidden': 'Access forbidden',
    'api.error.validation': 'Data validation failed',
    
    // Attractions API
    'api.attractions.fetchFailed': 'Failed to fetch attractions list',
    'api.attractions.createFailed': 'Failed to create attraction',
    'api.attractions.updateFailed': 'Failed to update attraction',
    'api.attractions.deleteFailed': 'Failed to delete attraction',
    'api.attractions.detailsFailed': 'Failed to fetch attraction details',
    'api.attractions.nameRequired': 'Attraction name (Chinese) is required',
    'api.attractions.invalidId': 'Invalid attraction ID',
    'api.attractions.notFound': 'Attraction not found',
    'api.attractions.deleteSuccess': 'Attraction deleted successfully',
    
    // News API
    'api.news.fetchFailed': 'Failed to fetch news list',
    'api.news.createFailed': 'Failed to create news',
    'api.news.titleContentRequired': 'Title and content are required',
    
    // Itineraries API
    'api.itineraries.fetchFailed': 'Failed to fetch itineraries',
    'api.itineraries.createFailed': 'Failed to create itinerary',
    'api.itineraries.titleDaysRequired': 'Title and days are required',
    
    // User Actions API
    'api.userActions.fetchFailed': 'Failed to fetch user action records',
    'api.userActions.createFailed': 'Failed to create user action record',
    'api.userActions.deleteFailed': 'Failed to delete user action record',
    'api.userActions.requiredFields': 'User ID, action type, target type and target ID are required',
    'api.userActions.invalidRating': 'Rating must be between 1-5',
    'api.userActions.alreadyExists': 'This action record already exists',
    'api.userActions.updateSuccess': 'Review updated successfully',
    'api.userActions.deleteSuccess': 'Action record deleted successfully',
    'api.userActions.missingParams': 'Missing required parameters',
    
    // Accommodation API
    'api.accommodations.fetchSuccess': 'Accommodations fetched successfully',
    'api.accommodations.createSuccess': 'Accommodation created successfully',
    'api.accommodations.updateSuccess': 'Accommodation updated successfully',
    'api.accommodations.deleteSuccess': 'Accommodation deleted successfully',
    
    // Restaurant API
    'api.restaurants.fetchSuccess': 'Restaurants fetched successfully',
    'api.restaurants.createSuccess': 'Restaurant created successfully',
    'api.restaurants.updateSuccess': 'Restaurant updated successfully',
    'api.restaurants.deleteSuccess': 'Restaurant deleted successfully'
  },
}

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  // 从 localStorage 读取语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'zh' || savedLocale === 'en')) {
      setLocaleState(savedLocale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string, defaultValue?: string): string => {
    return translations[locale][key as keyof typeof translations[typeof locale]] || defaultValue || key
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return context
}