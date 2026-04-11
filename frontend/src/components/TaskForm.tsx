import { useState, useEffect } from 'react'
import { Task } from '../types'
import { useProjectStore } from '../store/projectStore'
import dayjs from 'dayjs'

interface TaskFormProps {
  task?: Task | null
  onClose: () => void
}

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const { addTask, updateTask } = useProjectStore()
  const [formData, setFormData] = useState({
    name: '',
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
    assignee: '',
    phase: '阶段一',
    description: '',
    isMilestone: false,
  })

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        startDate: task.startDate,
        endDate: task.endDate || '',
        assignee: task.assignee,
        phase: task.phase,
        description: task.description || '',
        isMilestone: task.isMilestone,
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('请输入任务名称')
      return
    }

    // 验证日期范围
    if (formData.endDate && formData.startDate > formData.endDate) {
      alert('结束日期不能早于开始日期')
      return
    }

    const taskData: Task = {
      id: task?.id || `task_${Date.now()}`,
      projectId: task?.projectId || 'temp',
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      assignee: formData.assignee,
      phase: formData.phase,
      description: formData.description,
      isMilestone: formData.isMilestone,
      dependencies: task?.dependencies || [],
      position: task?.position || 0,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (task) {
      updateTask(task.id, taskData)
    } else {
      addTask(taskData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {task ? '编辑任务' : '新建任务'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入任务名称"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期 *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const newStartDate = e.target.value
                  setFormData({ 
                    ...formData, 
                    startDate: newStartDate,
                    // 如果结束日期早于新的开始日期，自动调整结束日期
                    endDate: formData.endDate && formData.endDate < newStartDate 
                      ? newStartDate 
                      : formData.endDate
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={formData.endDate}
                min={formData.startDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {formData.endDate && formData.endDate < formData.startDate && (
                <p className="text-xs text-red-600 mt-1">结束日期不能早于开始日期</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              负责人
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入负责人姓名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              所属阶段
            </label>
            <select
              value={formData.phase}
              onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="阶段一">阶段一</option>
              <option value="阶段二">阶段二</option>
              <option value="阶段三">阶段三</option>
              <option value="阶段四">阶段四</option>
              <option value="阶段五">阶段五</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              任务说明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="输入任务说明（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              依赖任务
            </label>
            <select
              multiple
              value={task?.dependencies || []}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                if (task) {
                  updateTask(task.id, { ...task, dependencies: selected })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
            >
              <option value="" disabled>选择依赖的任务（可多选）</option>
              {useProjectStore.getState().tasks
                .filter(t => t.id !== task?.id)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              按住 Ctrl/Cmd 可多选。依赖任务完成后才能开始此任务。
            </p>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isMilestone"
              checked={formData.isMilestone}
              onChange={(e) => setFormData({ ...formData, isMilestone: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isMilestone" className="ml-2 text-sm text-gray-700">
              标记为里程碑 💎
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {task ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
