import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
}

interface UIState {
  cartOpen: boolean
  checkoutOpen: boolean
  toasts: Toast[]
  isLoading: boolean

  toggleCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  setLoading: (loading: boolean) => void
  addToast: (type: Toast['type'], message: string, duration?: number) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  cartOpen: false,
  checkoutOpen: false,
  toasts: [],
  isLoading: false,

  toggleCart: () => {
    set((state) => ({ cartOpen: !state.cartOpen }))
  },

  openCheckout: () => {
    set({ checkoutOpen: true })
  },

  closeCheckout: () => {
    set({ checkoutOpen: false })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  addToast: (type, message, duration = 3000) => {
    const id = `toast-${Date.now()}`
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }))

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id)
      }, duration)
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
}))
