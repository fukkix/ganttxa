import { useProjectStore } from '../store/projectStore'

// 为不同负责人生成一致的颜色（与 GanttChart 保持一致）
const getAssigneeColor = (assignee: string) => {
  if (!assignee) return { bg: '#E5E7EB', text: '#6B7280' }
  
  const colors = [
    { bg: '#9FE1CB', text: '#085041' }, // 青绿
    { bg: '#B5D4F4', text: '#0C447C' }, // 蓝色
    { bg: '#CECBF6', text: '#3C3489' }, // 紫色
    { bg: '#FFD4A3', text: '#8B4513' }, // 橙色
    { bg: '#FFB5C5', text: '#8B1538' }, // 粉色
    { bg: '#C7E9C0', text: '#2D5016' }, // 绿色
    { bg: '#FED9A6', text: '#7C4A00' }, // 黄色
    { bg: '#D4C5F9', text: '#4A1D96' }, // 淡紫
  ]
  
  let hash = 0
  for (let i = 0; i < assignee.length; i++) {
    hash = assignee.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export default function GanttLegend() {
  const { tasks } = useProjectStore()
  
  // 获取所有唯一的负责人
  const assignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)))
  
  if (assignees.length === 0) return null
  
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 flex-wrap text-xs">
      <span className="font-medium text-gray-700">图例：</span>
      
      {/* 负责人颜色 */}
      {assignees.map(assignee => {
        const color = getAssigneeColor(assignee)
        return (
          <div key={assignee} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color.bg }}
            />
            <span className="text-gray-600">{assignee}</span>
          </div>
        )
      })}
      
      {/* 今日线 */}
      <div className="flex items-center gap-1.5 ml-2">
        <div className="w-0.5 h-4 bg-red-500 opacity-70" />
        <span className="text-gray-600">今日</span>
      </div>
      
      {/* 里程碑 */}
      {tasks.some(t => t.isMilestone) && (
        <div className="flex items-center gap-1.5">
          <span className="text-base">💎</span>
          <span className="text-gray-600">里程碑</span>
        </div>
      )}
      
      {/* 依赖关系 */}
      {tasks.some(t => t.dependencies && t.dependencies.length > 0) && (
        <div className="flex items-center gap-1.5">
          <svg width="20" height="12" className="text-gray-400">
            <line x1="0" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,4" />
            <polygon points="14,6 11,4 11,8" fill="currentColor" />
          </svg>
          <span className="text-gray-600">依赖关系</span>
        </div>
      )}
    </div>
  )
}
