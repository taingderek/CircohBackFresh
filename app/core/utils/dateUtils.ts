/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a human-readable string
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jul 15, 2023")
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format a date to include time
 * @param date - The date to format
 * @returns Formatted date and time string (e.g., "Jul 15, 2023, 3:30 PM")
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get a relative time string (e.g., "2 days ago", "in 3 hours")
 * @param date - The date to compare with current time
 * @returns Relative time string
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffDay > 0) {
    return diffDay === 1 ? 'in 1 day' : `in ${diffDay} days`;
  } else if (diffDay < 0) {
    return diffDay === -1 ? '1 day ago' : `${Math.abs(diffDay)} days ago`;
  } else if (diffHour > 0) {
    return diffHour === 1 ? 'in 1 hour' : `in ${diffHour} hours`;
  } else if (diffHour < 0) {
    return diffHour === -1 ? '1 hour ago' : `${Math.abs(diffHour)} hours ago`;
  } else if (diffMin > 0) {
    return diffMin === 1 ? 'in 1 minute' : `in ${diffMin} minutes`;
  } else if (diffMin < 0) {
    return diffMin === -1 ? '1 minute ago' : `${Math.abs(diffMin)} minutes ago`;
  } else {
    return diffSec >= 0 ? 'just now' : 'just now';
  }
}

/**
 * Check if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @returns True if the date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > new Date().getTime();
}

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns True if the date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < new Date().getTime();
}

/**
 * Add days to a date
 * @param date - The original date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
} 