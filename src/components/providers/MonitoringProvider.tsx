'use client';

import React, { useEffect } from 'react';
import { initMonitoring, errorTracker } from '@/lib/monitoring';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // 初始化监控系统
    initMonitoring();

    // 监听路由变化
    const handleRouteChange = () => {
      // 记录页面访问
      if (typeof window !== 'undefined') {
        const pageData = {
          url: window.location.href,
          title: document.title,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };
        
        // 这里可以发送页面访问数据到分析服务
        console.log('Page view:', pageData);
      }
    };

    // 监听页面加载完成
    if (typeof window !== 'undefined') {
      window.addEventListener('load', handleRouteChange);
      
      // 监听页面可见性变化
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('Page became visible');
        } else {
          console.log('Page became hidden');
        }
      });

      // 监听网络状态变化
      window.addEventListener('online', () => {
        console.log('Network connection restored');
      });

      window.addEventListener('offline', () => {
        errorTracker.captureError({
          message: 'Network connection lost',
          url: window.location.href,
          userAgent: navigator.userAgent,
          severity: 'medium',
          context: { type: 'network' }
        });
      });

      // 监听内存警告（如果支持）
      if ('memory' in performance) {
        const checkMemoryUsage = () => {
          const memory = (performance as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
          if (!memory) return;
          const usedMB = memory.usedJSHeapSize / 1024 / 1024;
          const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
          
          if (usedMB > limitMB * 0.9) {
            errorTracker.captureError({
              message: `High memory usage: ${usedMB.toFixed(1)}MB / ${limitMB.toFixed(1)}MB`,
              url: window.location.href,
              userAgent: navigator.userAgent,
              severity: 'medium',
              context: { 
                type: 'performance',
                memoryUsed: usedMB,
                memoryLimit: limitMB
              }
            });
          }
        };

        // 每30秒检查一次内存使用
        const memoryInterval = setInterval(checkMemoryUsage, 30000);
        
        return () => {
          clearInterval(memoryInterval);
        };
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', handleRouteChange);
      }
    };
  }, []);

  return <>{children}</>;
}

// 错误边界组件
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 捕获React错误并发送到监控系统
    errorTracker.captureError({
      message: `React Error: ${error.message}`,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      severity: 'high',
      context: {
        type: 'react',
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    });

    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                出现了一些问题
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                页面遇到了错误，我们已经记录了这个问题。请刷新页面重试。
              </p>
              <div className="mt-6">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 包装监控提供者和错误边界
export function MonitoringWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}