/**
 * Content Loader
 * Loads and caches CSV content with automatic validation
 * Supports multi-language content with LocalizedString fields
 * 
 * Refactored to use PapaParse directly with lazy loading,
 * caching, and request deduplication built-in.
 */

import { parseCSV } from './utils/csv-parser';
import type { Guide, Character, Event, Festival, Gacha, Swimsuit, Item, Episode, Category, Tag, Tool, BaseContent, SwimsuitSkill } from './schemas/content.schema';
import type { LocalizedString } from '../shared/types/localization';

// Re-export Festival type for lookup map
type FestivalType = Festival;

// Import CSV files as raw text
import guidesCSV from './data/guides.csv?raw';
import charactersCSV from './data/characters.csv?raw';
import eventsCSV from './data/events.csv?raw';
import swimsuitsCSV from './data/swimsuits.csv?raw';
import itemsCSV from './data/items.csv?raw';
import categoriesCSV from './data/categories.csv?raw';
import tagsCSV from './data/tags.csv?raw';
import gachasCSV from './data/gachas.csv?raw';
import episodesCSV from './data/episodes.csv?raw';
import toolsCSV from './data/tools.csv?raw';

/**
 * Helper function to create a LocalizedString from CSV fields
 * Looks for fields with _en, _jp, _cn, _tw, _kr suffixes
 */
export function createLocalizedStringFromCSV(raw: any, fieldName: string): LocalizedString {
  return {
    en: raw[`${fieldName}_en`] || raw[fieldName] || '',
    jp: raw[`${fieldName}_jp`] || raw[fieldName] || '',
    cn: raw[`${fieldName}_cn`] || undefined,
    tw: raw[`${fieldName}_tw`] || undefined,
    kr: raw[`${fieldName}_kr`] || undefined,
  };
}

/**
 * Helper function to create a LocalizedString from a single value (fallback)
 * Uses the same value for both en and jp (required fields)
 */
export function createLocalizedString(value: string): LocalizedString {
  return {
    en: value,
    jp: value,
  };
}

/**
 * Transform raw character data to include LocalizedString fields
 */
export function transformCharacter(raw: any): Character {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.name_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.summary || `${raw.name_en || raw.title || 'Character'} - ${raw.type} Character`,
    category: 'Characters',
    tags: raw.tags ? raw.tags.split('|') : ['Stats'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    type: raw.type,
    image: raw.image,
    stats: typeof raw.stats === 'string' ? JSON.parse(raw.stats) : raw.stats,
    // LocalizedString fields
    name: createLocalizedStringFromCSV(raw, 'name'),
    age: raw.age_en ? createLocalizedStringFromCSV(raw, 'age') : undefined,
    birthday: createLocalizedStringFromCSV(raw, 'birthday'),
    height: createLocalizedStringFromCSV(raw, 'height'),
    measurements: raw.measurements_en ? createLocalizedStringFromCSV(raw, 'measurements') : undefined,
    blood_type: raw.blood_type_en ? createLocalizedStringFromCSV(raw, 'blood_type') : undefined,
    job: raw.job_en ? createLocalizedStringFromCSV(raw, 'job') : undefined,
    hobby: createLocalizedStringFromCSV(raw, 'hobby'),
    food: raw.food_en ? createLocalizedStringFromCSV(raw, 'food') : undefined,
    color: raw.color_en ? createLocalizedStringFromCSV(raw, 'color') : undefined,
    cast: raw.cast_en ? { en: raw.cast_en, jp: raw.cast_jp } : undefined,
  };
}


/**
 * Transform raw swimsuit data to include LocalizedString fields
 */
