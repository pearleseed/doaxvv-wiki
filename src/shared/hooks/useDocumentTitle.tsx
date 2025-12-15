/**
 * useDocumentTitle Hook
 * Manages dynamic document title updates
 * 
 * Features:
 * - Updates document.title on mount and when title changes
 * - Follows format "[Page Title] | [Suffix]"
 * - Default suffix is "DOAXVV Wiki"
 * - Restores original title on unmount (optional)
 * - Also exports DocumentTitleElement for React 19 native approach
 */

import { useEffect, useRef, type ReactElement } from 'react';

const DEFAULT_SUFFIX = 'DOAXVV Wiki';
const DEFAULT_TITLE = 'Venus Vacation Wiki - DOAXVV Guide';

/**
 * Formats the document title according to the standard format
 */
function formatTitle(title: string, suffix: string): string {
  if (!title || title.trim() === '') {
    return DEFAULT_TITLE;
  }
  return `${title.trim()} | ${suffix}`;
}

/**
 * Hook for managing dynamic document titles
 * 
 * @param title - The page-specific title to display
 * @param suffix - Optional suffix to append (default: "DOAXVV Wiki")
 * @param restoreOnUnmount - Whether to restore the original title on unmount (default: false)
 * 
 * @example
 * ```tsx
 * // Basic usage - sets title to "Characters | DOAXVV Wiki"
 * useDocumentTitle('Characters');
 * 
 * // With custom suffix - sets title to "Marie Rose | My Wiki"
 * useDocumentTitle('Marie Rose', 'My Wiki');
 * 
 * // Restore original title when component unmounts
 * useDocumentTitle('Events', undefined, true);
 * ```
 */
export function useDocumentTitle(
  title: string,
  suffix: string = DEFAULT_SUFFIX,
  restoreOnUnmount: boolean = false
): void {
  const originalTitleRef = useRef<string | null>(null);

  useEffect(() => {
    // Store original title on first mount if we need to restore it
    if (restoreOnUnmount && originalTitleRef.current === null) {
      originalTitleRef.current = document.title;
    }

    // Update document title immediately (Requirement 5.3)
    document.title = formatTitle(title, suffix);

    // Cleanup: restore original title on unmount if requested
    return () => {
      if (restoreOnUnmount && originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
      }
    };
  }, [title, suffix, restoreOnUnmount]);
}

/**
 * React 19 native document title element
 * Returns a <title> element that React 19 automatically hoists to <head>
 * 
 * @param title - The page-specific title to display
 * @param suffix - Optional suffix to append (default: "DOAXVV Wiki")
 * @returns A React element to be rendered in the component tree
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   return (
 *     <>
 *       {DocumentTitleElement('Characters')}
 *       <div>Page content...</div>
 *     </>
 *   );
 * }
 * ```
 */
export function DocumentTitleElement(
  title: string,
  suffix: string = DEFAULT_SUFFIX
): ReactElement {
  const formattedTitle = formatTitle(title, suffix);
  // React 19 native <title> element - automatically hoisted to <head>
  return <title>{formattedTitle}</title>;
}

export default useDocumentTitle;
