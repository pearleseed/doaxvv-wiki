/**
 * useGuides Hook
 * Convenience hook for loading guide data
 */

import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Guide } from '../schemas/content.schema';

export function useGuides(
  options?: UseContentOptions
): UseContentResult<Guide> {
  return useContent<Guide>('guides', options);
}
