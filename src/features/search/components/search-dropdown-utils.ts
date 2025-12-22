/**
 * Utility functions and constants for SearchDropdown
 */

import { Users, Sparkles, Calendar, Gift, BookOpen, Package, Film, Wrench, Crown, Target, HelpCircle } from "lucide-react";
import type { SearchResult, SearchResults } from "@/services";

export const CONTENT_TYPE_CONFIG: Record<SearchResult['type'], { label: string; icon: typeof Users; color: string }> = {
  character: { label: 'Characters', icon: Users, color: 'text-tec' },
  swimsuit: { label: 'Swimsuits', icon: Sparkles, color: 'text-secondary' },
  event: { label: 'Events', icon: Calendar, color: 'text-ssr' },
  gacha: { label: 'Gachas', icon: Gift, color: 'text-apl' },
  guide: { label: 'Guides', icon: BookOpen, color: 'text-stm' },
  item: { label: 'Items', icon: Package, color: 'text-muted-foreground' },
  episode: { label: 'Episodes', icon: Film, color: 'text-accent' },
  tool: { label: 'Tools', icon: Wrench, color: 'text-primary' },
  accessory: { label: 'Accessories', icon: Crown, color: 'text-ssr' },
  mission: { label: 'Missions', icon: Target, color: 'text-stm' },
  quiz: { label: 'Quizzes', icon: HelpCircle, color: 'text-tec' },
};

export const CONTENT_TYPE_ORDER: SearchResult['type'][] = [
  'character',
  'swimsuit',
  'event',
  'gacha',
  'guide',
  'item',
  'episode',
  'tool',
  'accessory',
  'mission',
  'quiz',
];

export function getResultsByType(results: SearchResults, type: SearchResult['type']): SearchResult[] {
  switch (type) {
    case 'character':
      return results.characters || [];
    case 'swimsuit':
      return results.swimsuits || [];
    case 'event':
      return results.events || [];
    case 'gacha':
      return results.gachas || [];
    case 'guide':
      return results.guides || [];
    case 'item':
      return results.items || [];
    case 'episode':
      return results.episodes || [];
    case 'tool':
      return results.tools || [];
    case 'accessory':
      return results.accessories || [];
    case 'mission':
      return results.missions || [];
    case 'quiz':
      return results.quizzes || [];
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
