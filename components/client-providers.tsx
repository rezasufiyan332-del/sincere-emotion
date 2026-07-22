'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// PERFORMANCE: Lazy-load hidden client components (shown <5% of time)
// These are only rendered when cart/checkout is open
const CartSidebar = dynamic(
  () => import('@/components/cart-sidebar').then(m => ({ default: m.CartSidebar })),
  { loading: () => null, ssr: true }
)

const CheckoutModal = dynamic(
  () => import('@/components/checkout-modal').then(m => ({ default: m.CheckoutModal })),
  { loading: () => null, ssr: true }
)

const ToastContainer = dynamic(
  () => import('@/components/toast-container').then(m => ({ default: m.ToastContainer })),
  { loading: () => null, ssr: true }
)

export function ClientProviders() {
  return (
    <Suspense fallback={null}>
      <CartSidebar />
      <CheckoutModal />
      <ToastContainer />
    </Suspense>
  )
}
