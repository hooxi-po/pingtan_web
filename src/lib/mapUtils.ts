// 地图工具类

// 平潭地区的地理坐标常量
export const PINGTAN_COORDINATES = {
  // 主要景点坐标
  TANNAN_BAY: [119.7909, 25.4315] as [number, number],
  SHIPAIYANG: [119.6891, 25.5012] as [number, number],
  LONGFENGTOU: [119.7123, 25.5234] as [number, number],
  BEIGANG_VILLAGE: [119.7234, 25.4567] as [number, number],
  HOUYAN_ISLAND: [119.8123, 25.3891] as [number, number],
  HAITAN_ANCIENT_CITY: [119.7456, 25.5123] as [number, number],
  
  // 区域中心点
  PINGTAN_CENTER: [119.7906, 25.4444] as [number, number],
  SUAO_TOWN: [119.8333, 25.5167] as [number, number],
  LIUSHUI_TOWN: [119.7500, 25.4167] as [number, number],
  TANCHENG_TOWN: [119.7833, 25.5000] as [number, number]
};

// 地图缩放级别常量
export const MAP_ZOOM_LEVELS = {
  CITY: 10,
  DISTRICT: 12,
  STREET: 15,
  BUILDING: 18
};

// 地图主题样式
export const MAP_STYLES = {
  NORMAL: 'normal',
  SATELLITE: 'satellite',
  HYBRID: 'hybrid'
};

// 标记点图标类型
export const MARKER_ICONS = {
  ATTRACTION: '/icons/attraction-marker.png',
  RESTAURANT: '/icons/restaurant-marker.png',
  ACCOMMODATION: '/icons/hotel-marker.png',
  TRANSPORT: '/icons/transport-marker.png',
  SHOPPING: '/icons/shopping-marker.png'
};

// 计算两点之间的距离（使用Haversine公式）
export function calculateDistance(
  point1: [number, number], 
  point2: [number, number]
): number {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  const R = 6371; // 地球半径（公里）
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 角度转弧度
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// 计算地图边界
export function calculateBounds(points: [number, number][]): {
  southwest: [number, number];
  northeast: [number, number];
} {
  if (points.length === 0) {
    return {
      southwest: PINGTAN_COORDINATES.PINGTAN_CENTER,
      northeast: PINGTAN_COORDINATES.PINGTAN_CENTER
    };
  }

  let minLng = points[0][0];
  let maxLng = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];

  points.forEach(([lng, lat]) => {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return {
    southwest: [minLng, minLat],
    northeast: [maxLng, maxLat]
  };
}

// 计算适合显示所有点的中心点和缩放级别
export function calculateOptimalView(points: [number, number][]): {
  center: [number, number];
  zoom: number;
} {
  if (points.length === 0) {
    return {
      center: PINGTAN_COORDINATES.PINGTAN_CENTER,
      zoom: MAP_ZOOM_LEVELS.DISTRICT
    };
  }

  if (points.length === 1) {
    return {
      center: points[0],
      zoom: MAP_ZOOM_LEVELS.STREET
    };
  }

  const bounds = calculateBounds(points);
  const centerLng = (bounds.southwest[0] + bounds.northeast[0]) / 2;
  const centerLat = (bounds.southwest[1] + bounds.northeast[1]) / 2;
  
  // 计算跨度
  const lngSpan = bounds.northeast[0] - bounds.southwest[0];
  const latSpan = bounds.northeast[1] - bounds.southwest[1];
  const maxSpan = Math.max(lngSpan, latSpan);
  
  // 根据跨度确定缩放级别
  let zoom = MAP_ZOOM_LEVELS.CITY;
  if (maxSpan < 0.01) zoom = MAP_ZOOM_LEVELS.BUILDING;
  else if (maxSpan < 0.05) zoom = MAP_ZOOM_LEVELS.STREET;
  else if (maxSpan < 0.1) zoom = MAP_ZOOM_LEVELS.DISTRICT;
  
  return {
    center: [centerLng, centerLat],
    zoom
  };
}

// 格式化坐标显示
export function formatCoordinates(lng: number, lat: number): string {
  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
}

// 验证坐标是否在平潭地区范围内
export function isInPingtanArea(lng: number, lat: number): boolean {
  // 平潭县大致范围
  const bounds = {
    minLng: 119.6,
    maxLng: 119.9,
    minLat: 25.3,
    maxLat: 25.6
  };
  
  return lng >= bounds.minLng && lng <= bounds.maxLng && 
         lat >= bounds.minLat && lat <= bounds.maxLat;
}

// 生成地图标记点数据
export function createMapMarker({
  id,
  position,
  title,
  content,
  type = 'ATTRACTION',
  onClick
}: {
  id: string;
  position: [number, number];
  title: string;
  content?: string;
  type?: keyof typeof MARKER_ICONS;
  onClick?: () => void;
}) {
  return {
    id,
    position,
    title,
    content,
    icon: MARKER_ICONS[type.toUpperCase() as keyof typeof MARKER_ICONS] || MARKER_ICONS.ATTRACTION,
    onClick
  };
}

// 地图配置预设
export const MAP_PRESETS = {
  // 景点浏览模式
  ATTRACTION_VIEW: {
    center: PINGTAN_COORDINATES.PINGTAN_CENTER,
    zoom: MAP_ZOOM_LEVELS.DISTRICT,
    enableRotate: true,
    enableTilt: true,
    enableScrollWheelZoom: true,
    enableDragging: true
  },
  
  // 路线规划模式
  ROUTE_PLANNING: {
    center: PINGTAN_COORDINATES.PINGTAN_CENTER,
    zoom: MAP_ZOOM_LEVELS.CITY,
    enableRotate: false,
    enableTilt: false,
    enableScrollWheelZoom: true,
    enableDragging: true
  },
  
  // 详细查看模式
  DETAIL_VIEW: {
    center: PINGTAN_COORDINATES.PINGTAN_CENTER,
    zoom: MAP_ZOOM_LEVELS.STREET,
    enableRotate: true,
    enableTilt: true,
    enableScrollWheelZoom: true,
    enableDragging: true
  }
};

// 地图事件处理工具
export class MapEventHandler {
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  // 添加事件监听器
  on(event: string, callback: (...args: unknown[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // 移除事件监听器
  off(event: string, callback: (...args: unknown[]) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 触发事件
  emit(event: string, ...args: unknown[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  // 清除所有监听器
  clear() {
    this.listeners.clear();
  }
}

// 地图性能优化工具
export const MapPerformance = {
  // 防抖函数
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // 节流函数
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// 导出默认配置
const mapConfig = {
  COORDINATES: PINGTAN_COORDINATES,
  ZOOM_LEVELS: MAP_ZOOM_LEVELS,
  STYLES: MAP_STYLES,
  MARKER_ICONS,
  PRESETS: MAP_PRESETS
};

export default mapConfig;