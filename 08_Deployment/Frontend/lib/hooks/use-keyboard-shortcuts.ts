import { useEffect } from "react"

export interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  onKeyDown: () => void
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside inputs or textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        // Exception: Escape key should blur inputs or close modals
        if (e.key === 'Escape') {
          ; (e.target as HTMLElement).blur()
        } else {
          return
        }
      }

      shortcuts.forEach(shortcut => {
        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          !!shortcut.ctrlKey === e.ctrlKey &&
          !!shortcut.shiftKey === e.shiftKey
        ) {
          e.preventDefault()
          shortcut.onKeyDown()
        }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}
