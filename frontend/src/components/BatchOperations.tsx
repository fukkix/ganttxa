import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Task } from '../types'

interface BatchOperationsProps {
  selectedTasks: string[]
  onClose: () => void
  onComplete: () => void
}

export default function BatchOperations({ selectedTasks, onClose, onComplete }: BatchOperationsProps) {
  const { tasks, updateTask, deleteTask } = useProjectStore()
  const [operation, setOperation] = useState<'delete' | 'phase' | 'assignee' | null>(null)
  const [newPhase, setNewPhase] = useState('')
  const [newAssignee, setNewAssignee] = useState('')

  const selectedTasksData = tasks.filter(t => selectedTasks.includes(t.id))

  const handleBatchDelete = () => {
    if (!confirm(`确定要删除 ${selectedTasks.length} 个任务吗？`)) return
    
    selectedTasks.forEach(taskId => {
      deleteTask(taskId)
    })
    onComplete()
  }

  const handleBatchUpdatePhase = () => {
    if (!newPhase) {
      alert('请输入阶段名称')
      return
    }

    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        updateTask(taskId, { ...task, phase: newPhase })
      }
    })
    onComplete()
  }

  const handleBatchUpdateAssignee = () => {
    if (!newAssignee) {
      alert('请输入负责人')
      return
    }

    selectedTasks.forEach(taskId => {
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        updateTask(taskId, { ...task, assignee: newAssignee })
      }
    })
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            批量操作 ({selectedTasks.length} 个任务)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6">
          {!operation ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                已选择 {selectedTasks.length} 个任务，请选择要执行的操作：
              </p>

              <button
                onClick={() => setOperation('phase')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📁</span>
                  <div>
                    <div className="font-medium text-gray-900">修改阶段</div>
                    <div className="text-sm text-gray-500">将选中任务移动到指定阶段</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setOperation('assignee')}
                className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👤</span>
                  <div>
                    <div className="font-medium text-gray-900">修改负责人</div>
                    <div className="text-sm text-gray-500">为选中任务分配负责人</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setOperation('delete')}
                className="w-full p-4 border-2 border-red-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗑️</span>
                  <div>
                    <div className="font-medium text-red-900">删除任务</div>
                    <div className="text-sm text-red-500">永久删除选中的任务</div>
                  </div>
                </div>
              </button>
            </div>
          ) : operation === 'phase' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                新阶段名称
              </label>
              <input
                type="text"
                value={newPhase}
                onChange={e => setNewPhase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                placeholder="输入阶段名称"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setOperation(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  返回
                </button>
                <button
                  onClick={handleBatchUpdatePhase}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  确认修改
                </button>
              </div>
            </div>
          ) : operation === 'assignee' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                负责人
              </label>
              <input
                type="text"
                value={newAssignee}
                onChange={e => setNewAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                placeholder="输入负责人姓名"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setOperation(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  返回
                </button>
                <button
                  onClick={handleBatchUpdateAssignee}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  确认修改
                </button>
              </div>
            </div>
          ) : operation === 'delete' ? (
            <div>
              <div className="mb-4 p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800 mb-2">
                  ⚠️ 警告：此操作不可撤销
                </p>
                <p className="text-sm text-red-600">
                  将永久删除以下 {selectedTasks.length} 个任务：
                </p>
                <ul className="mt-2 text-sm text-red-700 max-h-32 overflow-y-auto">
                  {selectedTasksData.map(task => (
                    <li key={task.id} className="truncate">• {task.name}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOperation(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  onClick={handleBatchDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  确认删除
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
