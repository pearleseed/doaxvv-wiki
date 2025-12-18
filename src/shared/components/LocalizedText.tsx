import { LocalizedString } from '@/shared/types/localization';
import { getLocalizedValue } from '@/shared/utils/localization';
import { useLanguage } from '@/shared/contexts/language-hooks';
import { TranslationIndicator } from '@/shared/components/TranslationIndicator';
import { cn } from '@/lib/utils';

interface LocalizedTextProps {
  localized: LocalizedString | undefined | null;
  showIndicator?: boolean;
  className?: string;
  /** Fallback text when localized content is missing or empty */
  fallback?: string;
  /** Show muted styling when using fallback */
  showFallbackStyle?: boolean;
}

/**
 * Displays localized text based on the current language context.
 * Handles missing/undefined content gracefully with optional fallback.
 * Optionally shows a TranslationIndicator for viewing all translations.
 */
export function LocalizedText({
  localized,
  showIndicator = false,
  className,
  fallback = '—',
  showFallbackStyle = true,
}: LocalizedTextProps) {
  const { currentLanguage } = useLanguage();
  
  // Handle missing localized object
  if (!localized) {
    return (
      <span className={cn(
        showFallbackStyle && 'text-muted-foreground/60 italic',
        className
      )}>
        {fallback}
      </span>
    );
  }

  const text = getLocalizedValue(localized, currentLanguage);
  
  // Handle empty text after localization
  if (!text || text.trim() === '') {
    return (
      <span className={cn(
        showFallbackStyle && 'text-muted-foreground/60 italic',
        className
      )}>
        {fallback}
      </span>
    );
  }

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
