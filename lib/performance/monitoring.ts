/**
 * Performance monitoring and tracking
 */

import React from 'react';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 1000; // 1 second
  private readonly MAX_METRICS = 100;

  /**
   * Track page load time
   */
  trackPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    // Use Performance API
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      this.addMetric('page_load', perfData.loadEventEnd - perfData.fetchStart, {
        page: pageName,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
      });

      // Log slow pages in development
      const loadTime = perfData.loadEventEnd - perfData.fetchStart;
      if (process.env.NODE_ENV === 'development' && loadTime > 3000) {
        console.warn(`⚠️ Slow page load: ${pageName} (${loadTime.toFixed(0)}ms)`);
      }
    });
  }

  /**
   * Track API response time
   */
  trackAPICall(endpoint: string, startTime: number, success: boolean): void {
    const duration = performance.now() - startTime;
    
    this.addMetric('api_call', duration, {
      endpoint,
      success,
    });

    // Log slow API calls
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      console.warn(`⚠️ Slow API call: ${endpoint} (${duration.toFixed(0)}ms)`);
    }
  }

  /**
   * Track database query time
   */
  trackQuery(queryName: string, startTime: number): void {
    const duration = performance.now() - startTime;
    
    this.addMetric('db_query', duration, {
      query: queryName,
    });

    // Log slow queries
    if (duration > this.SLOW_QUERY_THRESHOLD) {
      console.warn(`⚠️ Slow query: ${queryName} (${duration.toFixed(0)}ms)`);
    }
  }

  /**
   * Track custom metric
   */
  trackCustom(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.addMetric(name, value, metadata);
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): void {
    if (typeof window === 'undefined') return;

    // First Contentful Paint (FCP)
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcp) {
      this.addMetric('fcp', fcp.startTime);
    }

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.addMetric('lcp', lastEntry.startTime);
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Older browsers might not support this
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.addMetric('cls', clsValue);
    });
    
    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Older browsers might not support this
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const fidEntry = list.getEntries()[0] as PerformanceEntry & { processingStart: number };
      if (fidEntry) this.addMetric('fid', fidEntry.processingStart - fidEntry.startTime);
    });
    
    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Older browsers might not support this
    }
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { values: number[]; count: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [], count: 0 };
      }
      summary[metric.name].values.push(metric.value);
      summary[metric.name].count++;
    });

    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    Object.entries(summary).forEach(([name, data]) => {
      result[name] = {
        avg: data.values.reduce((a, b) => a + b, 0) / data.values.length,
        min: Math.min(...data.values),
        max: Math.max(...data.values),
        count: data.count,
      };
    });

    return result;
  }

  /**
   * Log performance summary to console (development)
   */
  logSummary(): void {
    if (process.env.NODE_ENV !== 'development') return;

    const summary = this.getSummary();
    console.table(
      Object.entries(summary).map(([name, stats]) => ({
        Metric: name,
        'Avg (ms)': stats.avg.toFixed(0),
        'Min (ms)': stats.min.toFixed(0),
        'Max (ms)': stats.max.toFixed(0),
        Count: stats.count,
      }))
    );
  }

  /**
   * Add metric to collection
   */
  private addMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      metadata,
    });

    // Keep only last MAX_METRICS
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value, metadata);
    }
  }

  /**
   * Send metric to analytics service
   */
  private sendToAnalytics(name: string, value: number, metadata?: Record<string, unknown>): void {
    // Integrate with your analytics service
    // Example: Google Analytics, Vercel Analytics, etc.
    
    // For Vercel Analytics:
    const win = typeof window !== 'undefined' ? window : null;
    const va = win && 'va' in win ? (win as Window & { va: (action: string, name: string, data?: object) => void }).va : null;
    if (va) va('track', name, { value, ...metadata });
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOC to track component render time
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      const startTime = performance.now();
      return () => {
        const renderTime = performance.now() - startTime;
        performanceMonitor.trackCustom('component_render', renderTime, {
          component: componentName,
        });
      };
    }, []);

    return React.createElement(Component, props);
  };
}

/**
 * Hook to track fetch/API calls
 */
export function usePerformanceTracking(endpoint: string) {
  const startTracking = () => performance.now();
  
  const endTracking = (startTime: number, success: boolean = true) => {
    performanceMonitor.trackAPICall(endpoint, startTime, success);
  };

  return { startTracking, endTracking };
}

