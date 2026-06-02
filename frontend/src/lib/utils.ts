import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes with clsx — the standard cn() utility */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
