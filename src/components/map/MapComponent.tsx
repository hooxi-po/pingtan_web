'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, RefreshCw, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { escapeHTML } from '@/lib/utils';

// 百度地图类型定义
declare global {
  interface Window {
    BMapGL: unknown;
    BMAP_COORD_GCJ02: unknown;
    initBaiduMap?: () => void;
  }
}

// 地图标记点接口
interface MapMarker {
  id: string;
  position: [number, number]; // [lng, lat]
  title: string;
  content?: string;
  icon?: string;
  type?: string;
  rating?: number;
  bestTime?: string;
  features?: string[];
  onClick?: () => void;
}

// 地图配置接口
interface MapConfig {
  center: [number, number]; // [lng, lat]
  zoom: number;
  enableRotate?: boolean;
  enableTilt?: boolean;
  enableScrollWheelZoom?: boolean;
  enableDoubleClickZoom?: boolean;
  enableKeyboard?: boolean;
  enableDragging?: boolean;
  heading?: number;
  tilt?: number;
}

// 组件属性接口
interface MapComponentProps {
  config?: Partial<MapConfig>;
  markers?: MapMarker[];
  height?: string;
  width?: string;
  className?: string;
  showControls?: boolean;
  showScale?: boolean;
  showOverview?: boolean;
  onMapReady?: (map: unknown) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  onMapClick?: (event: unknown) => void;
  style?: React.CSSProperties;
}

// 默认配置
const DEFAULT_CONFIG: MapConfig = {
  center: [119.7906, 25.4444], // 平潭岛中心坐标
  zoom: 12,
  enableRotate: true,
  enableTilt: true,
  enableScrollWheelZoom: true,
  enableDoubleClickZoom: true,
  enableKeyboard: true,
  enableDragging: true,
  heading: 0,
  tilt: 0
};

// 地图加载状态枚举
enum MapLoadState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error'
}

