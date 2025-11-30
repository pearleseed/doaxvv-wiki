import { useContext } from 'react';
import { LanguageContext, LanguageContextValue } from './language-context-types';

/**
 * Hook for consuming the language context.
 * Must be used within a LanguageProvider.
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
