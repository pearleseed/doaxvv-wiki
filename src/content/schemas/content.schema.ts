/**
 * Content Management Schema Definitions
 * Defines the structure and validation rules for all content types
 */

import { LocalizedString } from '@/shared/types/localization';

export interface BaseContent {
  id: number;
  title: string;
  unique_key: string;
  summary: string;
  category: string;
  tags: string[];
  updated_at: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  related_ids?: string[];
}

export interface Guide extends BaseContent {
  content_ref: string; // Path to markdown file or inline content
  read_time: string;
  image: string;
  topics: string[];
  pdf_attachment?: string; // Optional PDF file path to display alongside markdown
  // Localized fields
  localizedTitle: LocalizedString;
  localizedSummary: LocalizedString;
  content: LocalizedString;
}

export interface Character extends BaseContent {
  image: string;
  stats: { POW: number; TEC: number; STM: number; APL?: number };
  // Localized fieldsư
  name: LocalizedString;
  age?: LocalizedString;
  birthday: LocalizedString;
  height: LocalizedString;
  measurements?: LocalizedString;
  blood_type?: LocalizedString;
  job?: LocalizedString;
  hobby: LocalizedString;
  food?: LocalizedString;
  color?: LocalizedString;
  cast?: LocalizedString; // Cast for all languages
}

export interface SwimsuitSkill {
  id?: number;
  key?: string;
  name: LocalizedString;
  description: LocalizedString;
}


export interface Swimsuit extends BaseContent {
  rarity: 'SSR' | 'SR' | 'R';
  character: string;
  character_id: string;
  image: string;
  bromide_image?: string;       // Optional bromide image for detail page
  deco_bromide_image?: string;  // Optional deco-bromide variant image
  stats: { POW: number; TEC: number; STM: number; APL?: number };
  // Localized fields
  name: LocalizedString;
  skills: SwimsuitSkill[];
  // Numeric stat fields
  max_level?: number;
  base_pow?: number;
  max_pow?: number;
  base_tec?: number;
  max_tec?: number;
  base_stm?: number;
  max_stm?: number;
  base_apl?: number;
  max_apl?: number;
  pow_growth?: number;
  tec_growth?: number;
  stm_growth?: number;
  apl_growth?: number;
}

export interface Event extends BaseContent {
  type: 'Main' | 'Daily' | 'Event';
  event_status: 'Active' | 'Upcoming' | 'Ended';
  start_date: Date;
  end_date: Date;
  image: string;
  rewards: string[];
  how_to_participate: string[];
  tips: string[];
  // Related content links
  gacha_ids?: string[];              // Related gacha unique_keys
  episode_ids?: string[];            // Related episode unique_keys
  mission_ids?: string[];            // Related mission unique_keys
  // Localized fields
  name: LocalizedString;
  description?: LocalizedString;
}

export interface Festival extends Event {
  // Festival extends Event with the same structure
  // Additional festival-specific fields can be added here
}

export interface Gacha {
  id: number;
  unique_key: string;
  image: string;
  name: LocalizedString;
  start_date: Date;
  end_date: Date;
  gacha_status: 'Active' | 'Coming Soon' | 'Ended';
  // Pull rates
  rates: {
    ssr: number;
    sr: number;
    r: number;
  };
  // Pity system
  pity_at: number;
  step_up: boolean;
  // Featured items
  featured_swimsuits: string[];
  featured_characters: string[];
}

export interface Item extends BaseContent {
  type: 'Decoration' | 'Consumable' | 'Material';
  image: string;
  quantity?: number;
  // Localized fields
  name: LocalizedString;
  description?: LocalizedString;
}

export interface Category {
  id: number;
  name: LocalizedString;
  unique_key: string;
  description: LocalizedString;
  parent_id?: string;
  order: number;
}

export interface Tag {
  id: number;
  name: LocalizedString;
  unique_key: string;
  description?: LocalizedString;
  usage_count: number;
}

export interface Episode extends BaseContent {
  type: 'Character' | 'Gravure' | 'Event' | 'Extra' | 'Bromide';
  episode_status: 'Available' | 'Coming Soon' | 'Limited';
  release_version?: string;
  release_date?: Date;
  image: string;
  character_ids?: string[];
  // Localized fields
  name: LocalizedString;
  description?: LocalizedString;
}

export interface Tool extends BaseContent {
  content_ref: string; // Path to markdown file with usage instructions
  image: string; // Tool image/icon
  windows_path?: string; // Windows file path (optional)
  version?: string; // Tool version
  // Localized fields
  localizedTitle: LocalizedString;
  localizedSummary: LocalizedString;
}

