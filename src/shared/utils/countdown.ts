/**
 * Represents the time remaining until a target date.
 */
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMilliseconds: number;
  isExpired: boolean;
}

/**
 * Calculates the time remaining until the specified end date.
 * Handles past dates gracefully by returning zero values with isExpired flag.
 *
 * @param endDate - The target end date
 * @param now - Optional current date for testing purposes (defaults to new Date())
 * @returns TimeRemaining object with days, hours, minutes, seconds, totalMilliseconds, and isExpired flag
 */
export function calculateTimeRemaining(
  endDate: Date,
  now: Date = new Date()
): TimeRemaining {
  const totalMilliseconds = endDate.getTime() - now.getTime();

  // Handle past dates gracefully
  if (totalMilliseconds <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMilliseconds: 0,
      isExpired: true,
    };
  }

  // Calculate time components
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMilliseconds,
    isExpired: false,
  };
}

/**
 * Formats the time remaining as a human-readable string.
 *
 * @param timeRemaining - The TimeRemaining object to format
 * @returns Formatted string like "2d 5h 30m 15s" or "Ended" if expired
 */
export function formatTimeRemaining(timeRemaining: TimeRemaining): string {
  if (timeRemaining.isExpired) {
    return 'Ended';
  }

  const parts: string[] = [];

  if (timeRemaining.days > 0) {
    parts.push(`${timeRemaining.days}d`);
  }
  if (timeRemaining.hours > 0 || timeRemaining.days > 0) {
    parts.push(`${timeRemaining.hours}h`);
  }
  if (timeRemaining.minutes > 0 || timeRemaining.hours > 0 || timeRemaining.days > 0) {
    parts.push(`${timeRemaining.minutes}m`);
  }
  parts.push(`${timeRemaining.seconds}s`);

  return parts.join(' ');
}
