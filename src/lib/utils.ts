import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string;
export function cn<S>(...inputs: (ClassValue | ((state: S) => ClassValue))[]): (state: S) => string;
export function cn<S>(...inputs: (ClassValue | ((state: S) => ClassValue))[]) {
  const hasFn = inputs.some((i) => typeof i === 'function');
  if (hasFn) {
    return (state: S) =>
      twMerge(
        clsx(inputs.map((i) => (typeof i === 'function' ? i(state) : i)))
      );
  }
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
}

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function calculateProgress(current: number, total: number): number {
  return Math.round((current / total) * 100);
}

export function getYearRange(startYear: number, endYear?: number): string {
  if (endYear) {
    return `${startYear} - ${endYear}`;
  }
  return `${startYear} - Present`;
}
