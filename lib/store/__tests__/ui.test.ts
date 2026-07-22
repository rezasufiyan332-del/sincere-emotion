import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useUIStore } from '../ui'

const resetStore = () => {
  useUIStore.setState({
    cartOpen: false,
    checkoutOpen: false,
    toasts: [],
    isLoading: false,
  })
  vi.clearAllTimers()
}

describe('useUIStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    resetStore()
  })

  const getState = () => useUIStore.getState()

  // ============================================
  // toggleCart tests
  // ============================================
  describe('toggleCart', () => {
    it('should open cart when closed', () => {
      expect(getState().cartOpen).toBe(false)
      
      getState().toggleCart()
      
      expect(getState().cartOpen).toBe(true)
    })

    it('should close cart when open', () => {
      getState().toggleCart() // open
      expect(getState().cartOpen).toBe(true)
      
      getState().toggleCart() // close
      expect(getState().cartOpen).toBe(false)
    })

    it('should toggle multiple times correctly', () => {
      getState().toggleCart() // open
      getState().toggleCart() // close
      getState().toggleCart() // open
      getState().toggleCart() // close
      
      expect(getState().cartOpen).toBe(false)
    })

    it('should not affect other state', () => {
      getState().setLoading(true)
      getState().openCheckout()
      
      getState().toggleCart()
      
      expect(getState().isLoading).toBe(true)
      expect(getState().checkoutOpen).toBe(true)
    })
  })

  // ============================================
  // openCheckout tests
  // ============================================
  describe('openCheckout', () => {
    it('should open checkout', () => {
      expect(getState().checkoutOpen).toBe(false)
      
      getState().openCheckout()
      
      expect(getState().checkoutOpen).toBe(true)
    })

    it('should keep checkout open if called multiple times', () => {
      getState().openCheckout()
      getState().openCheckout()
      
      expect(getState().checkoutOpen).toBe(true)
    })

    it('should not affect cart state', () => {
      getState().toggleCart()
      expect(getState().cartOpen).toBe(true)
      
      getState().openCheckout()
      
      expect(getState().cartOpen).toBe(true)
      expect(getState().checkoutOpen).toBe(true)
    })

    it('should not affect loading state', () => {
      getState().setLoading(true)
      
      getState().openCheckout()
      
      expect(getState().isLoading).toBe(true)
    })
  })

  // ============================================
  // closeCheckout tests
  // ============================================
  describe('closeCheckout', () => {
    it('should close checkout', () => {
      getState().openCheckout()
      expect(getState().checkoutOpen).toBe(true)
      
      getState().closeCheckout()
      
      expect(getState().checkoutOpen).toBe(false)
    })

    it('should handle closing already closed checkout', () => {
      getState().closeCheckout()
      expect(getState().checkoutOpen).toBe(false)
    })

    it('should not affect other state', () => {
      getState().setLoading(true)
      getState().toggleCart()
      
      getState().closeCheckout()
      
      expect(getState().isLoading).toBe(true)
      expect(getState().cartOpen).toBe(true)
    })
  })

  // ============================================
  // setLoading tests
  // ============================================
  describe('setLoading', () => {
    it('should set loading to true', () => {
      getState().setLoading(true)
      expect(getState().isLoading).toBe(true)
    })

    it('should set loading to false', () => {
      getState().setLoading(true)
      getState().setLoading(false)
      expect(getState().isLoading).toBe(false)
    })

    it('should toggle loading state correctly', () => {
      getState().setLoading(true)
      getState().setLoading(false)
      getState().setLoading(true)
      expect(getState().isLoading).toBe(true)
    })

    it('should not affect other state', () => {
      getState().openCheckout()
      getState().toggleCart()
      
      getState().setLoading(true)
      
      expect(getState().checkoutOpen).toBe(true)
      expect(getState().cartOpen).toBe(true)
    })
  })

  // ============================================
  // addToast tests
  // ============================================
  describe('addToast', () => {
    it('should add info toast', () => {
      const toastsBefore = getState().toasts.length
      getState().addToast('info', 'Information message')
      
      expect(getState().toasts).toHaveLength(toastsBefore + 1)
      expect(getState().toasts[getState().toasts.length - 1]).toMatchObject({
        type: 'info',
        message: 'Information message',
      })
    })

    it('should add success toast', () => {
      getState().addToast('success', 'Operation successful')
      
      expect(getState().toasts[getState().toasts.length - 1].type).toBe('success')
    })

    it('should add error toast', () => {
      getState().addToast('error', 'Something went wrong')
      
      expect(getState().toasts[getState().toasts.length - 1].type).toBe('error')
    })

    it('should generate unique IDs', () => {
      // Add multiple toasts with delays to ensure different timestamps
      getState().addToast('info', 'Message 1')
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Message 2')
      vi.advanceTimersByTime(1)
      getState().addToast('error', 'Message 3')
      
      const toasts = getState().toasts
      expect(toasts).toHaveLength(3)
      const ids = toasts.map(t => t.id)
      expect(new Set(ids).size).toBe(3)
    })

    it('should add multiple toasts in order', () => {
      getState().addToast('info', 'First')
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Second')
      vi.advanceTimersByTime(1)
      getState().addToast('error', 'Third')
      
      const toasts = getState().toasts
      expect(toasts[0].message).toBe('First')
      expect(toasts[1].message).toBe('Second')
      expect(toasts[2].message).toBe('Third')
    })

    it('should auto-remove toast after duration', () => {
      getState().addToast('info', 'Auto remove', 100)
      
      expect(getState().toasts).toHaveLength(1)
      
      vi.advanceTimersByTime(150)
      
      expect(getState().toasts).toHaveLength(0)
    })

    it('should not auto-remove when duration is 0', () => {
      getState().addToast('info', 'Persistent', 0)
      
      vi.advanceTimersByTime(10000)
      
      expect(getState().toasts).toHaveLength(1)
    })

    it('should not auto-remove when duration is negative', () => {
      getState().addToast('info', 'Persistent', -100)
      
      vi.advanceTimersByTime(10000)
      
      expect(getState().toasts).toHaveLength(1)
    })

    it('should handle different durations for different toasts', () => {
      getState().addToast('info', 'Short', 100)
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Long', 1000)
      
      expect(getState().toasts).toHaveLength(2)
      
      vi.advanceTimersByTime(101)
      
      expect(getState().toasts).toHaveLength(1)
      expect(getState().toasts[0].message).toBe('Long')
      
      vi.advanceTimersByTime(1000)
      
      expect(getState().toasts).toHaveLength(0)
    })

    it('should not affect other state', () => {
      getState().setLoading(true)
      getState().openCheckout()
      getState().toggleCart()
      
      getState().addToast('info', 'Test')
      
      expect(getState().isLoading).toBe(true)
      expect(getState().checkoutOpen).toBe(true)
      expect(getState().cartOpen).toBe(true)
    })

    it('should handle empty message', () => {
      getState().addToast('info', '')
      
      expect(getState().toasts[getState().toasts.length - 1].message).toBe('')
    })

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(10000)
      getState().addToast('info', longMessage)
      
      expect(getState().toasts[getState().toasts.length - 1].message).toBe(longMessage)
    })
  })

  // ============================================
  // removeToast tests
  // ============================================
  describe('removeToast', () => {
    it('should remove specific toast by ID', () => {
      getState().addToast('info', 'Toast 1')
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Toast 2')
      vi.advanceTimersByTime(1)
      getState().addToast('error', 'Toast 3')
      
      const toasts = getState().toasts
      const idToRemove = toasts[1].id
      
      getState().removeToast(idToRemove)
      
      expect(getState().toasts).toHaveLength(2)
      expect(getState().toasts.map(t => t.id)).not.toContain(idToRemove)
    })

    it('should handle removing first toast', () => {
      getState().addToast('info', 'First')
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Second')
      
      const firstId = getState().toasts[0].id
      getState().removeToast(firstId)
      
      expect(getState().toasts).toHaveLength(1)
      expect(getState().toasts[0].message).toBe('Second')
    })

    it('should handle removing last toast', () => {
      getState().addToast('info', 'First')
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Last')
      
      const lastId = getState().toasts[getState().toasts.length - 1].id
      getState().removeToast(lastId)
      
      expect(getState().toasts).toHaveLength(1)
      expect(getState().toasts[0].message).toBe('First')
    })

    it('should handle removing only toast', () => {
      getState().addToast('info', 'Only')
      const id = getState().toasts[0].id
      
      getState().removeToast(id)
      
      expect(getState().toasts).toHaveLength(0)
    })

    it('should gracefully handle removing non-existent toast', () => {
      getState().addToast('info', 'Exists')
      
      getState().removeToast('non-existent-id')
      
      expect(getState().toasts).toHaveLength(1)
    })

    it('should gracefully handle removing from empty toasts', () => {
      getState().removeToast('any-id')
      
      expect(getState().toasts).toHaveLength(0)
    })

    it('should not affect other state', () => {
      getState().setLoading(true)
      getState().openCheckout()
      
      getState().addToast('info', 'Test')
      const id = getState().toasts[0].id
      getState().removeToast(id)
      
      expect(getState().isLoading).toBe(true)
      expect(getState().checkoutOpen).toBe(true)
    })

    it('should work after auto-removal of other toasts', () => {
      getState().addToast('info', 'Auto remove', 100)
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Keep', 0)
      
      vi.advanceTimersByTime(150)
      
      expect(getState().toasts).toHaveLength(1)
      
      const id = getState().toasts[0].id
      getState().removeToast(id)
      
      expect(getState().toasts).toHaveLength(0)
    })
  })

  // ============================================
  // Toast type validation
  // ============================================
  describe('Toast types', () => {
    it('should accept success type', () => {
      getState().addToast('success', 'Success message')
      expect(getState().toasts[getState().toasts.length - 1].type).toBe('success')
    })

    it('should accept error type', () => {
      getState().addToast('error', 'Error message')
      expect(getState().toasts[getState().toasts.length - 1].type).toBe('error')
    })

    it('should accept info type', () => {
      getState().addToast('info', 'Info message')
      expect(getState().toasts[getState().toasts.length - 1].type).toBe('info')
    })
  })

  // ============================================
  // Integration tests
  // ============================================
  describe('Integration scenarios', () => {
    it('should handle complete checkout flow', () => {
      // User opens cart
      getState().toggleCart()
      expect(getState().cartOpen).toBe(true)
      
      // User proceeds to checkout
      getState().openCheckout()
      expect(getState().checkoutOpen).toBe(true)
      
      // Loading during payment
      getState().setLoading(true)
      expect(getState().isLoading).toBe(true)
      
      // Payment success
      getState().setLoading(false)
      getState().addToast('success', 'Payment successful!')
      
      expect(getState().toasts).toHaveLength(1)
      expect(getState().toasts[0].type).toBe('success')
      
      // Close checkout
      getState().closeCheckout()
      expect(getState().checkoutOpen).toBe(false)
    })

    it('should handle error flow with multiple toasts', () => {
      getState().addToast('info', 'Processing...')
      getState().setLoading(true)
      
      vi.advanceTimersByTime(100)
      
      getState().setLoading(false)
      getState().addToast('error', 'Payment failed')
      vi.advanceTimersByTime(1)
      getState().addToast('info', 'Please try again')
      
      expect(getState().isLoading).toBe(false)
      expect(getState().toasts).toHaveLength(3)
      
      // Remove error toast
      const toasts = getState().toasts
      getState().removeToast(toasts[1].id)
      expect(getState().toasts).toHaveLength(2)
    })

    it('should maintain state consistency with timers', () => {
      getState().addToast('info', 'Toast 1', 500)
      vi.advanceTimersByTime(1)
      getState().addToast('success', 'Toast 2', 1000)
      vi.advanceTimersByTime(1)
      getState().addToast('error', 'Toast 3', 0)
      
      expect(getState().toasts).toHaveLength(3)
      
      vi.advanceTimersByTime(502)
      
      expect(getState().toasts).toHaveLength(2)
      expect(getState().toasts.map(t => t.type)).toEqual(['success', 'error'])
      
      vi.advanceTimersByTime(1000)
      
      expect(getState().toasts).toHaveLength(1)
      expect(getState().toasts[0].type).toBe('error')
    })
  })

  // ============================================
  // Edge cases
  // ============================================
  describe('Edge cases', () => {
    it('should handle many toasts without ID collision', () => {
      for (let i = 0; i < 100; i++) {
        getState().addToast('info', `Toast ${i}`, 0)
        vi.advanceTimersByTime(1)
      }
      
      const toasts = getState().toasts
      const ids = new Set(toasts.map(t => t.id))
      
      expect(ids.size).toBe(100)
      expect(getState().toasts).toHaveLength(100)
    })

    it('should handle state reset gracefully', () => {
      getState().toggleCart()
      getState().openCheckout()
      getState().setLoading(true)
      getState().addToast('info', 'Test')
      
      resetStore()
      
      expect(getState().cartOpen).toBe(false)
      expect(getState().checkoutOpen).toBe(false)
      expect(getState().isLoading).toBe(false)
      expect(getState().toasts).toHaveLength(0)
    })
  })
})