/**
 * Class name utility function for conditional classes
 * @author Peter Boden
 * @version 1.0
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * Handles conditional classes and merges conflicting classes intelligently
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}