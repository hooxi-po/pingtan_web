/**
 * 缓存策略配置
 * 用于优化应用性能和减少API调用
 */

export interface CacheConfig {
  ttl: number; // 缓存时间（秒）
  maxSize?: number; // 最大缓存条目数
  staleWhileRevalidate?: number; // 过期后仍可使用的时间
}

// 缓存配置
export const CACHE_CONFIGS = {
  // 景点数据缓存 - 1小时
  attractions: {
    ttl: 3600,
    maxSize: 1000,
    staleWhileRevalidate: 300
  },
  
  // 新闻数据缓存 - 30分钟
  news: {
    ttl: 1800,
    maxSize: 500,
    staleWhileRevalidate: 300
  },
  
  // 用户数据缓存 - 15分钟
  user: {
    ttl: 900,
    maxSize: 100,
    staleWhileRevalidate: 60
  },
  
  // 搜索结果缓存 - 10分钟
  search: {
    ttl: 600,
    maxSize: 200,
    staleWhileRevalidate: 120
  },
  
  // 地图数据缓存 - 2小时
  map: {
    ttl: 7200,
    maxSize: 50,
    staleWhileRevalidate: 600
  }
} as const;

// 内存缓存实现
class MemoryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set(key: string, data: unknown, ttl: number): void {
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000 // 转换为毫秒
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // 清理过期缓存
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// 全局缓存实例
export const cache = new MemoryCache(2000);

// 缓存装饰器
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: CacheConfig,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    // 尝试从缓存获取
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }

    // 执行函数并缓存结果
    try {
      const result = await fn(...args);
      cache.set(key, result, config.ttl);
      return result;
    } catch (error) {
      // 如果有过期但仍可用的缓存，返回它
      if (config.staleWhileRevalidate) {
        const staleKey = `stale_${key}`;
        const staleData = cache.get(staleKey);
        if (staleData) {
          return staleData;
        }
      }
      throw error;
    }
  }) as T;
}

// 缓存键生成器
export const cacheKeys = {
  attraction: (id: string) => `attraction:${id}`,
  attractions: (params: Record<string, unknown>) => `attractions:${JSON.stringify(params)}`,
  news: (id: string) => `news:${id}`,
  newsList: (params: Record<string, unknown>) => `news:list:${JSON.stringify(params)}`,
  user: (id: string) => `user:${id}`,
  search: (query: string, filters: Record<string, unknown>) => `search:${query}:${JSON.stringify(filters)}`,
  map: (bounds: Record<string, unknown>) => `map:${JSON.stringify(bounds)}`
};

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000); // 每5分钟清理一次
}

// 缓存统计
export function getCacheStats() {
  return {
    size: cache.size(),
    maxSize: 2000,
    usage: (cache.size() / 2000) * 100
  };
}

// 预热缓存
export async function warmupCache() {
  try {
    // 预加载热门景点
    // 这里可以添加预加载逻辑
    console.log('Cache warmup completed');
  } catch (error) {
    console.error('Cache warmup failed:', error);
  }
}