export function transformSwimsuit(raw: any): Swimsuit {
  // Transform skills from CSV fields
  const skills: SwimsuitSkill[] = [];
  
  if (raw.skill1_name_en) {
    skills.push({
      name: createLocalizedStringFromCSV(raw, 'skill1_name'),
      description: createLocalizedStringFromCSV(raw, 'skill1_desc'),
    });
  }
  if (raw.skill2_name_en) {
    skills.push({
      name: createLocalizedStringFromCSV(raw, 'skill2_name'),
      description: createLocalizedStringFromCSV(raw, 'skill2_desc'),
    });
  }
  if (raw.skill3_name_en) {
    skills.push({
      name: createLocalizedStringFromCSV(raw, 'skill3_name'),
      description: createLocalizedStringFromCSV(raw, 'skill3_desc'),
    });
  }

  return {
    id: parseInt(raw.id) || 0,
    title: raw.name_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.summary || `${raw.name_en || raw.title || 'Swimsuit'} (${raw.rarity}) for ${raw.character_id}`,
    category: 'Swimsuits',
    tags: raw.tags ? raw.tags.split('|') : ['Suits'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    rarity: raw.rarity,
    character: raw.character_id ? raw.character_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : '',
    character_id: raw.character_id,
    image: raw.image,
    stats: typeof raw.stats === 'string' ? JSON.parse(raw.stats) : raw.stats,
    // LocalizedString fields
    name: createLocalizedStringFromCSV(raw, 'name'),
    skills,
    // Numeric stat fields
    max_level: raw.max_level ? parseInt(raw.max_level) : undefined,
    base_pow: raw.base_pow ? parseInt(raw.base_pow) : undefined,
    max_pow: raw.max_pow ? parseInt(raw.max_pow) : undefined,
    base_tec: raw.base_tec ? parseInt(raw.base_tec) : undefined,
    max_tec: raw.max_tec ? parseInt(raw.max_tec) : undefined,
    base_stm: raw.base_stm ? parseInt(raw.base_stm) : undefined,
    max_stm: raw.max_stm ? parseInt(raw.max_stm) : undefined,
    base_apl: raw.base_apl ? parseInt(raw.base_apl) : undefined,
    max_apl: raw.max_apl ? parseInt(raw.max_apl) : undefined,
    pow_growth: raw.pow_growth ? parseFloat(raw.pow_growth) : undefined,
    tec_growth: raw.tec_growth ? parseFloat(raw.tec_growth) : undefined,
    stm_growth: raw.stm_growth ? parseFloat(raw.stm_growth) : undefined,
    apl_growth: raw.apl_growth ? parseFloat(raw.apl_growth) : undefined,
  };
}

/**
 * Transform raw event data to include LocalizedString fields
 */
export function transformEvent(raw: any): Event {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.name_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.description_en || raw.summary || '',
    category: 'Events',
    tags: raw.tags ? raw.tags.split('|') : ['Events'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    type: raw.type,
    event_status: raw.event_status,
    start_date: raw.start_date ? new Date(raw.start_date) : new Date(),
    end_date: raw.end_date ? new Date(raw.end_date) : new Date(),
    image: raw.image,
    rewards: raw.rewards_en ? raw.rewards_en.split('|') : [],
    how_to_participate: raw.how_to_participate_en ? raw.how_to_participate_en.split('|') : [],
    tips: raw.tips_en ? raw.tips_en.split('|') : [],
    // LocalizedString fields
    name: createLocalizedStringFromCSV(raw, 'name'),
    description: raw.description_en ? createLocalizedStringFromCSV(raw, 'description') : undefined,
  };
}

/**
 * Transform raw item data to include LocalizedString fields
 */
export function transformItem(raw: any): Item {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.name_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.description_en || raw.summary || '',
    category: 'Items',
    tags: raw.tags ? raw.tags.split('|') : ['Items'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    type: raw.type,
    rarity: raw.rarity,
    image: raw.image,
    // LocalizedString fields
    name: createLocalizedStringFromCSV(raw, 'name'),
    description: raw.description_en ? createLocalizedStringFromCSV(raw, 'description') : undefined,
  };
}

/**
 * Transform raw guide data to include LocalizedString fields
 */
export function transformGuide(raw: any): Guide {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.title_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.summary_en || raw.summary || '',
    category: raw.category_id || 'beginner',
    tags: raw.tags ? raw.tags.split('|') : (raw.topics ? raw.topics.split('|') : ['Guide']),
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    content_ref: raw.content_ref,
    difficulty: raw.difficulty,
    read_time: raw.read_time,
    image: raw.image,
    topics: raw.topics ? raw.topics.split('|') : [],
    // LocalizedString fields
    localizedTitle: createLocalizedStringFromCSV(raw, 'title'),
    localizedSummary: createLocalizedStringFromCSV(raw, 'summary'),
    content: createLocalizedString(raw.content_ref || ''),
  };
}

