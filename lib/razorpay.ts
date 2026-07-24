import Razorpay from 'razorpay'

// Lazily initialize Razorpay client to avoid crash on import if keys missing
let _razorpay: Razorpay | null = null

function getRazorpayClient(): Razorpay {
  if (_razorpay) return _razorpay

  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET')
  }

  _razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
  return _razorpay
}

// Export as getter to avoid import-time crash
export function getRazorpay() {
  return getRazorpayClient()
}

// Also export directly for backward compatibility
export const razorpay = {
  get orders() {
    return getRazorpayClient().orders
  },
  get payments() {
    return getRazorpayClient().payments
  },
}

export function generateReceiptId(): string {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
