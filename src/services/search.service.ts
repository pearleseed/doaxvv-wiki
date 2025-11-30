/**
 * Search Service
 * Provides centralized search functionality across all content types
 * Implements case-insensitive matching with language support
 */

import { contentLoader } from '@/content/loader';
import type { Character, Swimsuit, Event, Gacha, Guide, Item, Episode } from '@/content/schemas/content.schema';
import type { LocalizedString, LanguageCode } from '@/shared/types/localization';

export interface SearchResult {
  type: 'character' | 'swimsuit' | 'event' | 'gacha' | 'guide' | 'item' | 'episode';
  id: number;
  unique_key: string;
  title: string;
  subtitle?: string;
  image: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  url: string;
}

export interface SearchResults {
  characters: SearchResult[];
  swimsuits: SearchResult[];
  events: SearchResult[];
  gachas: SearchResult[];
  guides: SearchResult[];
  items: SearchResult[];
  episodes: SearchResult[];
  total: number;
}

export interface SearchOptions {
  maxPerType?: number;
  language?: LanguageCode;
}

const DEFAULT_MAX_PER_TYPE = 5;
const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Get localized value from a LocalizedString object
 */
function getLocalizedValue(localized: LocalizedString | undefined, language: LanguageCode): string {
  if (!localized) return '';
  return localized[language] || localized.en || localized.jp || '';
}

/**
 * Check if a string matches the query (case-insensitive)
 */
function matchesQuery(value: string | undefined, query: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query.toLowerCase());
}

/**
 * Check if a LocalizedString matches the query in the specified language
 */
function matchesLocalizedQuery(
  localized: LocalizedString | undefined,
  query: string,
  language: LanguageCode
): boolean {
  if (!localized) return false;
  const value = getLocalizedValue(localized, language);
  return matchesQuery(value, query);
}

