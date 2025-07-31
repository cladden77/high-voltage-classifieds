/**
 * Client-safe formatting utilities
 * These functions can be safely imported in both client and server components
 */

/**
 * Format price as currency
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

/**
 * Calculate platform fee (for future use)
 * @param amount - The base amount
 * @param feePercentage - Fee percentage (default 2.9%)
 * @returns Fee amount in cents
 */
export function calculatePlatformFee(amount: number, feePercentage: number = 2.9): number {
  return Math.round(amount * 100 * (feePercentage / 100))
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format large numbers with commas
 * @param num - Number to format
 * @returns Formatted number string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}