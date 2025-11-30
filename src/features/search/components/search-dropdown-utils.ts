/**
 * Utility functions and constants for SearchDropdown
 */

import { Users, Sparkles, Calendar, Gift, BookOpen, Package, Film } from "lucide-react";
import type { SearchResult, SearchResults } from "@/services";

export const CONTENT_TYPE_CONFIG: Record<SearchResult['type'], { label: string; icon: typeof Users; color: string }> = {
  character: { label: 'Characters', icon: Users, color: 'text-tec' },
  swimsuit: { label: 'Swimsuits', icon: Sparkles, color: 'text-secondary' },
  event: { label: 'Events', icon: Calendar, color: 'text-ssr' },
  gacha: { label: 'Gachas', icon: Gift, color: 'text-apl' },
  guide: { label: 'Guides', icon: BookOpen, color: 'text-stm' },
  item: { label: 'Items', icon: Package, color: 'text-muted-foreground' },
  episode: { label: 'Episodes', icon: Film, color: 'text-accent' },
};

export const CONTENT_TYPE_ORDER: SearchResult['type'][] = [
  'character',
  'swimsuit',
  'event',
  'gacha',
  'guide',
  'item',
  'episode',
];

export function getResultsByType(results: SearchResults, type: SearchResult['type']): SearchResult[] {
  switch (type) {
    case 'character':
      return results.characters;
    case 'swimsuit':
      return results.swimsuits;
    case 'event':
      return results.events;
    case 'gacha':
      return results.gachas;
    case 'guide':
      return results.guides;
    case 'item':
      return results.items;
    case 'episode':
      return results.episodes;
    default:
      return [];
  }
}

export function getFlattenedResults(results: SearchResults): SearchResult[] {
  const flattened: SearchResult[] = [];
  
  for (const type of CONTENT_TYPE_ORDER) {
    const typeResults = getResultsByType(results, type);
    flattened.push(...typeResults);
  }
  
  return flattened;
}
