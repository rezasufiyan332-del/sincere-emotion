import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert paise/cents (DB value) to dollars/rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100
}

/**
 * Format price as USD string
 * @param dollars - Amount in dollars (e.g., 9 = $9)
 * @returns Formatted string like "$9" or "FREE"
 */
export function formatINR(dollars: number): string {
  if (dollars === 0) return 'FREE'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}

// Alias for clarity
export const formatUSD = formatINR
