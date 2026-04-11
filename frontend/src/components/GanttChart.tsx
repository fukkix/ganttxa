import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from 'react'
import { useProjectStore } from '../store/projectStore'
import {
  dateToX,
  calculateTaskWidth,
  getDateRange,
  generateTimelineLabels,
  getPhaseColor,
  DEFAULT_DIMENSIONS,
} from '../utils/ganttRenderer'
import dayjs from 'dayjs'

interface VisibleRange {
  startIndex: number
  endIndex: number
  offsetY: number
}

const GanttChart = forwardRef<HTMLCanvasElement>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { tasks, ganttConfig } = useProjectStore()
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 })
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    startIndex: 0,
    endIndex: 0,
    offsetY: 0,
  })

  // 暴露 canvas ref 给父组件
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  // 计算可见任务范围（虚拟化）
  const calculateVisibleRange = useCallback(
    (scrollY: number, containerHeight: number): VisibleRange => {
      const { rowHeight, headerHeight } = DEFAULT_DIMENSIONS
      const buffer = 5 // 额外渲染的任务数量（上下各5个）

      const startIndex = Math.max(0, Math.floor((scrollY - headerHeight) / rowHeight) - buffer)
      const visibleCount = Math.ceil(containerHeight / rowHeight) + buffer * 2
      const endIndex = Math.min(tasks.length, startIndex + visibleCount)

      return {
        startIndex,
        endIndex,
        offsetY: startIndex * rowHeight,
      }
    },
    [tasks.length]
  )

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth
        const newHeight = Math.max(
          containerRef.current.clientHeight,
          tasks.length * DEFAULT_DIMENSIONS.rowHeight + DEFAULT_DIMENSIONS.headerHeight + 50
        )
        setDimensions({ width: newWidth, height: newHeight })

        // 更新可见范围
        const range = calculateVisibleRange(scrollPosition.y, containerRef.current.clientHeight)
        setVisibleRange(range)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [tasks.length, scrollPosition.y, calculateVisibleRange])

  // 处理滚动事件
  const handleScroll = useCallback(
    (e: Event) => {
      const target = e.target as HTMLDivElement
      const newScrollY = target.scrollTop
      const newScrollX = target.scrollLeft

      setScrollPosition({ x: newScrollX, y: newScrollY })

      // 更新可见范围
      const range = calculateVisibleRange(newScrollY, target.clientHeight)
      setVisibleRange(range)
    },
    [calculateVisibleRange]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置高 DPI 显示
    const dpr = window.devicePixelRatio || 1
    const displayWidth = dimensions.width
    const displayHeight = containerRef.current?.clientHeight || 600

    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    ctx.scale(dpr, dpr)

    // 清空画布
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    if (tasks.length === 0) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('暂无任务，请添加任务', displayWidth / 2, displayHeight / 2)
      return
    }

    const { start: projectStart, end: projectEnd } = getDateRange(tasks)
    const timelineLabels = generateTimelineLabels(projectStart, projectEnd, ganttConfig.timeScale)

    // 绘制背景
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, displayWidth, displayHeight)

    // 绘制时间轴
    drawTimeline(ctx, timelineLabels, projectStart, displayWidth, displayHeight)

    // 绘制周末背景
    if (ganttConfig.showWeekends) {
      drawWeekends(ctx, projectStart, projectEnd, displayWidth, displayHeight)
    }

    // 绘制今日线
    drawTodayLine(ctx, projectStart, displayHeight)

    // 仅绘制可见范围内的任务（虚拟化）
    const visibleTasks = tasks.slice(visibleRange.startIndex, visibleRange.endIndex)
    drawTasks(ctx, visibleTasks, projectStart, visibleRange.startIndex, scrollPosition.y)
  }, [tasks, ganttConfig, dimensions, visibleRange, scrollPosition])

  const drawTimeline = (
    ctx: CanvasRenderingContext2D,
    labels: Array<{ date: string; label: string }>,
    startDate: string,
    width: number,
    height: number
  ) => {
    const { headerHeight } = DEFAULT_DIMENSIONS

    // 绘制表头背景
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, width, headerHeight)

    // 绘制左侧面板表头
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('任务名称', 10, 30)

    // 绘制时间标签
    ctx.fillStyle = '#374151'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'

    labels.forEach(({ date, label }) => {
      const x = dateToX(date, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)
      
      // 绘制垂直网格线
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, headerHeight)
      ctx.lineTo(x, height)
      ctx.stroke()

      // 绘制日期标签
      ctx.fillText(label, x + 20, 35)
    })

    // 绘制表头底部边框
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, headerHeight)
    ctx.lineTo(width, headerHeight)
    ctx.stroke()
  }

  const drawWeekends = (
    ctx: CanvasRenderingContext2D,
    startDate: string,
    endDate: string,
    width: number,
    height: number
  ) => {
    const { headerHeight } = DEFAULT_DIMENSIONS
    let current = dayjs(startDate)
    const end = dayjs(endDate)

    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)'

    while (current.isBefore(end) || current.isSame(end)) {
      const dayOfWeek = current.day()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // 周日或周六
        const x = dateToX(current.format('YYYY-MM-DD'), startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)
        const dayWidth = (DEFAULT_DIMENSIONS.dayWidth * ganttConfig.zoom) / 100
        ctx.fillRect(x, headerHeight, dayWidth, height - headerHeight)
      }
      current = current.add(1, 'day')
    }
  }

  const drawTodayLine = (ctx: CanvasRenderingContext2D, startDate: string, height: number) => {
    const today = dayjs().format('YYYY-MM-DD')
    const x = dateToX(today, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)

    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(x, DEFAULT_DIMENSIONS.headerHeight)
    ctx.lineTo(x, height)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.lineWidth = 1
  }

  const drawTasks = (
    ctx: CanvasRenderingContext2D,
    visibleTasks: any[],
    startDate: string,
    startIndex: number,
    scrollY: number
  ) => {
    const { rowHeight, headerHeight } = DEFAULT_DIMENSIONS

    visibleTasks.forEach((task, relativeIndex) => {
      const absoluteIndex = startIndex + relativeIndex
      const y = headerHeight + absoluteIndex * rowHeight + 10 - scrollY

      // 绘制任务名称（左侧面板）
      ctx.fillStyle = '#1f2937'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(
        task.name.length > 20 ? task.name.substring(0, 20) + '...' : task.name,
        10,
        y + 20
      )

      // 绘制任务条
      const x = dateToX(task.startDate, startDate, DEFAULT_DIMENSIONS, ganttConfig.zoom)
      const width = calculateTaskWidth(
        task.startDate,
        task.endDate,
        DEFAULT_DIMENSIONS,
        ganttConfig.zoom
      )

      const color = getPhaseColor(task.phase, ganttConfig.colorScheme)

      if (task.isMilestone) {
        // 绘制里程碑（菱形）
        drawDiamond(ctx, x, y + 15, 20, color)
      } else {
        // 绘制普通任务条（圆角矩形）
        const radius = 6
        ctx.fillStyle = color
        roundRect(ctx, x, y, width, 30, radius)
        ctx.fill()

        // 绘制任务条边框
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = 1
        roundRect(ctx, x, y, width, 30, radius)
        ctx.stroke()

        // 绘制任务名称（任务条内）
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Inter, sans-serif'
        ctx.textAlign = 'left'
        const taskLabel = task.name.length > 15 ? task.name.substring(0, 15) + '...' : task.name
        ctx.fillText(taskLabel, x + 8, y + 20)

        // 绘制进度条（如果有进度）
        if (task.progress > 0) {
          const progressWidth = (width * task.progress) / 100
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
          roundRect(ctx, x, y, progressWidth, 30, radius)
          ctx.fill()
        }
      }
    })
  }

  const roundRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  const drawDiamond = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: string
  ) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y - size / 2)
    ctx.lineTo(x + size / 2, y)
    ctx.lineTo(x, y + size / 2)
    ctx.lineTo(x - size / 2, y)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-auto bg-surface rounded-2xl shadow-ambient"
      style={{ position: 'relative' }}
    >
      <div style={{ height: dimensions.height, width: dimensions.width }}>
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          style={{ position: 'sticky', top: 0, left: 0 }}
        />
      </div>
    </div>
  )
})

GanttChart.displayName = 'GanttChart'

export default GanttChart