export interface Accessory extends BaseContent {
  rarity: 'SSR' | 'SR' | 'R';
  character_ids: string[];           // Characters who can equip this
  image: string;
  stats?: {
    POW?: number;
    TEC?: number;
    STM?: number;
    APL?: number;
  };
  obtain_method: 'Event' | 'Gacha' | 'Shop' | 'Quest' | 'Login';
  obtain_source?: string;            // Specific event/gacha unique_key
  // Localized fields
  name: LocalizedString;
  description?: LocalizedString;
  effect?: LocalizedString;          // Accessory effect description
}

export interface Mission extends BaseContent {
  type: 'Daily' | 'Weekly' | 'Event' | 'Owner';
  event_id?: string;                 // Related event unique_key
  image?: string;
  objectives: string[];              // List of objectives
  rewards: string[];                 // List of rewards
  requirements?: string[];           // Prerequisites
  // Localized fields
  name: LocalizedString;
  description?: LocalizedString;
}

/**
 * Quiz difficulty levels
 */
export type QuizDifficulty = 'Easy' | 'Medium' | 'Hard';

/**
 * Quiz publication status
 */
export type QuizStatus = 'draft' | 'published' | 'archived';

/**
 * Quiz metadata from CSV
 */
export interface Quiz {
  id: number;
  unique_key: string;
  name: LocalizedString;
  description: LocalizedString;
  image: string;
  category: string;
  difficulty: QuizDifficulty;
  time_limit: number; // seconds, 0 for no limit
  question_count: number;
  questions_ref: string; // path to markdown file
  status: QuizStatus;
  updated_at: string;
  author: string;
  tags: string[];
}

// Validation rules - CSV field names (using _en/_jp suffix for localized fields)
export const REQUIRED_FIELDS: Record<string, string[]> = {
  // Base fields không áp dụng cho tất cả - mỗi type có required fields riêng
  base: ['id', 'unique_key', 'updated_at', 'author', 'status'],
  // Character: chỉ cần các trường cơ bản, localized fields check riêng
  character: ['image', 'stats'],
  // Swimsuit
  swimsuit: ['rarity', 'character_id', 'image', 'stats'],
  // Event
  event: ['type', 'event_status', 'start_date', 'end_date', 'image'],
  // Gacha - không dùng base fields
  gacha: ['id', 'unique_key', 'image', 'start_date', 'end_date', 'gacha_status', 'pity_at'],
  // Episode
  episode: ['type', 'episode_status', 'image'],
  // Item
  item: ['type', 'image'],
  // Guide
  guide: ['content_ref', 'read_time', 'image'],
  // Tool
  tool: ['content_ref', 'image'],
  // Accessory
  accessory: ['rarity', 'image', 'obtain_method'],
  // Mission
  mission: ['type', 'objectives', 'rewards'],
  // Quiz - không dùng base fields
  quiz: ['id', 'unique_key', 'difficulty', 'questions_ref'],
  // Category - không dùng base fields
  category: ['id', 'unique_key', 'order'],
  // Tag - không dùng base fields
  tag: ['id', 'unique_key', 'usage_count']
};

export const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
export const VALID_RARITIES = ['SSR', 'SR', 'R'] as const;
export const VALID_ITEM_TYPES = ['Decoration', 'Consumable', 'Material'] as const;
export const VALID_EVENT_TYPES = ['Main', 'Daily', 'Event'] as const;
export const VALID_EVENT_STATUSES = ['Active', 'Upcoming', 'Ended'] as const;
export const VALID_GACHA_STATUSES = ['Active', 'Coming Soon', 'Ended'] as const;
export const VALID_EPISODE_TYPES = ['Character', 'Gravure', 'Event', 'Extra', 'Bromide'] as const;
export const VALID_EPISODE_STATUSES = ['Available', 'Coming Soon', 'Limited'] as const;
export const VALID_ACCESSORY_RARITIES = ['SSR', 'SR', 'R'] as const;
export const VALID_OBTAIN_METHODS = ['Event', 'Gacha', 'Shop', 'Quest', 'Login'] as const;
export const VALID_MISSION_TYPES = ['Daily', 'Weekly', 'Event', 'Owner'] as const;
export const VALID_QUIZ_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const VALID_QUIZ_STATUSES = ['draft', 'published', 'archived'] as const;
