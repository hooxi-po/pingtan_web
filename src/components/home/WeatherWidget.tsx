'use client'

import React, { useState } from 'react'
import { Sun, Cloud, CloudRain, Wind, Droplets, Thermometer } from 'lucide-react'
import { useWeather } from '@/hooks/useWeather'
import { formatDateTimeLocale } from '@/lib/utils'

interface WeatherWidgetProps {
  city?: string
  adcode?: string
  className?: string
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  city = '平潭县',
  adcode = '350128',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const { weatherData, loading, error, refetch } = useWeather({ adcode })

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('晴')) return <Sun className="w-8 h-8 text-yellow-500" />
    if (weather.includes('雨')) return <CloudRain className="w-8 h-8 text-blue-500" />
    if (weather.includes('云') || weather.includes('阴') || weather.includes('多云')) return <Cloud className="w-8 h-8 text-gray-500" />
    return <Sun className="w-8 h-8 text-yellow-500" />
  }

  if (!isVisible) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="text-sm text-gray-600">天气组件已隐藏</div>
        <button
          className="mt-2 text-blue-500 hover:text-blue-600 text-sm"
          onClick={() => setIsVisible(true)}
        >显示组件</button>
      </div>
    )
  }

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
    )
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
          >重新获取</button>
          <button className="ml-3 text-gray-400 hover:text-gray-500 text-sm" onClick={() => setIsVisible(false)}>隐藏</button>
        </div>
      </div>
    )
  }

  if (!weatherData) return null

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{city}天气</h3>
        <div className="flex items-center space-x-2">
          {getWeatherIcon(weatherData.now.text)}
          <button className="text-gray-400 hover:text-gray-500 text-sm" onClick={() => setIsVisible(false)}>隐藏</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-red-500" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{weatherData.now.temp}°C</div>
            <div className="text-sm text-gray-600">{weatherData.now.text}</div>
            <div className="text-xs text-gray-500">体感 {weatherData.now.feels_like}°C</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">{weatherData.now.wind_dir} {weatherData.now.wind_class}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">湿度 {weatherData.now.rh}%</span>
          </div>
          {weatherData.now.aqi && (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-orange-400" />
              <span className="text-sm text-gray-600">AQI {weatherData.now.aqi}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">更新时间: {formatDateTimeLocale(weatherData.now.uptime, 'zh-CN')}</p>
        <div className="mt-2">
          <button
            onClick={refetch}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >刷新</button>
        </div>
      </div>
    </div>
  )
}

export default WeatherWidget