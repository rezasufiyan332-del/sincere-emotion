'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'

export function CartSidebar() {
  const cartOpen = useUIStore((state) => state.cartOpen)
  const toggleCart = useUIStore((state) => state.toggleCart)
  const openCheckout = useUIStore((state) => state.openCheckout)

  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const total = useCartStore((state) => state.getTotal())
  const savings = useCartStore((state) => state.getSavings())

  useEffect(() => {
    if (!cartOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCart()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [cartOpen, toggleCart])

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-40"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 flex flex-col"
            style={{ background: '#12121a' }}
            role="dialog"
            aria-label="Shopping Cart"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-white">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-1 hover:bg-muted rounded transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Your cart is empty</p>
                  <a
                    href="#product"
                    onClick={toggleCart}
                    className="inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Browse Guides
                  </a>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 rounded-lg border border-border"
                  >
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm font-semibold text-primary mt-0.5">
                        ${item.product.price}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <span className="w-6 text-center text-sm text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto p-1 hover:text-rose-500 text-muted-foreground transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border p-6 space-y-3">
                {savings > 0 && (
                  <p className="text-sm text-primary">
                    You&apos;re saving ${savings.toFixed(2)}
                  </p>
                )}
                <div className="flex justify-between text-base font-semibold text-white">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    openCheckout()
                    toggleCart()
                  }}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
