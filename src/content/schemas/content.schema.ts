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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  read_time: string;
  image: string;
  topics: string[];
  // Localized fields
  localizedTitle: LocalizedString;
  localizedSummary: LocalizedString;
  content: LocalizedString;
}

export interface Character extends BaseContent {
  type: 'SSR' | 'SR' | 'R';
  image: string;
  stats: { POW: number; TEC: number; STM: number; APL?: number };
  // Localized fields
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
  cast?: Partial<Pick<LocalizedString, 'en' | 'jp'>>; // Only en and jp for cast
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
  type: 'Festival' | 'Gacha' | 'Tournament' | 'Contest';
  event_status: 'Active' | 'Upcoming' | 'Ended';
  start_date: Date;
  end_date: Date;
  image: string;
  rewards: string[];
  how_to_participate: string[];
  tips: string[];
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
  type: 'Accessory' | 'Decoration' | 'Consumable' | 'Material';
  rarity: 'SSR' | 'SR' | 'R' | 'N';
  image: string;
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

// Validation rules
export const REQUIRED_FIELDS: Record<string, string[]> = {
  base: ['id', 'title', 'unique_key', 'summary', 'category', 'tags', 'updated_at', 'author', 'status'],
  guide: ['content_ref', 'difficulty', 'read_time', 'image', 'topics', 'localizedTitle', 'content'],
  character: ['type', 'image', 'stats', 'name', 'birthday', 'height', 'hobby'],
  event: ['type', 'event_status', 'start_date', 'end_date', 'image', 'rewards', 'name'],
  swimsuit: ['rarity', 'character_id', 'image', 'stats', 'name', 'skills'],
  item: ['type', 'rarity', 'image', 'name'],
  gacha: ['unique_key', 'image', 'start_date', 'end_date', 'gacha_status', 'rates', 'pity_at'],
  episode: ['type', 'episode_status', 'image', 'name'],
  category: ['id', 'name', 'unique_key', 'description', 'order'],
  tag: ['id', 'name', 'unique_key', 'usage_count'],
  tool: ['content_ref', 'image', 'localizedTitle', 'localizedSummary']
};

export const VALID_STATUSES = ['draft', 'published', 'archived'] as const;
export const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;
export const VALID_RARITIES = ['SSR', 'SR', 'R'] as const;
export const VALID_ITEM_RARITIES = ['SSR', 'SR', 'R', 'N'] as const;
export const VALID_ITEM_TYPES = ['Accessory', 'Decoration', 'Consumable', 'Material'] as const;
export const VALID_EVENT_TYPES = ['Festival', 'Gacha', 'Tournament', 'Contest'] as const;
export const VALID_EVENT_STATUSES = ['Active', 'Upcoming', 'Ended'] as const;
export const VALID_GACHA_STATUSES = ['Active', 'Coming Soon', 'Ended'] as const;
export const VALID_EPISODE_TYPES = ['Character', 'Gravure', 'Event', 'Extra', 'Bromide'] as const;
export const VALID_EPISODE_STATUSES = ['Available', 'Coming Soon', 'Limited'] as const;
