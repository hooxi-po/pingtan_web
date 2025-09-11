'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MapMarker, MapConfig } from '@/components/map/MapComponent';
import { 
  calculateOptimalView, 
  calculateDistance, 
  PINGTAN_COORDINATES,
  MAP_ZOOM_LEVELS,
  MapEventHandler,
  MapPerformance
} from '@/lib/mapUtils';

// 地图状态接口
interface MapState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  center: [number, number];
  zoom: number;
  markers: MapMarker[];
}

// Hook选项接口
interface UseMapOptions {
  initialConfig?: Partial<MapConfig>;
  autoFitMarkers?: boolean;
  enableClustering?: boolean;
  onMapReady?: (map: unknown) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (event: unknown) => void;
}

// 地图Hook
export function useMap(options: UseMapOptions = {}) {
  const {
    initialConfig = {},
    autoFitMarkers = true,
    onMapReady
  } = options;

  // 状态管理
  const [mapState, setMapState] = useState<MapState>({
    isLoaded: false,
    isLoading: false,
    error: null,
    center: initialConfig.center || PINGTAN_COORDINATES.PINGTAN_CENTER,
    zoom: initialConfig.zoom || MAP_ZOOM_LEVELS.DISTRICT,
    markers: []
  });

  // Refs
  const mapInstanceRef = useRef<unknown>(null);
  const eventHandlerRef = useRef(new MapEventHandler());
  const markersRef = useRef<MapMarker[]>([]);

  // 更新地图状态
  const updateMapState = useCallback((updates: Partial<MapState>) => {
    setMapState(prev => ({ ...prev, ...updates }));
  }, []);

  // 设置地图实例
  const setMapInstance = useCallback((map: unknown) => {
    mapInstanceRef.current = map;
    updateMapState({ isLoaded: !!map, isLoading: false });
    
    if (map && onMapReady) {
      onMapReady(map);
    }
  }, [onMapReady, updateMapState]);

  // 添加标记点
  const addMarker = useCallback((marker: MapMarker) => {
    const newMarkers = [...markersRef.current, marker];
    markersRef.current = newMarkers;
    updateMapState({ markers: newMarkers });
    
    // 如果启用自动适配，重新计算视图
    if (autoFitMarkers && newMarkers.length > 1) {
      const optimalView = calculateOptimalView(newMarkers.map(m => m.position));
      updateMapState({ 
        center: optimalView.center, 
        zoom: optimalView.zoom 
      });
    }
    
    eventHandlerRef.current.emit('markerAdded', marker);
  }, [autoFitMarkers, updateMapState]);

  // 移除标记点
  const removeMarker = useCallback((markerId: string) => {
    const newMarkers = markersRef.current.filter(m => m.id !== markerId);
    markersRef.current = newMarkers;
    updateMapState({ markers: newMarkers });
    
    eventHandlerRef.current.emit('markerRemoved', markerId);
  }, [updateMapState]);

  // 清除所有标记点
  const clearMarkers = useCallback(() => {
    markersRef.current = [];
    updateMapState({ markers: [] });
    eventHandlerRef.current.emit('markersCleared');
  }, [updateMapState]);

  // 批量设置标记点
  const setMarkers = useCallback((markers: MapMarker[]) => {
    markersRef.current = markers;
    updateMapState({ markers });
    
    // 如果启用自动适配且有多个标记点，计算最佳视图
    if (autoFitMarkers && markers.length > 0) {
      const optimalView = calculateOptimalView(markers.map(m => m.position));
      updateMapState({ 
        center: optimalView.center, 
        zoom: optimalView.zoom 
      });
    }
    
    eventHandlerRef.current.emit('markersSet', markers);
  }, [autoFitMarkers, updateMapState]);

  // 移动地图中心
  const panTo = useCallback((center: [number, number], zoom?: number) => {
    updateMapState({ 
      center, 
      ...(zoom !== undefined && { zoom }) 
    });
    
    if (mapInstanceRef.current) {
      const point = new window.BMapGL.Point(center[0], center[1]);
      if (zoom !== undefined) {
        mapInstanceRef.current.centerAndZoom(point, zoom);
      } else {
        mapInstanceRef.current.panTo(point);
      }
    }
    
    eventHandlerRef.current.emit('panTo', center, zoom);
  }, [updateMapState]);

  // 设置缩放级别
  const setZoom = useCallback((zoom: number) => {
    updateMapState({ zoom });
    
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(zoom);
    }
    
    eventHandlerRef.current.emit('zoomChanged', zoom);
  }, [updateMapState]);

  // 适配所有标记点
  const fitMarkers = useCallback(() => {
    if (markersRef.current.length === 0) return;
    
    const optimalView = calculateOptimalView(markersRef.current.map(m => m.position));
    panTo(optimalView.center, optimalView.zoom);
  }, [panTo]);

  // 查找最近的标记点
  const findNearestMarker = useCallback((position: [number, number]): MapMarker | null => {
    if (markersRef.current.length === 0) return null;
    
    let nearestMarker = markersRef.current[0];
    let minDistance = calculateDistance(position, nearestMarker.position);
    
    markersRef.current.forEach(marker => {
      const distance = calculateDistance(position, marker.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = marker;
      }
    });
    
    return nearestMarker;
  }, []);

  // 获取指定范围内的标记点
  const getMarkersInRadius = useCallback((center: [number, number], radius: number): MapMarker[] => {
    return markersRef.current.filter(marker => {
      const distance = calculateDistance(center, marker.position);
      return distance <= radius;
    });
  }, []);

  // 防抖的地图更新函数
  const debouncedPanTo = useCallback(
    MapPerformance.debounce(panTo, 300),
    [panTo]
  );

  // 节流的缩放更新函数
  const throttledSetZoom = useCallback(
    MapPerformance.throttle(setZoom, 100),
    [setZoom]
  );

  // 地图配置
  const mapConfig: Partial<MapConfig> = {
    center: mapState.center,
    zoom: mapState.zoom,
    ...initialConfig
  };

  // 事件监听器管理
  const addEventListener = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    eventHandlerRef.current.on(event, callback);
  }, []);

  const removeEventListener = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    eventHandlerRef.current.off(event, callback);
  }, []);

  // 地图操作方法
  const mapActions = {
    // 标记点操作
    addMarker,
    removeMarker,
    clearMarkers,
    setMarkers,
    
    // 视图操作
    panTo,
    setZoom,
    fitMarkers,
    debouncedPanTo,
    throttledSetZoom,
    
    // 查询操作
    findNearestMarker,
    getMarkersInRadius,
    
    // 事件操作
    addEventListener,
    removeEventListener,
    
    // 地图实例操作
    setMapInstance
  };

  // 清理函数
  useEffect(() => {
    return () => {
      eventHandlerRef.current.clear();
    };
  }, []);

  return {
    // 状态
    mapState,
    mapConfig,
    mapInstance: mapInstanceRef.current,
    
    // 操作方法
    ...mapActions,
    
    // 便捷属性
    isLoaded: mapState.isLoaded,
    isLoading: mapState.isLoading,
    error: mapState.error,
    center: mapState.center,
    zoom: mapState.zoom,
    markers: mapState.markers
  };
}

