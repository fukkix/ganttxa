import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          404
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          页面未找到
        </p>
        <p className="text-gray-500 mb-8">
          抱歉，您访问的页面不存在或已被移除
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            返回上一页
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}
