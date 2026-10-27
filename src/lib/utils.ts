import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

export function formatDateTime(date: Date | string | any | undefined): string {
  if (!date) return 'N/A';
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date && typeof date === 'object' && 'seconds' in date) {
    // Handle Firestore Timestamp
    d = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  return d.toLocaleString('en-MV', {
    timeZone: 'Indian/Maldives',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: Date | string | any | undefined): string {
  if (!date) return 'N/A';
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date && typeof date === 'object' && 'seconds' in date) {
    // Handle Firestore Timestamp
    d = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  return d.toLocaleDateString('en-MV', {
    timeZone: 'Indian/Maldives',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatTime(date: Date | string | any | undefined): string {
  if (!date) return 'N/A';
  let d: Date;
  if (typeof date === 'string') {
    d = new Date(date);
  } else if (date && typeof date === 'object' && 'seconds' in date) {
    // Handle Firestore Timestamp
    d = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }
  return d.toLocaleTimeString('en-MV', {
    timeZone: 'Indian/Maldives',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDurationMinutes(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function isOverdue(expectedDate: Date | string | undefined): boolean {
  if (!expectedDate) return false;
  const expected = typeof expectedDate === 'string' ? new Date(expectedDate) : expectedDate;
  return new Date() > expected;
}
