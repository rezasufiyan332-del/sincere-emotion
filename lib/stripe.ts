import Stripe from 'stripe'

// Initialize Stripe with a fallback for build time
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build'

export const stripe = new Stripe(stripeKey, {
  typescript: true,
})
