'use client';

import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react';
import { useWeather } from '@/hooks/useWeather';
import { formatDateTimeLocale } from '@/lib/utils';

interface WeatherWidgetProps {
  city?: string;
  adcode?: string;
  className?: string;
}

export default function WeatherWidget({ 
  adcode = '350128', // 平潭县的行政区划代码
  className = '' 
}: WeatherWidgetProps) {
  const { weatherData, loading, error, refetch } = useWeather({ adcode });

  // 获取天气图标
  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴')) {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    } else if (weather.includes('雨')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    } else if (weather.includes('云') || weather.includes('阴') || weather.includes('多云')) {
      return <Cloud className="w-8 h-8 text-gray-500" />;
    } else {
      return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <Cloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={refetch}
            className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          >
            重新获取
          </button>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {weatherData.location.city}天气
        </h3>
        <div className="flex items-center space-x-1">
          {getWeatherIcon(weatherData.now.text)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* 温度和天气 */}
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {weatherData.now.temp}°C
            </div>
            <div className="text-sm text-gray-600">
              {weatherData.now.text}
            </div>
            <div className="text-xs text-gray-500">
              体感 {weatherData.now.feels_like}°C
            </div>
          </div>
        </div>
        
        {/* 风力和湿度 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {weatherData.now.wind_dir} {weatherData.now.wind_class}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              湿度 {weatherData.now.rh}%
            </span>
          </div>
          {weatherData.now.aqi && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-400"></div>
              <span className="text-sm text-gray-600">
                AQI {weatherData.now.aqi}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          更新时间: {formatDateTimeLocale(weatherData.now.uptime, 'zh-CN')}
        </p>
      </div>
    </div>
  );
}

// 导出天气工具函数保持不变
export const weatherUtils = {
  getWeatherAdvice: (weather: string, temperature: number): string => {
    if (weather.includes('雨')) {
      return '今日有雨，建议携带雨具，注意安全。';
    } else if (temperature > 30) {
      return '天气炎热，注意防晒和补水。';
    } else if (temperature < 10) {
      return '天气较冷，注意保暖。';
    } else if (weather.includes('晴')) {
      return '天气晴朗，适合户外活动。';
    } else {
      return '天气适宜，祝您旅途愉快！';
    }
  },
  getTourismAdvice: (weather: string, windpower: string): string[] => {
    const activities: string[] = [];
    if (weather.includes('晴')) {
      activities.push('海滨浴场游泳', '石牌洋观光', '龙凤头海滩漫步');
    }
    if (!weather.includes('雨') && !windpower.includes('≥6')) {
      activities.push('坛南湾风景区', '海坛古城游览');
    }
    if (weather.includes('云') && !weather.includes('雨')) {
      activities.push('北港村摄影', '猴岩景点观光');
    }
    return activities.length > 0 ? activities : ['室内景点参观', '美食品尝'];
  }
};