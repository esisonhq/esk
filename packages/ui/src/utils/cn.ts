import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally join class names and intelligently merge Tailwind CSS classes.
 *
 * @param inputs - A variadic list of class name values, which can include strings, arrays, objects, or falsy values.
 * These are processed by `clsx` to produce a single class string, then merged by `tailwind-merge` to resolve conflicts.
 *
 * @returns A single string of merged class names with Tailwind conflict resolution applied.
 *
 * @remarks
 * - `clsx` handles conditional logic and deduplication of class names.
 * - `twMerge` ensures that conflicting Tailwind classes (e.g. `p-2` vs `p-4`) are resolved correctly.
 *
 * @example
 * ```tsx
 * <div className={cn("p-2", isActive && "bg-blue-500", "p-4")} />
 * // Result: "bg-blue-500 p-4"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  // First, clsx filters and joins the class values into a single string
  // Then, twMerge resolves any Tailwind CSS class conflicts
  return twMerge(clsx(inputs));
}
