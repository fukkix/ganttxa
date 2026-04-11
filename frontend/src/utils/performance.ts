// 性能监控工具

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private timers: Map<string, number> = new Map()

  // 开始计时
  start(name: string) {
    this.timers.set(name, performance.now())
  }

  // 结束计时并记录
  end(name: string) {
    const startTime = this.timers.get(name)
    if (!startTime) {
      console.warn(`Performance timer "${name}" was not started`)
      return
    }

    const duration = performance.now() - startTime
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now()
    })

    this.timers.delete(name)

    // 开发环境下输出性能信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`)
    }

    return duration
  }

  // 获取所有指标
  getMetrics() {
    return [...this.metrics]
  }

  // 获取特定指标的统计信息
  getStats(name: string) {
    const filtered = this.metrics.filter(m => m.name === name)
    if (filtered.length === 0) return null

    const durations = filtered.map(m => m.duration)
    const sum = durations.reduce((a, b) => a + b, 0)
    const avg = sum / durations.length
    const min = Math.min(...durations)
    const max = Math.max(...durations)

    return {
      count: filtered.length,
      avg,
      min,
      max,
      total: sum
    }
  }

  // 清空指标
  clear() {
    this.metrics = []
    this.timers.clear()
  }

  // 导出性能报告
  exportReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      stats: {} as Record<string, any>
    }

    // 计算每个指标的统计信息
    const uniqueNames = [...new Set(this.metrics.map(m => m.name))]
    uniqueNames.forEach(name => {
      report.stats[name] = this.getStats(name)
    })

    return report
  }
}

// 单例实例
export const performanceMonitor = new PerformanceMonitor()

// 便捷函数
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  performanceMonitor.start(name)
  try {
    const result = fn()
    performanceMonitor.end(name)
    return result
  } catch (error) {
    performanceMonitor.end(name)
    throw error
  }
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  performanceMonitor.start(name)
  try {
    const result = await fn()
    performanceMonitor.end(name)
    return result
  } catch (error) {
    performanceMonitor.end(name)
    throw error
  }
}

// 监控 React 组件渲染性能
export function useRenderPerformance(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const renderStart = performance.now()
    
    return () => {
      const renderTime = performance.now() - renderStart
      if (renderTime > 16) { // 超过一帧的时间（60fps）
        console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms`)
      }
    }
  }
  
  return () => {}
}

// 首屏加载性能
export function measurePageLoad() {
  if (typeof window === 'undefined') return

  window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    if (perfData) {
      const metrics = {
        // DNS 查询时间
        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
        // TCP 连接时间
        tcp: perfData.connectEnd - perfData.connectStart,
        // 请求响应时间
        request: perfData.responseEnd - perfData.requestStart,
        // DOM 解析时间
        domParse: perfData.domInteractive - perfData.responseEnd,
        // 资源加载时间
        resourceLoad: perfData.loadEventStart - perfData.domContentLoadedEventEnd,
        // 总加载时间
        total: perfData.loadEventEnd - perfData.fetchStart,
        // 首次内容绘制
        fcp: 0,
        // 最大内容绘制
        lcp: 0
      }

      // 获取 FCP 和 LCP
      const paintEntries = performance.getEntriesByType('paint')
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime
      }

      // LCP 需要使用 PerformanceObserver
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime
        })
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // LCP 不支持
      }

      console.log('📊 Page Load Metrics:', metrics)
      
      // 性能评分
      if (metrics.total < 2500) {
        console.log('✅ 页面加载性能：优秀')
      } else if (metrics.total < 4000) {
        console.log('⚠️ 页面加载性能：良好')
      } else {
        console.log('❌ 页面加载性能：需要优化')
      }
    }
  })
}

// 内存使用监控
export function monitorMemory() {
  if (typeof window === 'undefined' || !(performance as any).memory) return

  const memory = (performance as any).memory
  const used = memory.usedJSHeapSize / 1048576 // MB
  const total = memory.totalJSHeapSize / 1048576 // MB
  const limit = memory.jsHeapSizeLimit / 1048576 // MB

  console.log(`💾 Memory: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB (Limit: ${limit.toFixed(2)}MB)`)

  if (used / limit > 0.9) {
    console.warn('⚠️ 内存使用率超过 90%，可能存在内存泄漏')
  }

  return { used, total, limit }
}
