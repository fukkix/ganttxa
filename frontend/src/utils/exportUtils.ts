import { Task } from '../types'

// 导出为 PNG
export async function exportToPNG(canvasElement: HTMLCanvasElement, filename: string = 'gantt-chart.png') {
  try {
    // 创建高分辨率 canvas（2x）
    const scale = 2
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('无法创建 canvas 上下文')
    }

    tempCanvas.width = canvasElement.width * scale
    tempCanvas.height = canvasElement.height * scale
    
    // 绘制白色背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // 缩放并绘制原始 canvas
    ctx.scale(scale, scale)
    ctx.drawImage(canvasElement, 0, 0)

    // 转换为 blob 并下载
    tempCanvas.toBlob(blob => {
      if (!blob) {
        throw new Error('无法生成图片')
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  } catch (error) {
    console.error('导出 PNG 失败:', error)
    throw error
  }
}

// 导出为 CSV
export function exportToCSV(tasks: Task[], filename: string = 'tasks.csv') {
  try {
    // CSV 表头
    const headers = ['任务名称', '阶段', '负责方', '开始日期', '结束日期', '是否里程碑', '说明']
    
    // CSV 数据行
    const rows = tasks.map(task => [
      task.name,
      task.phase || '',
      task.assignee || '',
      task.startDate,
      task.endDate,
      task.isMilestone ? '是' : '否',
      task.description || '',
    ])

    // 组合 CSV 内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // 添加 BOM 以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出 CSV 失败:', error)
    throw error
  }
}

// 导出为 JSON
export function exportToJSON(
  projectName: string,
  tasks: Task[],
  filename: string = 'project.json'
) {
  try {
    const data = {
      projectName,
      exportDate: new Date().toISOString(),
      tasks: tasks.map(task => ({
        name: task.name,
        phase: task.phase,
        assignee: task.assignee,
        startDate: task.startDate,
        endDate: task.endDate,
        isMilestone: task.isMilestone,
        description: task.description,
        dependencies: task.dependencies,
      })),
    }

    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出 JSON 失败:', error)
    throw error
  }
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<void> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  } catch (error) {
    console.error('复制到剪贴板失败:', error)
    throw error
  }
}
