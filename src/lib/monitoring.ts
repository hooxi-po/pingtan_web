/**
 * 监控和错误追踪配置
 * 用于应用性能监控和错误报告
 */

// 性能监控配置
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  renderTime: number;
  memoryUsage: number;
  errorCount: number;
}

// 错误类型定义
export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

// 性能监控类
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100;

  // 记录页面加载时间
  recordPageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      this.addMetric({
        pageLoadTime: loadTime,
        apiResponseTime: 0,
        renderTime: 0,
        memoryUsage: this.getMemoryUsage(),
        errorCount: 0
      });
    });
  }

  // 记录API响应时间
  recordApiCall(startTime: number, endTime: number): void {
    const responseTime = endTime - startTime;
    
    this.addMetric({
      pageLoadTime: 0,
      apiResponseTime: responseTime,
      renderTime: 0,
      memoryUsage: this.getMemoryUsage(),
      errorCount: 0
    });
  }

  // 记录渲染时间
  recordRenderTime(componentName: string, renderTime: number): void {
    this.addMetric({
      pageLoadTime: 0,
      apiResponseTime: 0,
      renderTime: renderTime,
      memoryUsage: this.getMemoryUsage(),
      errorCount: 0
    });

    // 如果渲染时间过长，发出警告
    if (renderTime > 1000) {
      console.warn(`Slow render detected for ${componentName}: ${renderTime}ms`);
    }
  }

  // 获取内存使用情况
  private getMemoryUsage(): number {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return 0;
    }
    
    const memory = (performance as { memory?: { usedJSHeapSize: number } }).memory;
    return memory.usedJSHeapSize / 1024 / 1024; // MB
  }

  // 添加指标
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 保持最大数量限制
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  // 获取性能统计
  getStats(): {
    avgPageLoadTime: number;
    avgApiResponseTime: number;
    avgRenderTime: number;
    avgMemoryUsage: number;
    totalErrors: number;
  } {
    if (this.metrics.length === 0) {
      return {
        avgPageLoadTime: 0,
        avgApiResponseTime: 0,
        avgRenderTime: 0,
        avgMemoryUsage: 0,
        totalErrors: 0
      };
    }

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        pageLoadTime: acc.pageLoadTime + metric.pageLoadTime,
        apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        errorCount: acc.errorCount + metric.errorCount
      }),
      { pageLoadTime: 0, apiResponseTime: 0, renderTime: 0, memoryUsage: 0, errorCount: 0 }
    );

    const count = this.metrics.length;
    return {
      avgPageLoadTime: totals.pageLoadTime / count,
      avgApiResponseTime: totals.apiResponseTime / count,
      avgRenderTime: totals.renderTime / count,
      avgMemoryUsage: totals.memoryUsage / count,
      totalErrors: totals.errorCount
    };
  }
}

// 错误追踪类
class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 50;

  // 初始化错误监听
  init(): void {
    if (typeof window === 'undefined') return;

    // 监听JavaScript错误
    window.addEventListener('error', (event) => {
      // 过滤掉图片加载失败等资源错误
      if (event.target && (event.target as HTMLElement).tagName === 'IMG') {
        return; // 忽略图片加载错误
      }
      
      // 过滤掉空的错误消息
      if (!event.message || event.message.trim() === '') {
        return;
      }
      
      this.captureError({
        id: this.generateId(),
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'high'
      });
    });

    // 监听Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        id: this.generateId(),
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        severity: 'medium'
      });
    });
  }

  // 手动捕获错误
  captureError(error: Omit<ErrorReport, 'id' | 'timestamp'> & { id?: string; timestamp?: number }): void {
    const errorReport: ErrorReport = {
      id: error.id || this.generateId(),
      timestamp: error.timestamp || Date.now(),
      ...error
    };

    this.errors.push(errorReport);

    // 保持最大数量限制
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 发送到监控服务（如果配置了）
    this.sendToMonitoringService(errorReport);

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      // 只输出有意义的错误信息，过滤掉图片加载失败、空错误对象等无用错误
      if (errorReport.message && 
          errorReport.message.trim() !== '' && 
          errorReport.message !== 'Script error.' &&
          !errorReport.message.includes('The requested resource isn\'t a valid image') &&
          !(Object.keys(errorReport).length <= 3 && !errorReport.stack)) {
        console.error('Error captured:', errorReport);
      }
    }
  }

  // 发送到监控服务
  private async sendToMonitoringService(error: ErrorReport): Promise<void> {
    try {
      // 这里可以集成Sentry、LogRocket等监控服务
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry集成示例
        // Sentry.captureException(new Error(error.message), {
        //   extra: error.context,
        //   tags: { severity: error.severity }
        // });
      }

      // 或者发送到自定义API
      if (process.env.NEXT_PUBLIC_MONITORING_API) {
        await fetch('/api/monitoring/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error)
        });
      }
    } catch (e) {
      console.error('Failed to send error to monitoring service:', e);
    }
  }

  // 生成错误ID
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // 获取错误统计
  getErrorStats(): {
    totalErrors: number;
    errorsBySeverity: Record<string, number>;
    recentErrors: ErrorReport[];
  } {
    const errorsBySeverity = this.errors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalErrors: this.errors.length,
      errorsBySeverity,
      recentErrors: this.errors.slice(-10) // 最近10个错误
    };
  }
}

// 全局实例
export const performanceMonitor = new PerformanceMonitor();
export const errorTracker = new ErrorTracker();

// 初始化监控
export function initMonitoring(): void {
  if (typeof window === 'undefined') return;

  performanceMonitor.recordPageLoad();
  errorTracker.init();

  // 定期发送性能数据
  setInterval(() => {
    const stats = performanceMonitor.getStats();
    const errorStats = errorTracker.getErrorStats();
    
    // 发送到监控服务
    if (process.env.NEXT_PUBLIC_MONITORING_API) {
      fetch('/api/monitoring/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ performance: stats, errors: errorStats })
      }).catch(console.error);
    }
  }, 60000); // 每分钟发送一次
}

// API调用监控装饰器
export function withApiMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  apiName: string
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    
    try {
      const result = await fn(...args);
      const endTime = performance.now();
      
      performanceMonitor.recordApiCall(startTime, endTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      performanceMonitor.recordApiCall(startTime, endTime);
      
      errorTracker.captureError({
        message: `API Error in ${apiName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stack: error instanceof Error ? error.stack : undefined,
        url: window.location.href,
        userAgent: navigator.userAgent,
        severity: 'high',
        context: { apiName, args }
      });
      
      throw error;
    }
  }) as T;
}

// React组件渲染监控Hook
export function useRenderMonitoring(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    performanceMonitor.recordRenderTime(componentName, endTime - startTime);
  };
}

// 获取监控仪表板数据
export function getMonitoringDashboard() {
  return {
    performance: performanceMonitor.getStats(),
    errors: errorTracker.getErrorStats(),
    timestamp: Date.now()
  };
}