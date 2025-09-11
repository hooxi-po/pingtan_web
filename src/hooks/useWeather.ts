'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface WeatherData {
  location: {
    country: string;
    province: string;
    city: string;
    name: string;
    id: string;
  };
  now: {
    temp: number;
    feels_like: number;
    rh: number;
    wind_class: string;
    wind_dir: string;
    text: string;
    prec_1h: number;
    clouds: number;
    vis: number;
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    o3: number;
    co: number;
    uptime: string;
  };
  indexes?: Array<{ name: string; brief: string; detail: string }>;
  alerts?: Array<{ type: string; level: string; title: string; desc: string }>;
  forecasts?: Array<{
    date: string;
    week: string;
    high: number;
    low: number;
    wc_day: string;
    wc_night: string;
    wd_day: string;
    wd_night: string;
    text_day: string;
    text_night: string;
    aqi: number;
  }>;
}

export interface UseWeatherParams {
  adcode: string; // 城市/区域代码
  city?: string;  // 仅用于展示
}

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWeather({ adcode }: UseWeatherParams): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchWeather = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/weather?city=${encodeURIComponent(adcode)}&extensions=all`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 0 && data.result) {
        setWeatherData(data.result as WeatherData);
      } else {
        throw new Error(data.message || '获取天气数据失败');
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return; // 被取消时忽略错误
      console.error('获取天气数据失败:', err);
      setError(err instanceof Error ? err.message : '获取天气数据失败');
    } finally {
      setLoading(false);
    }
  }, [adcode]);

  useEffect(() => {
    fetchWeather();
    return () => abortRef.current?.abort();
  }, [fetchWeather]);

  return { weatherData, loading, error, refetch: fetchWeather };
}