/**
 * Transform raw gacha data from CSV to Gacha type
 */
export function transformGacha(raw: any): Gacha {
  return {
    id: parseInt(raw.id) || 0,
    unique_key: raw.unique_key || raw.slug,
    image: raw.image,
    name: createLocalizedStringFromCSV(raw, 'name'),
    start_date: raw.start_date ? new Date(raw.start_date) : new Date(),
    end_date: raw.end_date ? new Date(raw.end_date) : new Date(),
    gacha_status: raw.gacha_status === 'Active' ? 'Active' : 
            raw.gacha_status === 'Coming Soon' ? 'Coming Soon' : 'Ended',
    rates: {
      ssr: parseFloat(raw.rates_ssr) || 3,
      sr: parseFloat(raw.rates_sr) || 17,
      r: parseFloat(raw.rates_r) || 80,
    },
    pity_at: parseInt(raw.pity_at) || 100,
    step_up: raw.step_up === 'true' || raw.step_up === true,
    featured_swimsuits: raw.featured_swimsuits ? raw.featured_swimsuits.split('|') : [],
    featured_characters: raw.featured_characters ? raw.featured_characters.split('|') : [],
  };
}

/**
 * Transform raw episode data to include LocalizedString fields
 */
export function transformEpisode(raw: any): Episode {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.name_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.description_en || raw.summary || '',
    category: 'Episodes',
    tags: raw.tags ? raw.tags.split('|') : ['Episodes'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    type: raw.type,
    episode_status: raw.episode_status,
    release_version: raw.release_version,
    release_date: raw.release_date ? new Date(raw.release_date) : undefined,
    image: raw.image,
    character_ids: raw.character_ids ? raw.character_ids.split('|') : [],
    // LocalizedString fields
    name: createLocalizedStringFromCSV(raw, 'name'),
    description: raw.description_en ? createLocalizedStringFromCSV(raw, 'description') : undefined,
  };
}

/**
 * Transform raw category data from CSV
 * Category uses simple string fields (not LocalizedString pattern)
 */
export function transformCategory(raw: any): Category {
  return {
    id: parseInt(raw.id) || 0,
    name: createLocalizedStringFromCSV(raw, 'name'),
    unique_key: raw.unique_key,
    description: createLocalizedStringFromCSV(raw, 'description'),
    parent_id: raw.parent_id || undefined,
    order: parseInt(raw.order) || 0,
  };
}

/**
 * Transform raw tag data from CSV
 * Tag uses simple string fields (not LocalizedString pattern)
 */
export function transformTag(raw: any): Tag {
  return {
    id: parseInt(raw.id) || 0,
    name: createLocalizedStringFromCSV(raw, 'name'),
    unique_key: raw.unique_key,
    description: raw.description ? createLocalizedStringFromCSV(raw, 'description') : undefined,
    usage_count: parseInt(raw.usage_count) || 0,
  };
}

/**
 * Transform raw tool data from CSV to Tool type
 */