export class SearchService {
  private static instance: SearchService;

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }


  /**
   * Search across all content types
   * Returns results grouped by type with configurable limits
   */
  search(query: string, options: SearchOptions = {}): SearchResults {
    const { maxPerType = DEFAULT_MAX_PER_TYPE, language = DEFAULT_LANGUAGE } = options;

    // Return empty results for empty or whitespace-only queries
    if (!query || !query.trim()) {
      return this.createEmptyResults();
    }

    const trimmedQuery = query.trim();

    return {
      characters: this.searchCharacters(trimmedQuery, maxPerType, language),
      swimsuits: this.searchSwimsuits(trimmedQuery, maxPerType, language),
      events: this.searchEvents(trimmedQuery, maxPerType, language),
      gachas: this.searchGachas(trimmedQuery, maxPerType, language),
      guides: this.searchGuides(trimmedQuery, maxPerType, language),
      items: this.searchItems(trimmedQuery, maxPerType, language),
      episodes: this.searchEpisodes(trimmedQuery, maxPerType, language),
      get total() {
        return (
          this.characters.length +
          this.swimsuits.length +
          this.events.length +
          this.gachas.length +
          this.guides.length +
          this.items.length +
          this.episodes.length
        );
      },
    };
  }

  private createEmptyResults(): SearchResults {
    return {
      characters: [],
      swimsuits: [],
      events: [],
      gachas: [],
      guides: [],
      items: [],
      episodes: [],
      total: 0,
    };
  }

  /**
   * Search characters by name
   */
  private searchCharacters(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const characters = contentLoader.getCharacters();
    const matches = characters.filter((char) =>
      matchesLocalizedQuery(char.name, query, language) ||
      matchesQuery(char.title, query)
    );

    return matches.slice(0, maxResults).map((char) => this.transformCharacter(char, language));
  }

  /**
   * Search swimsuits by name
   */
  private searchSwimsuits(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const swimsuits = contentLoader.getSwimsuits();
    const matches = swimsuits.filter((suit) =>
      matchesLocalizedQuery(suit.name, query, language) ||
      matchesQuery(suit.title, query) ||
      matchesQuery(suit.character, query)
    );

    return matches.slice(0, maxResults).map((suit) => this.transformSwimsuit(suit, language));
  }

  /**
   * Search events by name
   */
  private searchEvents(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const events = contentLoader.getEvents();
    const matches = events.filter((event) =>
      matchesLocalizedQuery(event.name, query, language) ||
      matchesQuery(event.title, query)
    );

    return matches.slice(0, maxResults).map((event) => this.transformEvent(event, language));
  }

  /**
   * Search gachas by name
   */
  private searchGachas(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const gachas = contentLoader.getGachas();
    const matches = gachas.filter((gacha) =>
      matchesLocalizedQuery(gacha.name, query, language)
    );

    return matches.slice(0, maxResults).map((gacha) => this.transformGacha(gacha, language));
  }

  /**
   * Search guides by title
   */
  private searchGuides(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const guides = contentLoader.getGuides();
    const matches = guides.filter((guide) =>
      matchesLocalizedQuery(guide.localizedTitle, query, language) ||
      matchesQuery(guide.title, query)
    );

    return matches.slice(0, maxResults).map((guide) => this.transformGuide(guide, language));
  }

  /**
   * Search items by name
   */
  private searchItems(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const items = contentLoader.getItems();
    const matches = items.filter((item) =>
      matchesLocalizedQuery(item.name, query, language) ||
      matchesQuery(item.title, query)
    );

    return matches.slice(0, maxResults).map((item) => this.transformItem(item, language));
  }

  /**
   * Search episodes by name
   */
  private searchEpisodes(query: string, maxResults: number, language: LanguageCode): SearchResult[] {
    const episodes = contentLoader.getEpisodes();
    const matches = episodes.filter((episode) =>
      matchesLocalizedQuery(episode.name, query, language) ||
      matchesQuery(episode.title, query)
    );

    return matches.slice(0, maxResults).map((episode) => this.transformEpisode(episode, language));
  }

  /**
   * Transform Character to SearchResult
   * Displays: image, name, type (SSR/SR/R)
   */
  private transformCharacter(char: Character, language: LanguageCode): SearchResult {
    return {
      type: 'character',
      id: char.id,
      unique_key: char.unique_key,
      title: getLocalizedValue(char.name, language),
      image: char.image,
      badge: char.type,
      badgeVariant: this.getRarityBadgeVariant(char.type),
      url: `/girls/${char.unique_key}`,
    };
  }

  /**
   * Transform Swimsuit to SearchResult
   * Displays: image, name, rarity, character name
   */
  private transformSwimsuit(suit: Swimsuit, language: LanguageCode): SearchResult {
    return {
      type: 'swimsuit',
      id: suit.id,
      unique_key: suit.unique_key,
      title: getLocalizedValue(suit.name, language),
      subtitle: suit.character,
      image: suit.image,
      badge: suit.rarity,
      badgeVariant: this.getRarityBadgeVariant(suit.rarity),
      url: `/swimsuits/${suit.unique_key}`,
    };
  }

  /**
   * Transform Event to SearchResult
   * Displays: image, name, type, status
   */
  private transformEvent(event: Event, language: LanguageCode): SearchResult {
    return {
      type: 'event',
      id: event.id,
      unique_key: event.unique_key,
      title: getLocalizedValue(event.name, language),
      subtitle: event.type,
      image: event.image,
      badge: event.event_status,
      badgeVariant: this.getEventStatusBadgeVariant(event.event_status),
      url: `/events/${event.unique_key}`,
    };
  }

  /**
   * Transform Gacha to SearchResult
   * Displays: image, name, status
   */
  private transformGacha(gacha: Gacha, language: LanguageCode): SearchResult {
    return {
      type: 'gacha',
      id: gacha.id,
      unique_key: gacha.unique_key,
      title: getLocalizedValue(gacha.name, language),
      image: gacha.image,
      badge: gacha.gacha_status,
      badgeVariant: this.getGachaStatusBadgeVariant(gacha.gacha_status),
      url: `/gachas/${gacha.unique_key}`,
    };
  }

  /**
   * Transform Guide to SearchResult
   * Displays: image, title, difficulty, read time
   */
  private transformGuide(guide: Guide, language: LanguageCode): SearchResult {
    return {
      type: 'guide',
      id: guide.id,
      unique_key: guide.unique_key,
      title: getLocalizedValue(guide.localizedTitle, language),
      subtitle: `${guide.difficulty} • ${guide.read_time}`,
      image: guide.image,
      badge: guide.difficulty,
      badgeVariant: this.getDifficultyBadgeVariant(guide.difficulty),
      url: `/guides/${guide.unique_key}`,
    };
  }

  /**
   * Transform Item to SearchResult
   * Displays: image, name, type, rarity
   */
  private transformItem(item: Item, language: LanguageCode): SearchResult {
    return {
      type: 'item',
      id: item.id,
      unique_key: item.unique_key,
      title: getLocalizedValue(item.name, language),
      subtitle: item.type,
      image: item.image,
      badge: item.rarity,
      badgeVariant: this.getItemRarityBadgeVariant(item.rarity),
      url: `/items/${item.unique_key}`,
    };
  }

  /**
   * Transform Episode to SearchResult
   * Displays: image, name, type, status
   */
  private transformEpisode(episode: Episode, language: LanguageCode): SearchResult {
    return {
      type: 'episode',
      id: episode.id,
      unique_key: episode.unique_key,
      title: getLocalizedValue(episode.name, language),
      subtitle: episode.type,
      image: episode.image,
      badge: episode.episode_status,
      badgeVariant: this.getEpisodeStatusBadgeVariant(episode.episode_status),
      url: `/episodes/${episode.unique_key}`,
    };
  }

  /**
   * Get badge variant for character/swimsuit rarity
   */
  private getRarityBadgeVariant(rarity: 'SSR' | 'SR' | 'R'): 'default' | 'secondary' | 'outline' {
    switch (rarity) {
      case 'SSR':
        return 'default';
      case 'SR':
        return 'secondary';
      case 'R':
        return 'outline';
    }
  }

  /**
   * Get badge variant for item rarity
   */
  private getItemRarityBadgeVariant(rarity: 'SSR' | 'SR' | 'R' | 'N'): 'default' | 'secondary' | 'outline' {
    switch (rarity) {
      case 'SSR':
        return 'default';
      case 'SR':
        return 'secondary';
      case 'R':
      case 'N':
        return 'outline';
    }
  }

  /**
   * Get badge variant for event status
   */
  private getEventStatusBadgeVariant(status: 'Active' | 'Upcoming' | 'Ended'): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Upcoming':
        return 'secondary';
      case 'Ended':
        return 'destructive';
    }
  }

  /**
   * Get badge variant for gacha status
   */
  private getGachaStatusBadgeVariant(status: 'Active' | 'Coming Soon' | 'Ended'): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Coming Soon':
        return 'secondary';
      case 'Ended':
        return 'destructive';
    }
  }

  /**
   * Get badge variant for guide difficulty
   */
  private getDifficultyBadgeVariant(difficulty: 'Easy' | 'Medium' | 'Hard'): 'default' | 'secondary' | 'destructive' {
    switch (difficulty) {
      case 'Easy':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Hard':
        return 'destructive';
    }
  }

  /**
   * Get badge variant for episode status
   */
  private getEpisodeStatusBadgeVariant(status: 'Available' | 'Coming Soon' | 'Limited'): 'default' | 'secondary' | 'destructive' {
    switch (status) {
      case 'Available':
        return 'default';
      case 'Coming Soon':
        return 'secondary';
      case 'Limited':
        return 'destructive';
    }
  }
}

// Export singleton instance
export const searchService = SearchService.getInstance();
