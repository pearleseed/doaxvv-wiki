import { describe, it, expect } from 'vitest';
import {
  calculateTimeRemaining,
  formatTimeRemaining,
} from '../../../src/shared/utils/countdown';

describe('countdown utils', () => {
  describe('calculateTimeRemaining', () => {
    it('should calculate time remaining correctly', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-02T05:30:45Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(1);
      expect(result.hours).toBe(5);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(45);
      expect(result.isExpired).toBe(false);
    });

    it('should handle expired dates', () => {
      const now = new Date('2024-01-02T00:00:00Z');
      const endDate = new Date('2024-01-01T00:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(0);
      expect(result.isExpired).toBe(true);
      expect(result.totalMilliseconds).toBe(0);
    });

    it('should handle same date', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T00:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.isExpired).toBe(true);
    });

    it('should calculate hours correctly', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T23:59:59Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(23);
      expect(result.minutes).toBe(59);
      expect(result.seconds).toBe(59);
    });

    it('should calculate minutes correctly', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T00:59:30Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(59);
      expect(result.seconds).toBe(30);
    });

    it('should calculate seconds correctly', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T00:00:45Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(0);
      expect(result.hours).toBe(0);
      expect(result.minutes).toBe(0);
      expect(result.seconds).toBe(45);
    });

    it('should handle multiple days', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-10T12:30:15Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(9);
      expect(result.hours).toBe(12);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(15);
    });

    it('should include totalMilliseconds', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-01T01:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.totalMilliseconds).toBe(3600000); // 1 hour in ms
    });
  });

  describe('formatTimeRemaining', () => {
    it('should format expired time', () => {
      const timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMilliseconds: 0,
        isExpired: true,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('Ended');
    });

    it('should format days, hours, minutes, seconds', () => {
      const timeRemaining = {
        days: 2,
        hours: 5,
        minutes: 30,
        seconds: 15,
        totalMilliseconds: 192615000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('2d 5h 30m 15s');
    });

    it('should format hours, minutes, seconds', () => {
      const timeRemaining = {
        days: 0,
        hours: 5,
        minutes: 30,
        seconds: 15,
        totalMilliseconds: 19815000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('5h 30m 15s');
    });

    it('should format minutes and seconds', () => {
      const timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 30,
        seconds: 15,
        totalMilliseconds: 1815000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('30m 15s');
    });

    it('should format seconds only', () => {
      const timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 45,
        totalMilliseconds: 45000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('45s');
    });

    it('should include zero hours when days are present', () => {
      const timeRemaining = {
        days: 1,
        hours: 0,
        minutes: 30,
        seconds: 15,
        totalMilliseconds: 88215000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('1d 0h 30m 15s');
    });

    it('should include zero minutes when hours are present', () => {
      const timeRemaining = {
        days: 0,
        hours: 2,
        minutes: 0,
        seconds: 15,
        totalMilliseconds: 7215000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('2h 0m 15s');
    });

    it('should handle very large time spans', () => {
      const timeRemaining = {
        days: 365,
        hours: 23,
        minutes: 59,
        seconds: 59,
        totalMilliseconds: 31622399000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('365d 23h 59m 59s');
    });

    it('should handle single digit values', () => {
      const timeRemaining = {
        days: 1,
        hours: 2,
        minutes: 3,
        seconds: 4,
        totalMilliseconds: 93784000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('1d 2h 3m 4s');
    });

    it('should handle zero seconds', () => {
      const timeRemaining = {
        days: 0,
        hours: 0,
        minutes: 1,
        seconds: 0,
        totalMilliseconds: 60000,
        isExpired: false,
      };

      expect(formatTimeRemaining(timeRemaining)).toBe('1m 0s');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year calculations', () => {
      const now = new Date('2024-02-28T00:00:00Z');
      const endDate = new Date('2024-03-01T00:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBe(2); // 2024 is a leap year
    });

    it('should handle timezone differences', () => {
      const now = new Date('2024-01-01T00:00:00+00:00');
      const endDate = new Date('2024-01-01T00:00:00-05:00');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.hours).toBeGreaterThan(0);
    });

    it('should handle millisecond precision', () => {
      const now = new Date('2024-01-01T00:00:00.000Z');
      const endDate = new Date('2024-01-01T00:00:00.999Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.totalMilliseconds).toBe(999);
    });

    it('should handle very far future dates', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2100-01-01T00:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.days).toBeGreaterThan(27000);
      expect(result.isExpired).toBe(false);
    });

    it('should handle dates in the past', () => {
      const now = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2023-01-01T00:00:00Z');

      const result = calculateTimeRemaining(endDate, now);

      expect(result.isExpired).toBe(true);
      expect(result.totalMilliseconds).toBe(0);
    });
  });
});
