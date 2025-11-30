/**
 * Localization types for multi-language content support
 */

/**
 * Supported language codes for the application
 */
export type LanguageCode = 'en' | 'jp' | 'cn' | 'tw' | 'kr';

/**
 * Array of all supported language codes
 * Order: Japanese, English, Simplified Chinese, Traditional Chinese, Korean
 */
export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['jp', 'en', 'cn', 'tw', 'kr'] as const;

/**
 * Language metadata for display purposes
 */
export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  jp: '日本語',
  cn: '简体中文',
  tw: '繁體中文',
  kr: '한국어',
};

/**
 * Interface for storing multi-language string values.
 * English (en) and Japanese (jp) are required, others are optional.
 */
export interface LocalizedString {
  en: string;
  jp: string;
  cn?: string;
  tw?: string;
  kr?: string;
}
