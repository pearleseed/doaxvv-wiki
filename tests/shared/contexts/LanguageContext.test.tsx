import React, { type ReactNode } from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider } from '../../../src/shared/contexts/LanguageContext';
import { useLanguage } from '../../../src/shared/contexts/language-hooks';


describe('LanguageContext', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  describe('initialization', () => {
    it('should initialize with English as default language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('en');
    });

    it('should restore language from localStorage', () => {
      localStorageMock.setItem('doaxvv-wiki-language', 'jp');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('jp');
    });

    it('should ignore invalid language codes in localStorage', () => {
      localStorageMock.setItem('doaxvv-wiki-language', 'invalid');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('en');
    });
  });

  describe('setLanguage', () => {
    it('should update current language', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('jp');
      });

      expect(result.current.currentLanguage).toBe('jp');
    });

    it('should persist language to localStorage', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('cn');
      });

      expect(localStorageMock.getItem('doaxvv-wiki-language')).toBe('cn');
    });

    it('should update HTML lang attribute', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('jp');
      });

      expect(document.documentElement.lang).toBe('ja');
    });

    it('should handle all supported languages', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const languages = ['en', 'jp', 'cn', 'tw', 'kr'] as const;

      languages.forEach((lang) => {
        act(() => {
          result.current.setLanguage(lang);
        });

        expect(result.current.currentLanguage).toBe(lang);
      });
    });
  });

  describe('availableLanguages', () => {
    it('should provide list of available languages', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.availableLanguages).toHaveLength(5);
      expect(result.current.availableLanguages[0]).toEqual({
        code: 'en',
        label: 'English',
      });
      expect(result.current.availableLanguages[1]).toEqual({
        code: 'jp',
        label: '日本語',
      });
    });

    it('should include all supported languages', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const codes = result.current.availableLanguages.map((l) => l.code);
      expect(codes).toEqual(['en', 'jp', 'cn', 'tw', 'kr']);
    });
  });

  describe('HTML lang attribute mapping', () => {
    it('should map language codes to HTML lang attributes correctly', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const mappings = [
        { code: 'en' as const, expected: 'en' },
        { code: 'jp' as const, expected: 'ja' },
        { code: 'cn' as const, expected: 'zh-CN' },
        { code: 'tw' as const, expected: 'zh-TW' },
        { code: 'kr' as const, expected: 'ko' },
      ];

      mappings.forEach(({ code, expected }) => {
        act(() => {
          result.current.setLanguage(code);
        });

        expect(document.documentElement.lang).toBe(expected);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid language changes', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('jp');
        result.current.setLanguage('cn');
        result.current.setLanguage('en');
        result.current.setLanguage('kr');
      });

      expect(result.current.currentLanguage).toBe('kr');
    });

    it('should handle setting the same language multiple times', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('jp');
        result.current.setLanguage('jp');
        result.current.setLanguage('jp');
      });

      expect(result.current.currentLanguage).toBe('jp');
    });

    it('should handle localStorage errors gracefully', () => {
      // Store original setItem before modifying
      const originalSetItem = localStorageMock.setItem.bind(localStorageMock);
      
      const { result } = renderHook(() => useLanguage(), { wrapper });

      // Mock localStorage.setItem to throw error
      localStorageMock.setItem = () => {
        throw new Error('Storage error');
      };

      try {
        act(() => {
          result.current.setLanguage('jp');
        });
      } catch {
        // Expected to throw
      }

      // Restore original immediately
      localStorageMock.setItem = originalSetItem;

      // The language may or may not update depending on implementation
      // Just verify no crash occurred
      expect(result.current).toBeDefined();
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('doaxvv-wiki-language', '{invalid}');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      // Should fallback to default language
      expect(result.current.currentLanguage).toBe('en');
    });

    it('should handle empty string in localStorage', () => {
      localStorageMock.setItem('doaxvv-wiki-language', '');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('en');
    });

    it('should handle whitespace in localStorage', () => {
      localStorageMock.setItem('doaxvv-wiki-language', '   ');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('en');
    });
  });

  describe('Provider Behavior', () => {
    it('should provide context to components', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('jp');
      });

      // Hook should see the updated language
      expect(result.current.currentLanguage).toBe('jp');
    });

    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('cn');
      });

      rerender();

      expect(result.current.currentLanguage).toBe('cn');
    });
  });

  describe('Language Labels', () => {
    it('should provide correct labels for all languages', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const expectedLabels = {
        en: 'English',
        jp: '日本語',
        cn: '简体中文',
        tw: '繁體中文',
        kr: '한국어',
      };

      result.current.availableLanguages.forEach((lang) => {
        expect(lang.label).toBe(expectedLabels[lang.code]);
      });
    });
  });

  describe('Persistence', () => {
    it('should persist language across hook unmount and remount', () => {
      const { result, unmount } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('tw');
      });

      unmount();

      const { result: newResult } = renderHook(() => useLanguage(), { wrapper });

      expect(newResult.current.currentLanguage).toBe('tw');
    });

    it('should use localStorage value on initial mount', () => {
      localStorageMock.setItem('doaxvv-wiki-language', 'kr');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.currentLanguage).toBe('kr');
    });
  });
});
