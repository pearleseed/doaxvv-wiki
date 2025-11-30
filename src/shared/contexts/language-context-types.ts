import { createContext } from 'react';
import { LanguageCode } from '@/shared/types/localization';

export interface LanguageContextValue {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: { code: LanguageCode; label: string }[];
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
