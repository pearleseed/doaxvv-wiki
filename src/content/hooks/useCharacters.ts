/**
 * useCharacters Hook
 * Convenience hook for loading character data
 */

import { useContent, UseContentOptions, UseContentResult } from './useContent';
import type { Character } from '../schemas/content.schema';

export function useCharacters(
  options?: UseContentOptions
): UseContentResult<Character> {
  return useContent<Character>('characters', options);
}
