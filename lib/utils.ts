import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert paise (DB value) to rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100
}

/**
 * Format rupees to INR display string
 * @param rupees - Amount in rupees (e.g., 2 = ₹2)
 * @returns Formatted string like "₹2" or "FREE"
 */
export function formatINR(rupees: number): string {
  if (rupees === 0) return 'FREE'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}