export function transformTool(raw: any): Tool {
  return {
    id: parseInt(raw.id) || 0,
    title: raw.title_en || raw.title || '',
    unique_key: raw.unique_key,
    summary: raw.summary_en || raw.summary || '',
    category: raw.category_id || 'utilities',
    tags: raw.tags ? raw.tags.split('|') : ['Tools'],
    updated_at: raw.updated_at,
    author: raw.author,
    status: raw.status,
    related_ids: raw.related_ids ? raw.related_ids.split('|') : [],
    content_ref: raw.content_ref,
    image: raw.image,
    windows_path: raw.windows_path || undefined,
    version: raw.version || undefined,
    // LocalizedString fields
    localizedTitle: createLocalizedStringFromCSV(raw, 'title'),
    localizedSummary: createLocalizedStringFromCSV(raw, 'summary'),
  };
}


/**
 * Content type identifiers for the loader
 */
export type ContentType =
  | 'characters'
  | 'guides'
  | 'events'
  | 'swimsuits'
  | 'items'
  | 'episodes'
  | 'gachas'
  | 'categories'
  | 'tags'
  | 'festivals'
  | 'tools';

/**
 * Error thrown when content loading fails
 */
export class ContentLoadError extends Error {
  constructor(
    public contentType: string,
    public cause: Error | string[]
  ) {
    const message = Array.isArray(cause) 
      ? `Failed to load ${contentType}: ${cause.join(', ')}`
      : `Failed to load ${contentType}: ${cause.message}`;
    super(message);
    this.name = 'ContentLoadError';
  }
}

/**
 * ContentLoader - Singleton class for loading and caching CSV content
 * 
 * Features:
 * - Lazy loading: Content is only loaded when first requested
 * - Caching: Parsed content is cached to prevent redundant parsing
 * - Request deduplication: Concurrent requests for the same content share a single parse operation
 * - Direct PapaParse integration: Uses parseCSV for efficient CSV parsing
 * - O(1) Lookup Maps: Pre-built indexes for fast access by ID and unique_key
 */
export class ContentLoader {
  private static instance: ContentLoader;
  private cache: Map<string, any[]> = new Map();
  private pendingRequests: Map<string, Promise<any[]>> = new Map();
  
