/**
 * useTools Hook
 * Convenience hook for loading tool data
 */

import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Tool } from '../schemas/content.schema';

export function useTools(
  options?: UseContentOptions
): UseContentResult<Tool> {
  return useContent<Tool>('tools', options);
}
