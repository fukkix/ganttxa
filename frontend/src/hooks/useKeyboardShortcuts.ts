import { useEffect } from 'react'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

// 预定义的快捷键配置
export const EDITOR_SHORTCUTS = {
  NEW_TASK: { key: 'n', ctrl: true, description: '新建任务' },
  SAVE: { key: 's', ctrl: true, description: '保存项目' },
  EXPORT: { key: 'e', ctrl: true, description: '导出项目' },
  SHARE: { key: 'k', ctrl: true, description: '分享项目' },
  ZOOM_IN: { key: '=', ctrl: true, description: '放大' },
  ZOOM_OUT: { key: '-', ctrl: true, description: '缩小' },
  ZOOM_RESET: { key: '0', ctrl: true, description: '重置缩放' },
  TODAY: { key: 't', ctrl: true, description: '跳转到今天' },
  HELP: { key: '?', shift: true, description: '显示帮助' },
}
