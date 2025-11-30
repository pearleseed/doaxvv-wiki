/**
 * useDocumentTitle Hook
 * Manages dynamic document title updates
 * 
 * Features:
 * - Updates document.title on mount and when title changes
 * - Follows format "[Page Title] | [Suffix]"
 * - Default suffix is "DOAXVV Wiki"
 * - Restores original title on unmount (optional)
 * 
 * Requirements: 9.1, 9.3, 9.5
 */

import { useEffect, useRef } from 'react';

const DEFAULT_SUFFIX = 'DOAXVV Wiki';
const DEFAULT_TITLE = 'Venus Vacation Wiki - DOAXVV Guide';

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

    // Determine the new title
    let newTitle: string;
    
    if (!title || title.trim() === '') {
      // Use default title when no specific title is provided (Requirement 9.5)
      newTitle = DEFAULT_TITLE;
    } else {
      // Format: "[Page Title] | [Suffix]" (Requirement 9.3)
      newTitle = `${title.trim()} | ${suffix}`;
    }

    // Update document title immediately (Requirement 9.4)
    document.title = newTitle;

    // Cleanup: restore original title on unmount if requested
    return () => {
      if (restoreOnUnmount && originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
      }
    };
  }, [title, suffix, restoreOnUnmount]);
}

export default useDocumentTitle;
