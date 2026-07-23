import Razorpay from 'razorpay'

const keyId = process.env.RAZORPAY_KEY_ID!
const keySecret = process.env.RAZORPAY_KEY_SECRET!

if (!keyId || !keySecret) {
  throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET')
}

export const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

export function generateReceiptId(): string {
  return `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}