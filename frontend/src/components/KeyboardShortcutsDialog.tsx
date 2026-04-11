interface KeyboardShortcutsDialogProps {
  onClose: () => void
}

interface Shortcut {
  keys: string[]
  description: string
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'N'], description: '新建任务' },
  { keys: ['Ctrl', 'S'], description: '保存项目' },
  { keys: ['Ctrl', 'E'], description: '导出项目' },
  { keys: ['Ctrl', 'K'], description: '分享项目' },
  { keys: ['Ctrl', '+'], description: '放大' },
  { keys: ['Ctrl', '-'], description: '缩小' },
  { keys: ['Ctrl', '0'], description: '重置缩放' },
  { keys: ['Ctrl', 'T'], description: '跳转到今天' },
  { keys: ['Shift', '?'], description: '显示此帮助' },
  { keys: ['Esc'], description: '关闭对话框' },
]

export default function KeyboardShortcutsDialog({ onClose }: KeyboardShortcutsDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* 标题栏 */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            ⌨️ 键盘快捷键
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
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded shadow-sm">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-gray-400">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            💡 提示：Mac 用户请使用 Cmd 键代替 Ctrl 键
          </p>
        </div>
      </div>
    </div>
  )
}
