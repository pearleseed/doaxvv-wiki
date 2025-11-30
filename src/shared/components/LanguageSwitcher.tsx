import { useState, useRef, useCallback } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { useLanguage } from '@/shared/contexts/language-hooks';
import { cn } from '@/lib/utils';
import type { LanguageCode } from '@/shared/types/localization';

interface LanguageSwitcherProps {
  className?: string;
}

// Match Radix NavigationMenu timing
const OPEN_DELAY = 200;  // delayDuration - time before opening on hover
const CLOSE_DELAY = 300; // skipDelayDuration - time before closing on leave

/**
 * Dropdown component for switching the display language.
 * Shows current language with a globe icon and available languages in dropdown.
 * Opens on hover for desktop, click for mobile.
 * 
 * Accessibility features:
 * - aria-label describing the button purpose
 * - aria-haspopup indicating dropdown behavior
 * - aria-hidden on decorative icons
 * - role="menuitemradio" for language options with aria-checked
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLabel = availableLanguages.find(
    (lang) => lang.code === currentLanguage
  )?.label ?? 'English';

  const handleMouseEnter = useCallback(() => {
    // Clear any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    // Add delay before opening (matches NavigationMenu behavior)
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, OPEN_DELAY);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Clear any pending open timeout
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    // Delay before closing (matches NavigationMenu behavior)
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, CLOSE_DELAY);
  }, []);

  const handleSelect = useCallback((code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  }, [setLanguage]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'gap-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              'hover:bg-primary/10 hover:text-primary transition-colors',
              'data-[state=open]:bg-primary/10 data-[state=open]:text-primary',
              className
            )}
            aria-label={`Select language, current: ${currentLabel}`}
            aria-haspopup="menu"
            aria-expanded={isOpen}
          >
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{currentLabel}</span>
            <ChevronDown
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          aria-label="Language options"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="min-w-[140px]"
        >
          {availableLanguages.map(({ code, label }) => {
            const isSelected = currentLanguage === code;
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => handleSelect(code)}
                className={cn(
                  "flex items-center justify-between gap-2 cursor-pointer",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
                  isSelected && "bg-primary/10"
                )}
                role="menuitemradio"
                aria-checked={isSelected}
              >
                <span>{label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </div>
    </DropdownMenu>
  );
}
