import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format paise (smallest currency unit) to INR display string
 * @param paise - Amount in paise (e.g., 200 = ₹2)
 * @returns Formatted string like "₹2" or "FREE"
 */
export function formatINR(paise: number): string {
  if (paise === 0) return 'FREE'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100)
}
