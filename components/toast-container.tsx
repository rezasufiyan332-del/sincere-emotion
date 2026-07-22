'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useUIStore } from '@/lib/store/ui'

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts)
  const removeToast = useUIStore((state) => state.removeToast)

  const config: Record<string, { icon: React.ReactNode; border: string }> = {
    success: {
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      border: 'border-emerald-500/20',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
      border: 'border-rose-500/20',
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-500" />,
      border: 'border-blue-500/20',
    },
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none space-y-2 max-w-sm" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((toast) => {
          const c = config[toast.type] || config.info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, x: 40 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border ${c.border}`}
              style={{ background: '#1a1a24' }}
            >
              <span className="mt-0.5 flex-shrink-0">{c.icon}</span>
              <p className="flex-1 text-sm text-foreground">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
