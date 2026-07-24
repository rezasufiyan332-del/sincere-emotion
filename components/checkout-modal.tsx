'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CreditCard, Phone, Mail, User } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useUIStore } from '@/lib/store/ui'

type Step = 'contact' | 'payment' | 'success'

export function CheckoutModal() {
  const checkoutOpen = useUIStore((state) => state.checkoutOpen)
  const closeCheckout = useUIStore((state) => state.closeCheckout)
  const setLoading = useUIStore((state) => state.setLoading)
  const isLoading = useUIStore((state) => state.isLoading)
  const addToast = useUIStore((state) => state.addToast)

  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.getTotal())

  const [step, setStep] = useState<Step>('contact')
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [razorpayOptions, setRazorpayOptions] = useState<any>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!checkoutOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckout()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [checkoutOpen, closeCheckout])

  useEffect(() => {
    if (!checkoutOpen) return
    const modal = modalRef.current
    if (!modal) return
    const focusableSelector = 'input, button, [tabindex]:not([tabindex="-1"])'
    const focusFirst = () => {
      const first = modal.querySelector<HTMLElement>(focusableSelector)
      first?.focus()
    }
    const timer = setTimeout(focusFirst, 100)
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    modal.addEventListener('keydown', handleTab)
    return () => {
      clearTimeout(timer)
      modal.removeEventListener('keydown', handleTab)
    }
  }, [checkoutOpen])

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email address'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number required for payment'
    else if (!validatePhone(formData.phone)) newErrors.phone = 'Enter valid 10-digit Indian mobile number'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    setStep('payment')
  }

  const formatINR = (rupees: number) => {
    if (rupees === 0) return 'FREE'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rupees)
  }

  const handleRazorpayCheckout = async () => {
    setLoading(true)
    setErrors({})
    try {
      const apiItems = items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
      }))

      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: apiItems,
          email: formData.email,
          name: formData.name,
          phone: formData.phone.replace(/\D/g, ''),
        }),
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create payment order')
      }

      if (data.data.allFree) {
        addToast('success', 'All items are free! Redirecting to library...')
        setTimeout(() => {
          window.location.href = data.data.redirectUrl
        }, 1000)
        return
      }

      // Store razorpay options for payment
      setRazorpayOptions({
        key: data.data.keyId,
        amount: data.data.amount,
        currency: data.data.currency,
        name: data.data.name,
        description: data.data.description,
        order_id: data.data.orderId,
        prefill: data.data.customer,
        theme: data.data.theme,
        handler: async (response: any) => {
          // Payment successful - verify on server
          // SECURITY: Only pass response signature data
          await verifyPayment(response)
        },
        modal: {
          ondismiss: () => {
            addToast('error', 'Payment cancelled. Please try again.')
            setLoading(false)
          },
        },
      })

      setStep('success')
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Payment initialization failed. Please try again.')
      setLoading(false)
    }
  }

  const verifyPayment = async (response: any) => {
    try {
      // SECURITY: Only send Razorpay signature data
      // Items/customer come from Razorpay order notes (server-verified)
      const verifyRes = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        }),
      })

      const verifyData = await verifyRes.json()

      if (verifyData.success) {
        addToast('success', 'Payment successful! Welcome to your library.')
        window.location.href = verifyData.data.redirectUrl || '/library'
      } else {
        throw new Error(verifyData.error?.message || 'Payment verification failed')
      }
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Payment verification failed. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    closeCheckout()
    setStep('contact')
    setFormData({ name: '', email: '', phone: '' })
    setErrors({})
    setRazorpayOptions(null)
    setLoading(false) // Clear loading state on close
  }

  const inputClass =
    'w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors'

  useEffect(() => {
    if (step === 'success' && razorpayOptions) {
      // Load Razorpay script and open checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const rzp = new (window as any).Razorpay(razorpayOptions)
        rzp.open()
        rzp.on('payment.failed', (response: any) => {
          addToast('error', response.error?.description || 'Payment failed. Please try again.')
          setLoading(false)
          setStep('payment')
        })
      }
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, razorpayOptions])

  return (
    <AnimatePresence>
      {checkoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : resetAndClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl z-50 max-h-[90vh] overflow-y-auto"
            style={{ background: '#1a1a24' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 id="checkout-title" className="text-lg font-semibold text-white">Checkout</h2>
              <button
                onClick={resetAndClose}
                disabled={isLoading}
                className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                aria-label="Close checkout"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5">
              {step === 'contact' && (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="checkout-name" className="block text-sm font-medium text-foreground mb-1.5">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-email" className="block text-sm font-medium text-foreground mb-1.5">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClass}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="checkout-phone" className="block text-sm font-medium text-foreground mb-1.5">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone (for Razorpay)
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputClass}
                      placeholder="9876543210"
                      maxLength={10}
                    />
                    {errors.phone && <p className="text-rose-400 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div className="border border-border rounded-lg p-4 mt-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Order Summary</h3>
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex justify-between text-sm text-muted-foreground mb-2"
                      >
                        <span>
                          {item.product.name} &times;{item.quantity}
                        </span>
                        <span className="text-foreground">
                          {formatINR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 mt-3 flex justify-between font-semibold text-white text-sm">
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex justify-between font-semibold text-white text-sm">
                      <span>Total</span>
                      <span>{formatINR(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRazorpayCheckout}
                    disabled={isLoading}
                    className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {isLoading ? 'Loading payment...' : 'Pay with Razorpay'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('contact')}
                    disabled={isLoading}
                    className="w-full py-2.5 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-10 space-y-4">
                  <div className="flex justify-center">
                    <Loader2 className="w-14 h-14 text-[#f59e0b] animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Opening Razorpay...</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your payment securely on Razorpay.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}