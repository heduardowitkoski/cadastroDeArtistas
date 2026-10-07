import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!open || !ref.current) return
    const dialog = ref.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(focusable()[0] || dialog).focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previous?.focus()
    }
  }, [open, ref])
}
