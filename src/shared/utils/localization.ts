import {
  LocalizedString,
  LanguageCode,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
} from '@/shared/types/localization';

/**
 * Gets the localized value for the specified language.
 * Falls back to English if the requested language is not available.
 *
 * @param localized - The LocalizedString object containing translations
 * @param language - The desired language code
 * @returns The translated string, or English fallback if not available
 */
export function getLocalizedValue(
  localized: LocalizedString,
  language: LanguageCode
): string {
  const value = localized[language];
  
  // Return the value if it exists and is non-empty
  if (value !== undefined && value !== '') {
    return value;
  }
  
  // Fallback to English
  return localized.en;
}

/**
 * Gets all available translations for tooltip display.
 * Returns an array of objects with language code, label, and translated value.
 *
 * @param localized - The LocalizedString object containing translations
 * @returns Array of translation objects with code, label, and value
 */
export function getAllTranslations(
  localized: LocalizedString
): { code: LanguageCode; label: string; value: string }[] {
  return SUPPORTED_LANGUAGES.map((code) => ({
    code,
    label: LANGUAGE_LABELS[code],
    value: localized[code] ?? localized.en,
  }));
}

/**
 * Validates if a string is a valid language code.
 *
 * @param code - The string to validate
 * @returns True if the code is a valid LanguageCode, false otherwise
 */
export function isValidLanguageCode(code: string): code is LanguageCode {
  return SUPPORTED_LANGUAGES.includes(code as LanguageCode);
}