// 景点地图Hook
export function useAttractionMap(attractions: unknown[] = []) {
  const mapHook = useMap({
    autoFitMarkers: true,
    initialConfig: {
      center: PINGTAN_COORDINATES.PINGTAN_CENTER,
      zoom: MAP_ZOOM_LEVELS.DISTRICT
    }
  });

  // 将景点转换为地图标记点
  useEffect(() => {
    const markers: MapMarker[] = attractions
      .filter(attraction => attraction.coordinates)
      .map(attraction => ({
        id: attraction.id,
        position: [attraction.coordinates.lng, attraction.coordinates.lat],
        title: attraction.name,
        content: `${attraction.description}<br/>评分: ${attraction.rating}/5.0`,
        onClick: () => {
          console.log('点击景点:', attraction.name);
        }
      }));
    
    mapHook.setMarkers(markers);
  }, [attractions, mapHook.setMarkers]);

  return mapHook;
}

// 路线地图Hook
export function useRouteMap(routePoints: unknown[] = []) {
  const mapHook = useMap({
    autoFitMarkers: true,
    initialConfig: {
      center: PINGTAN_COORDINATES.PINGTAN_CENTER,
      zoom: MAP_ZOOM_LEVELS.CITY,
      enableRotate: false,
      enableTilt: false
    }
  });

  // 将路线点转换为地图标记点
  useEffect(() => {
    const markers: MapMarker[] = routePoints
      .filter(point => point.coordinates)
      .map((point, index) => ({
        id: point.id || `route-${index}`,
        position: [point.coordinates.lng, point.coordinates.lat],
        title: point.name || `第${index + 1}站`,
        content: point.description || `路线第${index + 1}个点`,
        onClick: () => {
          console.log('点击路线点:', point.name);
        }
      }));
    
    mapHook.setMarkers(markers);
  }, [routePoints, mapHook.setMarkers]);

  return mapHook;
}

export default useMap;