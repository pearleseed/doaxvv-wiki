import React, { useState, useEffect, ReactNode } from 'react';
import { LanguageCode, LANGUAGE_LABELS } from '@/shared/types/localization';
import { isValidLanguageCode } from '@/shared/utils/localization';
import { LanguageContext } from './language-context-types';

const STORAGE_KEY = 'doaxvv-wiki-language';

/**
 * Maps application language codes to HTML lang attribute values.
 * Used to set document.documentElement.lang for accessibility.
 */
export const LANG_ATTRIBUTE_MAP: Record<LanguageCode, string> = {
  en: 'en',
  jp: 'ja',
  cn: 'zh-CN',
  tw: 'zh-TW',
  kr: 'ko',
};

interface LanguageProviderProps {
  children: ReactNode;
}

/**
 * Provider component for language context.
 * Manages current language state and persists selection to localStorage.
 */
export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  // Restore language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidLanguageCode(stored)) {
      setCurrentLanguage(stored);
    }
  }, []);

  // Sync HTML lang attribute when language changes
  useEffect(() => {
    document.documentElement.lang = LANG_ATTRIBUTE_MAP[currentLanguage];
  }, [currentLanguage]);

  // Update state and persist to localStorage
  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // Available languages for the switcher
  const availableLanguages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: LANGUAGE_LABELS.en },
    { code: 'jp', label: LANGUAGE_LABELS.jp },
    { code: 'cn', label: LANGUAGE_LABELS.cn },
    { code: 'tw', label: LANGUAGE_LABELS.tw },
    { code: 'kr', label: LANGUAGE_LABELS.kr },
  ];

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, availableLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}