// 自定义Hook：地图脚本加载
function useMapScript() {
  const [loadState, setLoadState] = useState<MapLoadState>(MapLoadState.IDLE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 检查是否已经加载
    if (window.BMapGL) {
      setLoadState(MapLoadState.LOADED);
      return;
    }

    // 检查是否正在加载
    if (loadState === MapLoadState.LOADING) {
      return;
    }

    setLoadState(MapLoadState.LOADING);
    setError(null);

    const loadScript = async () => {
      try {
        // 获取API密钥
        const apiKey = process.env.NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY || 'KeKO6RjV3PJ4a0ym1KimCO8yZpW2OkSu';
        if (!apiKey) {
          throw new Error('百度地图API密钥未配置，请在环境变量中设置NEXT_PUBLIC_BAIDU_MAP_JS_API_KEY');
        }

        // 创建脚本标签
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${apiKey}&callback=initBaiduMap`;
        script.async = true;

        // 设置全局回调函数
        window.initBaiduMap = () => {
          if (window.BMapGL) {
            setLoadState(MapLoadState.LOADED);
            console.log('百度地图API加载成功');
          } else {
            throw new Error('百度地图API加载失败：BMapGL对象未找到');
          }
        };

        // 处理加载错误
        script.onerror = () => {
          setLoadState(MapLoadState.ERROR);
          setError('百度地图API脚本加载失败，请检查网络连接');
        };

        // 添加脚本到页面
        document.head.appendChild(script);

        // 设置超时
        setTimeout(() => {
          if (loadState === MapLoadState.LOADING) {
            setLoadState(MapLoadState.ERROR);
            setError('百度地图API加载超时，请刷新页面重试');
          }
        }, 10000);

      } catch (err) {
        setLoadState(MapLoadState.ERROR);
        setError(err instanceof Error ? err.message : '未知错误');
      }
    };

    loadScript();
  }, [loadState]);

  return { loadState, error };
}

// 主组件
export default function MapComponent({
  config = {},
  markers = [],
  height = '400px',
  width = '100%',
  className = '',
  showControls = true,
  showScale = true,
  showOverview = false,
  onMapReady,
  onMarkerClick,
  onMapClick,
  style
}: MapComponentProps) {
  // 状态管理
  const [mapInstance, setMapInstance] = useState<unknown>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(DEFAULT_CONFIG.center);
  const [currentZoom, setCurrentZoom] = useState<number>(DEFAULT_CONFIG.zoom);
  
  // Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<unknown[]>([]);
  const infoWindowRef = useRef<unknown>(null);

  // 合并配置
  const mapConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  // 使用地图脚本加载Hook
  const { loadState, error } = useMapScript();

  // 清理标记点
  const clearMarkers = useCallback(() => {
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => {
        if (mapInstance) {
          mapInstance.removeOverlay(marker);
        }
      });
      markersRef.current = [];
    }
  }, [mapInstance]);

  // 创建标记点
  const createMarkers = useCallback(() => {
    if (!mapInstance || !window.BMapGL) return;

    clearMarkers();

    markers.forEach(markerData => {
      try {
        const point = new window.BMapGL.Point(markerData.position[0], markerData.position[1]);
        
        // 创建自定义图标
        let iconUrl = '/images/map-markers/default.svg';
        if (markerData.icon) {
          iconUrl = markerData.icon;
        } else {
          // 根据类型设置默认图标
          const typeIconMap: { [key: string]: string } = {
            'beach': '/images/map-markers/beach.svg',
            'viewpoint': '/images/map-markers/viewpoint.svg', 
            'wild': '/images/map-markers/wild.svg',
            'dock': '/images/map-markers/dock.svg',
            'scenic': '/images/map-markers/scenic.svg'
          };
          iconUrl = typeIconMap[markerData.type || 'default'] || '/images/map-markers/default.svg';
        }
        
        const icon = new window.BMapGL.Icon(
          iconUrl,
          new window.BMapGL.Size(32, 32),
          {
            anchor: new window.BMapGL.Size(16, 32),
            imageSize: new window.BMapGL.Size(32, 32)
          }
        );
        
        const marker = new window.BMapGL.Marker(point, { icon });

        // 添加点击事件
        marker.addEventListener('click', () => {
          // 创建信息窗口
          if (infoWindowRef.current) {
            mapInstance.closeInfoWindow(infoWindowRef.current);
          }

          // 预处理并转义动态内容，防止 XSS
          const safeTitle = escapeHTML(markerData.title);
          const safeContent = markerData.content ? escapeHTML(markerData.content) : '';
          const safeRating = typeof markerData.rating === 'number' ? String(markerData.rating) : '';
          const safeBestTime = markerData.bestTime ? escapeHTML(markerData.bestTime) : '';
          const safeFeatures = (markerData.features || []).map(f => escapeHTML(f));
          const safeId = encodeURIComponent(markerData.id);

          // 构建更丰富的信息窗口内容（使用已转义的安全变量）
          const infoContent = `
            <div style="padding: 12px; min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="margin-bottom: 8px;">
                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; line-height: 1.3;">${safeTitle}</h4>
              </div>
              
              ${safeContent ? `
                <div style="margin-bottom: 10px;">
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${safeContent}</p>
                </div>
              ` : ''}
              
              ${safeRating ? `
                <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                  <span style="color: #f59e0b; font-size: 14px;">★</span>
                  <span style="font-size: 13px; font-weight: 500; color: #374151;">${safeRating}</span>
                  <span style="font-size: 12px; color: #9ca3af;">评分</span>
                </div>
              ` : ''}
              
              ${safeBestTime ? `
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #6b7280;">🌙 最佳观赏时间：</span>
                  <span style="font-size: 12px; color: #374151; font-weight: 500;">${safeBestTime}</span>
                </div>
              ` : ''}
              
              ${safeFeatures.length > 0 ? `
                <div style="margin-bottom: 10px;">
                  <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                    ${safeFeatures.slice(0, 3).map(feature => 
                      `<span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">${feature}</span>`
                    ).join('')}
                  </div>
                </div>
              ` : ''}
              
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <button 
                  onclick="window.open('/blue-tears/${safeId}', '_blank')" 
                  style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;"
                  onmouseover="this.style.background='#2563eb'"
                  onmouseout="this.style.background='#3b82f6'"
                >
                  查看详情
                </button>
              </div>
            </div>
          `;

          const infoWindow = new window.BMapGL.InfoWindow(infoContent, {
            width: 320,
            height: 180,
            title: ''
          });

          mapInstance.openInfoWindow(infoWindow, point);
          infoWindowRef.current = infoWindow;

          // 触发外部回调
          if (onMarkerClick) {
            onMarkerClick(markerData);
          }
          if (markerData.onClick) {
            markerData.onClick();
          }
        });

        mapInstance.addOverlay(marker);
        markersRef.current.push(marker);
      } catch (err) {
        console.error('创建标记点失败:', err);
      }
    });
  }, [mapInstance, markers, onMarkerClick, clearMarkers]);

  // 初始化地图
  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current || !window.BMapGL || mapInstance) return;

    try {
      // 创建地图实例
      const map = new window.BMapGL.Map(mapContainerRef.current, {
        enableRotate: mapConfig.enableRotate,
        enableTilt: mapConfig.enableTilt
      });

      // 设置中心点和缩放级别
      const point = new window.BMapGL.Point(mapConfig.center[0], mapConfig.center[1]);
      map.centerAndZoom(point, mapConfig.zoom);

      // 设置地图选项
      if (mapConfig.enableScrollWheelZoom) map.enableScrollWheelZoom();
      if (mapConfig.enableDoubleClickZoom) map.enableDoubleClickZoom();
      if (mapConfig.enableKeyboard) map.enableKeyboard();
      if (mapConfig.enableDragging) map.enableDragging();

      // 设置旋转和倾斜角度
      if (mapConfig.heading) map.setHeading(mapConfig.heading);
      if (mapConfig.tilt) map.setTilt(mapConfig.tilt);

      // 添加控件
      if (showControls) {
        map.addControl(new window.BMapGL.NavigationControl3D());
        map.addControl(new window.BMapGL.ZoomControl());
      }
      if (showScale) {
        map.addControl(new window.BMapGL.ScaleControl());
      }
      if (showOverview) {
        map.addControl(new window.BMapGL.OverviewMapControl());
      }

      // 添加地图事件监听
      map.addEventListener('click', (e: unknown) => {
        if (onMapClick) {
          onMapClick(e);
        }
      });

      map.addEventListener('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

      map.addEventListener('moveend', () => {
        const center = map.getCenter();
        setCurrentCenter([center.lng, center.lat]);
      });

      setMapInstance(map);
      setCurrentCenter(mapConfig.center);
      setCurrentZoom(mapConfig.zoom);

      // 触发外部回调
      if (onMapReady) {
        onMapReady(map);
      }

      console.log('地图初始化成功');
    } catch (err) {
      console.error('地图初始化失败:', err);
    }
  }, [mapConfig, showControls, showScale, showOverview, onMapReady, onMapClick, mapInstance]);

  // 重新加载地图
  const reloadMap = useCallback(() => {
    if (mapInstance) {
      clearMarkers();
      setMapInstance(null);
    }
    setTimeout(() => {
      initializeMap();
    }, 100);
  }, [mapInstance, clearMarkers, initializeMap]);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // 地图加载完成后初始化
  useEffect(() => {
    if (loadState === MapLoadState.LOADED) {
      initializeMap();
    }
  }, [loadState, initializeMap]);

  // 标记点变化时重新创建
  useEffect(() => {
    if (mapInstance) {
      createMarkers();
    }
  }, [mapInstance, createMarkers]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current && mapInstance) {
        mapInstance.closeInfoWindow(infoWindowRef.current);
      }
    };
  }, [clearMarkers, mapInstance]);

  // 渲染加载状态
  if (loadState === MapLoadState.LOADING) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height, width, ...style }}>
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">正在加载地图...</p>
        </div>
      </Card>
    );
  }

  // 渲染错误状态
  if (loadState === MapLoadState.ERROR || error) {
    return (
      <Card className={`${className} flex items-center justify-center`} style={{ height, width, ...style }}>
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <div>
            <p className="text-red-600 font-medium">地图加载失败</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <button
              onClick={reloadMap}
              className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // 渲染地图
  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <Card className={className} style={isFullscreen ? { height: '100vh', width: '100vw' } : { height, width, ...style }}>
        {/* 地图容器 */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-full relative"
          style={{ minHeight: '200px' }}
        />
        
        {/* 地图信息覆盖层 */}
        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-sm text-xs text-gray-700">
          <div className="flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>
              百度地图GL | 中心: {currentCenter[0].toFixed(4)}, {currentCenter[1].toFixed(4)} | 缩放: {currentZoom}
            </span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={toggleFullscreen}
            className="bg-white bg-opacity-90 p-2 rounded-md shadow-sm hover:bg-opacity-100 transition-all"
            title={isFullscreen ? '退出全屏' : '全屏显示'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={reloadMap}
            className="bg-white bg-opacity-90 p-2 rounded-md shadow-sm hover:bg-opacity-100 transition-all"
            title="重新加载地图"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

// 导出类型
export type { MapComponentProps, MapMarker, MapConfig };