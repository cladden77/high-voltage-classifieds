import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind CSS classes
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats condition values for display
 * @param condition - The condition value from the database
 * @returns The formatted condition string for display
 */
export function formatCondition(condition: string): string {
  switch (condition) {
    case 'like_new':
      return 'Like New'
    case 'good':
      return 'Good'
    case 'fair':
      return 'Fair'
    case 'poor':
      return 'Poor'
    case 'new':
      return 'New'
    default:
      return condition
  }
} 