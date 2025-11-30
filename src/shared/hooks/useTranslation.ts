import { useLanguage } from "@/shared/contexts/language-hooks";
import { translations } from "@/shared/assets/translations";

export function useTranslation() {
  const { currentLanguage } = useLanguage();

  const t = (key: string): string => {
    const langTranslations = translations[currentLanguage] || translations['en'];
    return langTranslations[key] || key;
  };

  return { t, currentLanguage };
}
