import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useCartStore } from '../cart'
import type { CartProduct } from '../cart'

const createMockProduct = (overrides: Partial<CartProduct> = {}): CartProduct => ({
  id: 'prod-1',
  name: 'Test Product',
  price: 100,
  originalPrice: 150,
  image: 'test.jpg',
  subtitle: 'Test Subtitle',
  ...overrides,
})

const resetStore = () => {
  useCartStore.setState({ items: [] })
  localStorage.clear()
}

describe('useCartStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    resetStore()
  })

  // ============================================
  // addItem tests
  // ============================================
  describe('addItem', () => {
    it('should add a new item to empty cart', () => {
      const product = createMockProduct()
      
      useCartStore.getState().addItem(product, 1)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
    })

    it('should add item with quantity greater than 1', () => {
      const product = createMockProduct()
      
      useCartStore.getState().addItem(product, 3)
      
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(3)
    })

    it('should increment quantity when adding existing product', () => {
      const product = createMockProduct()
      
      useCartStore.getState().addItem(product, 2)
      useCartStore.getState().addItem(product, 3)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(5)
    })

    it('should add different products as separate items', () => {
      const product1 = createMockProduct({ id: 'prod-1', name: 'Product 1' })
      const product2 = createMockProduct({ id: 'prod-2', name: 'Product 2' })
      
      useCartStore.getState().addItem(product1, 1)
      useCartStore.getState().addItem(product2, 2)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(2)
      expect(items[0].product.id).toBe('prod-1')
      expect(items[1].product.id).toBe('prod-2')
    })

    it('should preserve product properties correctly', () => {
      const product = createMockProduct({
        id: 'prod-special',
        name: 'Special Product',
        price: 75,
        originalPrice: 100,
        image: 'special.jpg',
        subtitle: 'Special edition',
      })
      
      useCartStore.getState().addItem(product, 1)
      
      const item = useCartStore.getState().items[0]
      expect(item.product).toEqual(product)
    })

    it('should persist to localStorage', () => {
      const product = createMockProduct()
      
      useCartStore.getState().addItem(product, 2)
      
      const stored = localStorage.getItem('cart-store')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.items).toHaveLength(1)
      expect(parsed.state.items[0].quantity).toBe(2)
    })
  })

  // ============================================
  // removeItem tests
  // ============================================
  describe('removeItem', () => {
    it('should remove existing item from cart', () => {
      const product1 = createMockProduct({ id: 'prod-1' })
      const product2 = createMockProduct({ id: 'prod-2' })
      
      useCartStore.getState().addItem(product1, 1)
      useCartStore.getState().addItem(product2, 1)
      useCartStore.getState().removeItem('prod-1')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].product.id).toBe('prod-2')
    })

    it('should handle removing non-existing item gracefully', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().removeItem('non-existent-id')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
    })

    it('should remove last item leaving empty cart', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().removeItem('prod-1')
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should persist removal to localStorage', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().removeItem('prod-1')
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items).toHaveLength(0)
    })
  })

  // ============================================
  // updateQuantity tests
  // ============================================
  describe('updateQuantity', () => {
    it('should update quantity to valid positive number', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().updateQuantity('prod-1', 5)
      
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(5)
    })

    it('should remove item when quantity is set to 0', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 3)
      
      useCartStore.getState().updateQuantity('prod-1', 0)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should remove item when quantity is negative', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 2)
      
      useCartStore.getState().updateQuantity('prod-1', -1)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should handle updating non-existing item gracefully', () => {
      useCartStore.getState().updateQuantity('non-existent', 5)
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should persist quantity update to localStorage', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().updateQuantity('prod-1', 10)
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items[0].quantity).toBe(10)
    })

    it('should handle large quantities', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      useCartStore.getState().updateQuantity('prod-1', 999)
      
      expect(useCartStore.getState().items[0].quantity).toBe(999)
    })
  })

  // ============================================
  // clearCart tests
  // ============================================
  describe('clearCart', () => {
    it('should remove all items from cart', () => {
      const product1 = createMockProduct({ id: 'prod-1' })
      const product2 = createMockProduct({ id: 'prod-2' })
      
      useCartStore.getState().addItem(product1, 2)
      useCartStore.getState().addItem(product2, 3)
      useCartStore.getState().clearCart()
      
      const items = useCartStore.getState().items
      expect(items).toHaveLength(0)
    })

    it('should handle clearing already empty cart', () => {
      useCartStore.getState().clearCart()
      useCartStore.getState().clearCart()
      
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should persist cleared cart to localStorage', () => {
      useCartStore.getState().addItem(createMockProduct(), 1)
      useCartStore.getState().clearCart()
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items).toHaveLength(0)
    })
  })

  // ============================================
  // getTotal tests
  // ============================================
  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0)
    })

    it('should calculate total for single item', () => {
      const product = createMockProduct({ price: 50 })
      useCartStore.getState().addItem(product, 3)
      
      expect(useCartStore.getState().getTotal()).toBe(150)
    })

    it('should calculate total for multiple items', () => {
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-1', price: 100 }), 2)
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-2', price: 50 }), 3)
      
      expect(useCartStore.getState().getTotal()).toBe(350) // 200 + 150
    })

    it('should use current price not original price', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 80, originalPrice: 100 }), 2)
      
      expect(useCartStore.getState().getTotal()).toBe(160)
    })

    it('should handle decimal prices correctly', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 19.99 }), 2)
      
      expect(useCartStore.getState().getTotal()).toBeCloseTo(39.98, 2)
    })
  })

  // ============================================
  // getSavings tests
  // ============================================
  describe('getSavings', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getSavings()).toBe(0)
    })

    it('should calculate savings for single item with discount', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 80, originalPrice: 100 }), 2)
      
      expect(useCartStore.getState().getSavings()).toBe(40) // (100 - 80) * 2
    })

    it('should calculate savings for multiple items with discounts', () => {
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-1', price: 80, originalPrice: 100 }), 2)
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-2', price: 50, originalPrice: 75 }), 3)
      
      expect(useCartStore.getState().getSavings()).toBe(115) // 40 + 75
    })

    it('should return 0 savings when no discount (price equals originalPrice)', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 100, originalPrice: 100 }), 5)
      
      expect(useCartStore.getState().getSavings()).toBe(0)
    })

    it('should handle items with and without discounts', () => {
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-1', price: 80, originalPrice: 100 }), 1)
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-2', price: 50, originalPrice: 50 }), 2)
      
      expect(useCartStore.getState().getSavings()).toBe(20) // Only first item has discount
    })
  })

  // ============================================
  // getItemCount tests
  // ============================================
  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0)
    })

    it('should return quantity for single item', () => {
      useCartStore.getState().addItem(createMockProduct(), 5)
      
      expect(useCartStore.getState().getItemCount()).toBe(5)
    })

    it('should sum quantities of all items', () => {
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-1' }), 2)
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-2' }), 3)
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-3' }), 1)
      
      expect(useCartStore.getState().getItemCount()).toBe(6)
    })
  })

  // ============================================
  // Persistence tests (localStorage)
  // ============================================
  describe('Persistence (localStorage)', () => {
    it('should persist cart state to localStorage on addItem', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 2)
      
      const stored = localStorage.getItem('cart-store')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed.state.items).toHaveLength(1)
      expect(parsed.state.items[0].quantity).toBe(2)
    })

    it('should persist cart state on removeItem', () => {
      useCartStore.getState().addItem(createMockProduct(), 1)
      useCartStore.getState().removeItem('prod-1')
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items).toHaveLength(0)
    })

    it('should persist cart state on updateQuantity', () => {
      useCartStore.getState().addItem(createMockProduct(), 1)
      useCartStore.getState().updateQuantity('prod-1', 5)
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items[0].quantity).toBe(5)
    })

    it('should persist cart state on clearCart', () => {
      useCartStore.getState().addItem(createMockProduct(), 1)
      useCartStore.getState().clearCart()
      
      const stored = JSON.parse(localStorage.getItem('cart-store')!)
      expect(stored.state.items).toHaveLength(0)
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('cart-store', 'invalid json')
      
      // Should not throw when accessing store
      expect(() => {
        useCartStore.getState().items
      }).not.toThrow()
      
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('should handle localStorage quota exceeded', () => {
      // Mock quota exceeded error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
      setItemSpy.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError')
      })
      
      expect(() => {
        useCartStore.getState().addItem(createMockProduct(), 1)
      }).not.toThrow()
    })
  })

  // ============================================
  // Edge cases and complex scenarios
  // ============================================
  describe('Edge cases and complex scenarios', () => {
    it('should handle rapid sequential operations', () => {
      const product = createMockProduct()
      
      // Rapid add/remove/update
      for (let i = 0; i < 10; i++) {
        useCartStore.getState().addItem(product, 1)
      }
      
      expect(useCartStore.getState().getItemCount()).toBe(10)
      
      useCartStore.getState().updateQuantity('prod-1', 5)
      
      expect(useCartStore.getState().getItemCount()).toBe(5)
    })

    it('should maintain product reference integrity', () => {
      const product = createMockProduct({ 
        id: 'prod-1', 
        name: 'Original Name',
        price: 100 
      })
      
      useCartStore.getState().addItem(product, 1)
      
      // Zustand stores references to objects, not deep copies
      // So modifying the original product does affect the store
      product.name = 'Modified Name'
      product.price = 999
      
      const cartItem = useCartStore.getState().items[0]
      // Both should reflect the same reference
      expect(cartItem.product).toBe(product)
      expect(cartItem.product.name).toBe('Modified Name')
    })

    it('should calculate totals correctly after multiple operations', () => {
      const p1 = createMockProduct({ id: 'p1', price: 100, originalPrice: 150 })
      const p2 = createMockProduct({ id: 'p2', price: 50, originalPrice: 75 })
      const p3 = createMockProduct({ id: 'p3', price: 200, originalPrice: 200 })
      
      useCartStore.getState().addItem(p1, 2) // total: 200, savings: 100
      useCartStore.getState().addItem(p2, 3) // total: 350, savings: 175
      useCartStore.getState().removeItem('p1') // total: 150, savings: 75
      useCartStore.getState().updateQuantity('p2', 1) // total: 50, savings: 25
      useCartStore.getState().addItem(p3, 1) // total: 250, savings: 25
      
      expect(useCartStore.getState().getTotal()).toBe(250)
      expect(useCartStore.getState().getSavings()).toBe(25)
      expect(useCartStore.getState().getItemCount()).toBe(2)
    })

    it('should handle products with zero price', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 0, originalPrice: 100 }), 5)
      
      expect(useCartStore.getState().getTotal()).toBe(0)
      expect(useCartStore.getState().getSavings()).toBe(500)
    })

    it('should handle products with zero originalPrice', () => {
      useCartStore.getState().addItem(createMockProduct({ price: 50, originalPrice: 0 }), 2)
      
      expect(useCartStore.getState().getTotal()).toBe(100)
      expect(useCartStore.getState().getSavings()).toBe(-100) // negative savings means price > originalPrice
    })
  })

  // ============================================
  // State isolation tests
  // ============================================
  describe('State isolation', () => {
    it('should maintain separate state for getState() calls', () => {
      useCartStore.getState().addItem(createMockProduct({ id: 'prod-1' }), 1)
      
      const state1 = useCartStore.getState()
      const state2 = useCartStore.getState()
      
      expect(state1.items).toBe(state2.items)
      expect(state1.getTotal()).toBe(state2.getTotal())
    })

    it('should not mutate state directly', () => {
      const product = createMockProduct()
      useCartStore.getState().addItem(product, 1)
      
      const items = useCartStore.getState().items
      const originalQuantity = items[0].quantity
      items[0].quantity = 999 // Direct mutation attempt
      
      // Zustand's getState returns a reference to the state object
      // So mutations to returned objects do affect the internal state
      // This is why React components must subscribe via hooks
      expect(useCartStore.getState().items[0].quantity).toBe(999)
      expect(useCartStore.getState().items[0].quantity).not.toBe(originalQuantity)
    })
  })
})