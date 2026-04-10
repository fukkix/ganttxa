import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, getLocalUser, logout } from '../api/auth'

export default function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getLocalUser())
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    setUser(getLocalUser())
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
    setShowUserMenu(false)
  }

  const handleCreateProject = () => {
    if (!isAuthenticated()) {
      navigate('/login')
      return
    }
    navigate('/editor/new')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface-container-low sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black tracking-tight text-primary font-headline">
              GanttXa
            </h1>
            <nav className="hidden md:flex gap-6">
              <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
                Dashboard
              </a>
              <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
                Templates
              </a>
              <a href="#" className="text-on-surface-variant font-medium hover:text-primary transition-colors text-sm">
                Pricing
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-surface-container rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-on-surface hidden md:block">
                    {user.displayName}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest rounded-xl shadow-ambient-lg py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container rounded-xl transition-all"
                >
                  登录
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-semibold bg-primary text-on-primary rounded-xl hover:opacity-90 transition-all"
                >
                  注册
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary-fixed-dim text-on-primary-fixed-variant rounded-full text-[10px] font-bold uppercase tracking-widest">
                Product Spotlight
              </span>
              <span className="text-on-surface-variant text-sm">v2.4 Smart Collaboration</span>
            </div>
            <h1 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mb-3 leading-tight">
              GanttXa
            </h1>
            <p className="text-on-surface-variant text-xl leading-relaxed">
              在线甘特图协作工具 · AI 智能解析项目文件
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-ambient active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              创建项目
            </button>
            <button className="flex items-center gap-2 px-5 py-3 bg-surface-container-highest text-on-surface rounded-xl font-bold text-sm hover:bg-surface-container transition-all">
              <span className="material-symbols-outlined text-[20px]">upload</span>
              上传文件
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 bg-surface-container-low rounded-3xl border border-transparent hover:border-primary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <h4 className="font-headline font-bold text-lg text-on-surface mb-3">AI 智能解析</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              从 Excel、Word 或 CSV 文件中一键提取任务。30 秒内自动生成完整的甘特图，告别手动输入的繁琐。
            </p>
          </div>

          <div className="p-8 bg-surface-container-low rounded-3xl border border-transparent hover:border-secondary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <h4 className="font-headline font-bold text-lg text-on-surface mb-3">双轨输入</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              灵活选择手动填写关键任务，或直接上传现有项目文件。AI 会自动识别并填充所有关联字段。
            </p>
          </div>

          <div className="p-8 bg-surface-container-low rounded-3xl border border-transparent hover:border-tertiary/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">link</span>
            </div>
            <h4 className="font-headline font-bold text-lg text-on-surface mb-3">一键分享</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              生成专属加密链接。团队成员无需注册账号即可在线查看进度，实现真正的无缝协作。
            </p>
          </div>
        </div>

        {/* Projects Section */}
        {user && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-headline-md font-headline text-on-surface">我的项目</h2>
              <button
                onClick={handleCreateProject}
                className="text-sm text-primary font-medium hover:underline"
              >
                查看全部 →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Empty State */}
              <div className="col-span-full p-12 bg-surface-container-low rounded-3xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-highest mx-auto mb-4 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                    folder_open
                  </span>
                </div>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">
                  还没有项目
                </h3>
                <p className="text-on-surface-variant text-sm mb-6">
                  创建你的第一个项目，开始使用 GanttXa
                </p>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-2 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                >
                  创建项目
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={handleCreateProject}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-ambient-lg flex items-center justify-center hover:scale-110 hover:rotate-90 active:scale-95 transition-all z-50 group"
      >
        <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
          add
        </span>
        <span className="absolute right-20 bg-on-surface text-surface px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-ambient-lg">
          创建新项目
        </span>
      </button>
    </div>
  )
}
