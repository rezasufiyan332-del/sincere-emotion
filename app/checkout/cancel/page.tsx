'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { XCircle, CreditCard, ArrowLeft, RotateCcw, Mail, Loader2 } from 'lucide-react'

type ErrorType = 'canceled' | 'failed' | 'expired' | 'unknown'

const errorMessages: Record<ErrorType, { title: string; description: string }> = {
  canceled: {
    title: 'Payment Canceled',
    description: 'You returned without completing the payment. Your cart has been preserved.',
  },
  failed: {
    title: 'Payment Failed',
    description: 'Your payment could not be processed. Please try again or use a different payment method.',
  },
  expired: {
    title: 'Session Expired',
    description: 'Your checkout session has expired. Please start a new checkout.',
  },
  unknown: {
    title: 'Payment Issue',
    description: 'Something went wrong with your payment. Please try again or contact support.',
  },
}

function formatINR(paise: number): string {
  if (paise === 0) return 'FREE'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}

export default function CheckoutFailurePage() {
  const searchParams = useSearchParams()
  const errorType = (searchParams.get('error') as ErrorType) || 'unknown'
  const sessionId = searchParams.get('session_id')
  const { items, getTotal } = useCartStore()
  const total = getTotal()

  const { title, description } = errorMessages[errorType]

  const handleRetry = () => {
    if (sessionId && errorType === 'expired') {
      window.location.href = '/checkout'
    } else {
      window.history.back()
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-rose-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        {items.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-left">
            <h3 className="font-semibold text-foreground">Your Cart ({items.length} items)</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{item.product.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatINR(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {errorType === 'expired' ? 'Start New Checkout' : 'Retry Payment'}
          </button>

          <Link
            href="/#product"
            className="w-full py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 block"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <a
            href="mailto:support@sincereemotion.com"
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          If you were charged but see this page, please contact support with your email and the
          approximate time of purchase.
        </p>
      </div>
    </div>
  )
}