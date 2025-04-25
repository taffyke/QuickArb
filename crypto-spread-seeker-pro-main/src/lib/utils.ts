import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and tailwind classes together
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