  // O(1) Lookup Maps for fast access
  private charactersByKey: Map<string, Character> = new Map();
  private charactersByIndex: Map<number, Character> = new Map();
  private swimsuitsByKey: Map<string, Swimsuit> = new Map();
  private swimsuitsByIndex: Map<number, Swimsuit> = new Map();
  private eventsByKey: Map<string, Event> = new Map();
  private eventsByIndex: Map<number, Event> = new Map();
  private guidesByKey: Map<string, Guide> = new Map();
  private guidesByIndex: Map<number, Guide> = new Map();
  private itemsByKey: Map<string, Item> = new Map();
  private itemsByIndex: Map<number, Item> = new Map();
  private episodesByKey: Map<string, Episode> = new Map();
  private episodesByIndex: Map<number, Episode> = new Map();
  private gachasByKey: Map<string, Gacha> = new Map();
  private gachasByIndex: Map<number, Gacha> = new Map();
  private festivalsByKey: Map<string, Festival> = new Map();
  private categoriesByKey: Map<string, Category> = new Map();
  private tagsByKey: Map<string, Tag> = new Map();
  private toolsByKey: Map<string, Tool> = new Map();
  private toolsByIndex: Map<number, Tool> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): ContentLoader {
    if (!ContentLoader.instance) {
      ContentLoader.instance = new ContentLoader();
    }
    return ContentLoader.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  static resetInstance(): void {
    ContentLoader.instance = undefined as any;
  }

  /**
   * Check if the cache is empty (useful for testing lazy loading)
   */
  isCacheEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Get the number of cached content types
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Unified content loading method with caching and deduplication
   * @param key - Cache key for the content type
   * @param csvContent - Raw CSV string to parse
   * @param transformer - Function to transform raw CSV rows to typed objects
   * @returns Promise resolving to array of transformed content
   */
  private async loadContent<T>(
    key: string,
    csvContent: string,
    transformer: (raw: any) => T
  ): Promise<T[]> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) as T[];
    }

    // Deduplicate concurrent requests
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T[]>;
    }

    // Create the loading promise
    const promise = this.parseAndTransform(key, csvContent, transformer);
    this.pendingRequests.set(key, promise);

    try {
      const data = await promise;
      this.cache.set(key, data);
      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Parse CSV content and transform to typed objects
   */
  private async parseAndTransform<T>(
    key: string,
    csvContent: string,
    transformer: (raw: any) => T
  ): Promise<T[]> {
    const { data, errors } = parseCSV(csvContent);

    // Only log errors in development and ignore common non-critical warnings
    if (errors.length > 0 && import.meta.env.DEV) {
      const criticalErrors = errors.filter(e => e.type === 'Quotes' || e.type === 'Delimiter');
      if (criticalErrors.length > 0) {
        console.warn(`CSV parse errors for ${key}:`, criticalErrors);
      }
    }

    if (data.length === 0) {
      throw new ContentLoadError(key, ['No data found in CSV']);
    }

    return data.map(transformer);
  }

  // ============================================================================
  // Public async loading methods (lazy loading)
  // ============================================================================

  /**
   * Initialize all content types at once
   * Useful for preloading all data at app startup
   */
  async initialize(): Promise<void> {
    await Promise.all([
      this.loadCharacters(),
      this.loadGuides(),
      this.loadEvents(),
      this.loadSwimsuits(),
      this.loadItems(),
      this.loadEpisodes(),
      this.loadGachas(),
      this.loadCategories(),
      this.loadTags(),
      this.loadTools(),
    ]);
  }

  async loadCharacters(): Promise<Character[]> {
    const characters = await this.loadContent('characters', charactersCSV, transformCharacter);
    
    // Build O(1) lookup maps
    this.charactersByKey.clear();
    this.charactersByIndex.clear();
    for (const char of characters) {
      this.charactersByKey.set(char.unique_key, char);
      this.charactersByIndex.set(char.id, char);
    }
    
    return characters;
  }

  async loadGuides(): Promise<Guide[]> {
    const guides = await this.loadContent('guides', guidesCSV, transformGuide);
    
    // Build O(1) lookup maps
    this.guidesByKey.clear();
    this.guidesByIndex.clear();
    for (const guide of guides) {
      this.guidesByKey.set(guide.unique_key, guide);
      this.guidesByIndex.set(guide.id, guide);
    }
    
    return guides;
  }

  async loadEvents(): Promise<Event[]> {
    const events = await this.loadContent('events', eventsCSV, transformEvent);
    
    // Build O(1) lookup maps
    this.eventsByKey.clear();
    this.eventsByIndex.clear();
    for (const event of events) {
      this.eventsByKey.set(event.unique_key, event);
      this.eventsByIndex.set(event.id, event);
    }
    
    // Also cache festivals (events with type 'Festival')
    if (!this.cache.has('festivals')) {
      const festivals = events.filter((e: Event) => e.type === 'Festival') as FestivalType[];
      this.cache.set('festivals', festivals);
      
      // Build festival lookup map
      this.festivalsByKey.clear();
      for (const festival of festivals) {
        this.festivalsByKey.set(festival.unique_key, festival);
      }
    }
    
    return events;
  }

  async loadSwimsuits(): Promise<Swimsuit[]> {
    const swimsuits = await this.loadContent('swimsuits', swimsuitsCSV, transformSwimsuit);
    
    // Build O(1) lookup maps
    this.swimsuitsByKey.clear();
    this.swimsuitsByIndex.clear();
    for (const suit of swimsuits) {
      this.swimsuitsByKey.set(suit.unique_key, suit);
      this.swimsuitsByIndex.set(suit.id, suit);
    }
    
    return swimsuits;
  }

  async loadItems(): Promise<Item[]> {
    const items = await this.loadContent('items', itemsCSV, transformItem);
    
    // Build O(1) lookup maps
    this.itemsByKey.clear();
    this.itemsByIndex.clear();
    for (const item of items) {
      this.itemsByKey.set(item.unique_key, item);
      this.itemsByIndex.set(item.id, item);
    }
    
    return items;
  }

  async loadEpisodes(): Promise<Episode[]> {
    const episodes = await this.loadContent('episodes', episodesCSV, transformEpisode);
    
    // Build O(1) lookup maps
    this.episodesByKey.clear();
    this.episodesByIndex.clear();
    for (const episode of episodes) {
      this.episodesByKey.set(episode.unique_key, episode);
      this.episodesByIndex.set(episode.id, episode);
    }
    
    return episodes;
  }

  async loadGachas(): Promise<Gacha[]> {
    const gachas = await this.loadContent('gachas', gachasCSV, transformGacha);
    
    // Build O(1) lookup maps
    this.gachasByKey.clear();
    this.gachasByIndex.clear();
    for (const gacha of gachas) {
      this.gachasByKey.set(gacha.unique_key, gacha);
      this.gachasByIndex.set(gacha.id, gacha);
    }
    
    return gachas;
  }

  async loadCategories(): Promise<Category[]> {
    const categories = await this.loadContent('categories', categoriesCSV, transformCategory);
    
    // Build O(1) lookup map
    this.categoriesByKey.clear();
    for (const category of categories) {
      this.categoriesByKey.set(category.unique_key, category);
    }
    
    return categories;
  }

  async loadTags(): Promise<Tag[]> {
    const tags = await this.loadContent('tags', tagsCSV, transformTag);
    
    // Build O(1) lookup map
    this.tagsByKey.clear();
    for (const tag of tags) {
      this.tagsByKey.set(tag.unique_key, tag);
    }
    
    return tags;
  }

  async loadFestivals(): Promise<Festival[]> {
    // Ensure events are loaded first (which caches festivals)
    await this.loadEvents();
    return this.cache.get('festivals') as Festival[];
  }

  async loadTools(): Promise<Tool[]> {
    const tools = await this.loadContent('tools', toolsCSV, transformTool);
    
    // Build O(1) lookup maps
    this.toolsByKey.clear();
    this.toolsByIndex.clear();
    for (const tool of tools) {
      this.toolsByKey.set(tool.unique_key, tool);
      this.toolsByIndex.set(tool.id, tool);
    }
    
    return tools;
  }


  // ============================================================================
  // Synchronous getters (return cached data or empty array)
  // ============================================================================

  getCategories(): Category[] {
    return this.cache.get('categories') || [];
  }

  getTags(): Tag[] {
    return this.cache.get('tags') || [];
  }

  getGuides(): Guide[] {
    return this.cache.get('guides') || [];
  }

  getCharacters(): Character[] {
    return this.cache.get('characters') || [];
  }

  getEvents(): Event[] {
    return this.cache.get('events') || [];
  }

  getSwimsuits(): Swimsuit[] {
    return this.cache.get('swimsuits') || [];
  }

  getItems(): Item[] {
    return this.cache.get('items') || [];
  }

  getEpisodes(): Episode[] {
    return this.cache.get('episodes') || [];
  }

  getFestivals(): Festival[] {
    return this.cache.get('festivals') || [];
  }

  getGachas(): Gacha[] {
    return this.cache.get('gachas') || [];
  }

  getTools(): Tool[] {
    return this.cache.get('tools') || [];
  }

  // ============================================================================
  // Find by ID methods - O(1) using lookup maps
  // ============================================================================

  getGuideById(id: number): Guide | undefined {
    return this.guidesByIndex.get(id);
  }

  getCharacterById(id: number): Character | undefined {
    return this.charactersByIndex.get(id);
  }

  getEventById(id: number): Event | undefined {
    return this.eventsByIndex.get(id);
  }

  getSwimsuitById(id: number): Swimsuit | undefined {
    return this.swimsuitsByIndex.get(id);
  }

  getItemById(id: number): Item | undefined {
    return this.itemsByIndex.get(id);
  }

  getEpisodeById(id: number): Episode | undefined {
    return this.episodesByIndex.get(id);
  }

  getCategoryById(id: number): Category | undefined {
    const categories = this.getCategories();
    return categories.find(c => c.id === id);
  }

  getTagById(id: number): Tag | undefined {
    const tags = this.getTags();
    return tags.find(t => t.id === id);
  }

  getGachaById(id: number): Gacha | undefined {
    return this.gachasByIndex.get(id);
  }

  getToolById(id: number): Tool | undefined {
    return this.toolsByIndex.get(id);
  }

  // ============================================================================
  // Find by unique_key methods - O(1) using lookup maps
  // ============================================================================

  getGuideByUniqueKey(uniqueKey: string): Guide | undefined {
    return this.guidesByKey.get(uniqueKey);
  }

  getCharacterByUniqueKey(uniqueKey: string): Character | undefined {
    return this.charactersByKey.get(uniqueKey);
  }

  getEventByUniqueKey(uniqueKey: string): Event | undefined {
    return this.eventsByKey.get(uniqueKey);
  }

  getSwimsuitByUniqueKey(uniqueKey: string): Swimsuit | undefined {
    return this.swimsuitsByKey.get(uniqueKey);
  }

  getItemByUniqueKey(uniqueKey: string): Item | undefined {
    return this.itemsByKey.get(uniqueKey);
  }

  getEpisodeByUniqueKey(uniqueKey: string): Episode | undefined {
    return this.episodesByKey.get(uniqueKey);
  }

  getFestivalByUniqueKey(uniqueKey: string): Festival | undefined {
    return this.festivalsByKey.get(uniqueKey);
  }

  getGachaByUniqueKey(uniqueKey: string): Gacha | undefined {
    return this.gachasByKey.get(uniqueKey);
  }

  getCategoryByUniqueKey(uniqueKey: string): Category | undefined {
    return this.categoriesByKey.get(uniqueKey);
  }

  getTagByUniqueKey(uniqueKey: string): Tag | undefined {
    return this.tagsByKey.get(uniqueKey);
  }

  getToolByUniqueKey(uniqueKey: string): Tool | undefined {
    return this.toolsByKey.get(uniqueKey);
  }

  // ============================================================================
  // Utility methods
  // ============================================================================

  /**
   * Get related content for an item
   */
  getRelatedContent<T extends BaseContent>(
    item: T,
    allContent: T[]
  ): T[] {
    if (!item.related_ids || item.related_ids.length === 0) return [];
    // Match related_ids (strings) against unique_key (string)
    return allContent.filter(c => item.related_ids!.includes(c.unique_key));
  }

  /**
   * Filter content by category
   */
  getContentByCategory<T extends BaseContent>(
    content: T[],
    categoryId: string
  ): T[] {
    return content.filter(c => c.category === categoryId);
  }

  /**
   * Filter content by tag
   */
  getContentByTag<T extends BaseContent>(
    content: T[],
    tagId: string
  ): T[] {
    return content.filter(c => c.tags.includes(tagId));
  }

  /**
   * Clear cache and all lookup maps to allow fresh loading
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    
    // Clear all lookup maps
    this.charactersByKey.clear();
    this.charactersByIndex.clear();
    this.swimsuitsByKey.clear();
    this.swimsuitsByIndex.clear();
    this.eventsByKey.clear();
    this.eventsByIndex.clear();
    this.guidesByKey.clear();
    this.guidesByIndex.clear();
    this.itemsByKey.clear();
    this.itemsByIndex.clear();
    this.episodesByKey.clear();
    this.episodesByIndex.clear();
    this.gachasByKey.clear();
    this.gachasByIndex.clear();
    this.festivalsByKey.clear();
    this.categoriesByKey.clear();
    this.tagsByKey.clear();
    this.toolsByKey.clear();
    this.toolsByIndex.clear();
  }

}

// Export singleton instance
export const contentLoader = ContentLoader.getInstance();
