import { useState, useEffect } from 'react'
import { createShareLink, getProjectShares, revokeShareLink, ShareLinkData } from '../api/share'
import { copyToClipboard } from '../utils/exportUtils'

interface ShareDialogProps {
  projectId: string
  projectName: string
  onClose: () => void
}

export default function ShareDialog({ projectId, projectName, onClose }: ShareDialogProps) {
  const [shares, setShares] = useState<ShareLinkData[]>([])
  const [loading, setLoading] = useState(false)
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [expiresIn, setExpiresIn] = useState<string>('never')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadShares()
  }, [projectId])

  const loadShares = async () => {
    try {
      const data = await getProjectShares(projectId)
      setShares(data)
    } catch (error) {
      console.error('加载分享链接失败:', error)
    }
  }

  const handleCreateShare = async () => {
    setLoading(true)
    try {
      let expiresAt: string | undefined
      if (expiresIn !== 'never') {
        const days = parseInt(expiresIn)
        const date = new Date()
        date.setDate(date.getDate() + days)
        expiresAt = date.toISOString()
      }

      const shareLink = await createShareLink(projectId, permission, expiresAt)
      setShares([shareLink, ...shares])
      
      // 自动复制链接
      await copyToClipboard(shareLink.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('创建分享链接失败:', error)
      alert('创建分享链接失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async (url: string) => {
    try {
      await copyToClipboard(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      alert('复制失败')
    }
  }

  const handleRevokeShare = async (token: string) => {
    if (!confirm('确定要撤销这个分享链接吗？')) return

    try {
      await revokeShareLink(token)
      setShares(shares.filter(s => s.token !== token))
    } catch (error) {
      console.error('撤销分享链接失败:', error)
      alert('撤销失败')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">分享项目</h2>
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <p className="text-sm text-gray-600 mb-4">
            分享 <span className="font-medium text-gray-900">{projectName}</span> 给其他人
          </p>

          {/* 创建新分享链接 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">创建新的分享链接</h3>
            
            <div className="space-y-3">
              {/* 权限选择 */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">权限</label>
                <select
                  value={permission}
                  onChange={e => setPermission(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="view">仅查看</option>
                  <option value="comment">可评论</option>
                  <option value="edit">可编辑</option>
                </select>
              </div>

              {/* 过期时间 */}
              <div>
                <label className="block text-sm text-gray-700 mb-1">有效期</label>
                <select
                  value={expiresIn}
                  onChange={e => setExpiresIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="never">永久有效</option>
                  <option value="1">1 天</option>
                  <option value="7">7 天</option>
                  <option value="30">30 天</option>
                  <option value="90">90 天</option>
                </select>
              </div>

              <button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? '创建中...' : '🔗 创建分享链接'}
              </button>

              {copied && (
                <p className="text-sm text-green-600 text-center">✓ 链接已复制到剪贴板</p>
              )}
            </div>
          </div>

          {/* 现有分享链接列表 */}
          {shares.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">现有分享链接</h3>
              <div className="space-y-3">
                {shares.map(share => (
                  <div key={share.token} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                            {share.permission === 'view' ? '仅查看' : share.permission === 'comment' ? '可评论' : '可编辑'}
                          </span>
                          {share.expiresAt && (
                            <span className="text-xs text-gray-500">
                              过期时间: {new Date(share.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono break-all">
                          {share.url}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleCopyLink(share.url)}
                          className="p-1 text-gray-400 hover:text-indigo-600"
                          title="复制链接"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRevokeShare(share.token)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="撤销链接"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      创建于 {new Date(share.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
