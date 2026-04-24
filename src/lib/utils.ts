type ClassValue = string | undefined | null | false;
type ClassFn = (state: any) => string | undefined;

export function cn(...classes: ClassValue[]): string;
export function cn(...classes: (ClassValue | ClassFn)[]): string | ClassFn;
export function cn(...classes: (ClassValue | ClassFn)[]) {
  const hasFn = classes.some((c) => typeof c === 'function');
  if (!hasFn) return (classes as ClassValue[]).filter(Boolean).join(' ');

  return (state: any) =>
    classes
      .map((c) => (typeof c === 'function' ? c(state) : c))
      .filter(Boolean)
      .join(' ');
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
