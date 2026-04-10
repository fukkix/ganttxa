import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSharedProject, ShareProjectData } from '../api/share'
import { useProjectStore } from '../store/projectStore'
import GanttChart from '../components/GanttChart'
import GanttControls from '../components/GanttControls'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const { setProject } = useProjectStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shareData, setShareData] = useState<ShareProjectData | null>(null)

  useEffect(() => {
    if (!token) {
      setError('无效的分享链接')
      setLoading(false)
      return
    }

    loadSharedProject()
  }, [token])

  const loadSharedProject = async () => {
    try {
      setLoading(true)
      const data = await getSharedProject(token!)
      setShareData(data)
      
      // 设置项目数据到 store
      setProject({
        id: data.project.id,
        userId: '',
        name: data.project.name,
        description: data.project.description,
        tasks: data.project.tasks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      
      setError(null)
    } catch (err: any) {
      console.error('加载分享项目失败:', err)
      if (err.response?.status === 404) {
        setError('分享链接不存在或已失效')
      } else if (err.response?.status === 410) {
        setError('分享链接已过期')
      } else {
        setError('加载失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error.includes('过期') && '该分享链接已过期，请联系项目所有者重新分享'}
            {error.includes('失效') && '该分享链接不存在或已被撤销'}
            {error.includes('失败') && '网络连接失败，请检查网络后重试'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
            title="返回首页"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {shareData?.project.name}
            </h1>
            <p className="text-xs text-gray-500">
              {shareData?.permission === 'view' && '🔒 只读模式'}
              {shareData?.permission === 'comment' && '💬 可评论'}
              {shareData?.permission === 'edit' && '✏️ 可编辑'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shareData?.expiresAt && (
            <span className="text-sm text-gray-500">
              过期时间: {new Date(shareData.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </header>

      {/* 甘特图区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <GanttControls />
        <div className="flex-1 overflow-auto p-4">
          <GanttChart />
        </div>
      </main>
    </div>
  )
}
