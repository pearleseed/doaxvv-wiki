import { describe, it, expect } from 'vitest';
import {
  getLocalizedValue,
  getAllTranslations,
  isValidLanguageCode,
} from '../../../src/shared/utils/localization';
import type { LocalizedString } from '../../../src/shared/types/localization';

describe('localization utils', () => {
  describe('getLocalizedValue', () => {
    it('should return the requested language value', () => {
      const localized: LocalizedString = {
        en: 'Hello',
        jp: 'こんにちは',
        cn: '你好',
        tw: '你好',
        kr: '안녕하세요',
      };

      expect(getLocalizedValue(localized, 'en')).toBe('Hello');
      expect(getLocalizedValue(localized, 'jp')).toBe('こんにちは');
      expect(getLocalizedValue(localized, 'cn')).toBe('你好');
    });

    it('should fallback to English if requested language is empty', () => {
      const localized: LocalizedString = {
        en: 'Hello',
        jp: '',
        cn: '你好',
        tw: '你好',
        kr: '안녕하세요',
      };

      expect(getLocalizedValue(localized, 'jp')).toBe('Hello');
    });

    it('should fallback to English if requested language is undefined', () => {
      const localized: LocalizedString = {
        en: 'Hello',
        jp: 'こんにちは',
        cn: '你好',
        tw: '你好',
        kr: '안녕하세요',
      };

      // @ts-expect-error Testing undefined case
      delete localized.jp;

      expect(getLocalizedValue(localized, 'jp')).toBe('Hello');
    });

    it('should handle all supported languages', () => {
      const localized: LocalizedString = {
        en: 'English',
        jp: 'Japanese',
        cn: 'Chinese',
        tw: 'Traditional Chinese',
        kr: 'Korean',
      };

      expect(getLocalizedValue(localized, 'en')).toBe('English');
      expect(getLocalizedValue(localized, 'jp')).toBe('Japanese');
      expect(getLocalizedValue(localized, 'cn')).toBe('Chinese');
      expect(getLocalizedValue(localized, 'tw')).toBe('Traditional Chinese');
      expect(getLocalizedValue(localized, 'kr')).toBe('Korean');
    });
  });

  describe('getAllTranslations', () => {
    it('should return all translations with labels', () => {
      const localized: LocalizedString = {
        en: 'Hello',
        jp: 'こんにちは',
        cn: '你好',
        tw: '你好',
        kr: '안녕하세요',
      };

      const translations = getAllTranslations(localized);

      expect(translations).toHaveLength(5);
      // SUPPORTED_LANGUAGES order is ['jp', 'en', 'cn', 'tw', 'kr']
      expect(translations[0]).toEqual({
        code: 'jp',
        label: '日本語',
        value: 'こんにちは',
      });
      expect(translations[1]).toEqual({
        code: 'en',
        label: 'English',
        value: 'Hello',
      });
    });

    it('should use empty string for missing translations', () => {
      const localized: LocalizedString = {
        en: 'Hello',
        jp: 'こんにちは',
        cn: '',
        tw: '',
        kr: '',
      };

      const translations = getAllTranslations(localized);
      const cnTranslation = translations.find((t) => t.code === 'cn');

      // getAllTranslations returns empty string if not available, not fallback
      expect(cnTranslation?.value).toBe('');
    });
  });

  describe('isValidLanguageCode', () => {
    it('should return true for valid language codes', () => {
      expect(isValidLanguageCode('en')).toBe(true);
      expect(isValidLanguageCode('jp')).toBe(true);
      expect(isValidLanguageCode('cn')).toBe(true);
      expect(isValidLanguageCode('tw')).toBe(true);
      expect(isValidLanguageCode('kr')).toBe(true);
    });

    it('should return false for invalid language codes', () => {
      expect(isValidLanguageCode('fr')).toBe(false);
      expect(isValidLanguageCode('de')).toBe(false);
      expect(isValidLanguageCode('es')).toBe(false);
      expect(isValidLanguageCode('')).toBe(false);
      expect(isValidLanguageCode('invalid')).toBe(false);
    });

    it('should be case-sensitive', () => {
      expect(isValidLanguageCode('EN')).toBe(false);
      expect(isValidLanguageCode('JP')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle partial localized strings', () => {
      const partial: LocalizedString = {
        en: 'English',
        jp: '',
        cn: '',
        tw: '',
        kr: '',
      };

      expect(getLocalizedValue(partial, 'en')).toBe('English');
      expect(getLocalizedValue(partial, 'jp')).toBe('English');
    });

    it('should handle all empty localized strings', () => {
      const empty: LocalizedString = {
        en: '',
        jp: '',
        cn: '',
        tw: '',
        kr: '',
      };

      expect(getLocalizedValue(empty, 'en')).toBe('');
      expect(getLocalizedValue(empty, 'jp')).toBe('');
    });

    it('should handle special characters in translations', () => {
      const special: LocalizedString = {
        en: 'Hello & Welcome!',
        jp: 'こんにちは！',
        cn: '你好！',
        tw: '你好！',
        kr: '안녕하세요!',
      };

      expect(getLocalizedValue(special, 'en')).toBe('Hello & Welcome!');
      expect(getLocalizedValue(special, 'jp')).toBe('こんにちは！');
    });

    it('should handle very long translations', () => {
      const longText = 'a'.repeat(10000);
      const long: LocalizedString = {
        en: longText,
        jp: longText,
        cn: longText,
        tw: longText,
        kr: longText,
      };

      expect(getLocalizedValue(long, 'en')).toBe(longText);
      expect(getLocalizedValue(long, 'en').length).toBe(10000);
    });

    it('should handle whitespace-only translations', () => {
      const whitespace: LocalizedString = {
        en: '   ',
        jp: '   ',
        cn: '   ',
        tw: '   ',
        kr: '   ',
      };

      expect(getLocalizedValue(whitespace, 'en')).toBe('   ');
    });

    it('should handle mixed empty and filled translations', () => {
      const mixed: LocalizedString = {
        en: 'English',
        jp: '',
        cn: 'Chinese',
        tw: '',
        kr: 'Korean',
      };

      expect(getLocalizedValue(mixed, 'en')).toBe('English');
      expect(getLocalizedValue(mixed, 'jp')).toBe('English');
      expect(getLocalizedValue(mixed, 'cn')).toBe('Chinese');
      expect(getLocalizedValue(mixed, 'tw')).toBe('English');
      expect(getLocalizedValue(mixed, 'kr')).toBe('Korean');
    });

    it('should preserve line breaks in translations', () => {
      const multiline: LocalizedString = {
        en: 'Line 1\nLine 2\nLine 3',
        jp: '行1\n行2\n行3',
        cn: '行1\n行2\n行3',
        tw: '行1\n行2\n行3',
        kr: '행1\n행2\n행3',
      };

      expect(getLocalizedValue(multiline, 'en')).toContain('\n');
      expect(getLocalizedValue(multiline, 'jp')).toContain('\n');
    });
  });
});
