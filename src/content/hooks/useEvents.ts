/**
 * useEvents Hook
 * Convenience hook for loading event data
 */

import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Event } from '../schemas/content.schema';

export function useEvents(
  options?: UseContentOptions
): UseContentResult<Event> {
  return useContent<Event>('events', options);
}
