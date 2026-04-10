import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, type }])
      const timer = setTimeout(() => dismiss(id), 3000)
      timers.current.set(id, timer)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              style={{
                padding: '12px 20px',
                borderRadius: 12,
                background:
                  t.type === 'success'
                    ? 'rgba(74, 222, 128, 0.18)'
                    : t.type === 'error'
                      ? 'rgba(248, 113, 113, 0.18)'
                      : 'rgba(124, 140, 255, 0.18)',
                border: `1px solid ${
                  t.type === 'success'
                    ? 'rgba(74, 222, 128, 0.35)'
                    : t.type === 'error'
                      ? 'rgba(248, 113, 113, 0.35)'
                      : 'rgba(124, 140, 255, 0.35)'
                }`,
                color: t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#ff6b6b' : '#c8d0ff',
                fontSize: '0.9rem',
                fontWeight: 500,
                cursor: 'pointer',
                pointerEvents: 'auto',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                maxWidth: 320,
              }}
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
