import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * The class-merge helper shadcn/ui components are written against: clsx for
 * conditionals, tailwind-merge so a caller's `className` reliably wins over a
 * component's defaults instead of both landing in the class list.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
