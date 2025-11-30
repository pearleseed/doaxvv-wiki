import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Tag } from '../schemas/content.schema';

/**
 * Hook to fetch tags
 */
export function useTags(options?: UseContentOptions): UseContentResult<Tag> {
  return useContent<Tag>('tags', options);
}
