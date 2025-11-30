import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Category } from '../schemas/content.schema';

/**
 * Hook to fetch categories
 */
export function useCategories(options?: UseContentOptions): UseContentResult<Category> {
  return useContent<Category>('categories', options);
}
