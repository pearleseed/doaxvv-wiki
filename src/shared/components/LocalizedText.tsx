import { LocalizedString } from '@/shared/types/localization';
import { getLocalizedValue } from '@/shared/utils/localization';
import { useLanguage } from '@/shared/contexts/language-hooks';
import { TranslationIndicator } from '@/shared/components/TranslationIndicator';
import { cn } from '@/lib/utils';

interface LocalizedTextProps {
  localized: LocalizedString;
  showIndicator?: boolean;
  className?: string;
}

/**
 * Displays localized text based on the current language context.
 * Optionally shows a TranslationIndicator for viewing all translations.
 */
export function LocalizedText({
  localized,
  showIndicator = false,
  className,
}: LocalizedTextProps) {
  const { currentLanguage } = useLanguage();
  const text = getLocalizedValue(localized, currentLanguage);

  if (showIndicator) {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span>{text}</span>
        <TranslationIndicator localized={localized} />
      </span>
    );
  }

  return <span className={className}>{text}</span>;
}
