'use client'

import { useUIStore } from '@/lib/store/ui'

export function useToast() {
  const addToast = useUIStore((state) => state.addToast)

  return (title: string, description?: string, variant?: 'default' | 'success' | 'destructive') => {
    const type = variant === 'success' ? 'success' : variant === 'destructive' ? 'error' : 'info'
    const message = description ? `${title}: ${description}` : title
    addToast(type, message)
  }
}