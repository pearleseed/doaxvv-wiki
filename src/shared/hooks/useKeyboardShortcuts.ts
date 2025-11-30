/**
 * useKeyboardShortcuts Hook
 * Handles keyboard shortcuts with cross-platform support (macOS/Windows)
 * 
 * Features:
 * - Supports both metaKey (macOS) and ctrlKey (Windows/Linux)
 * - Ignores shortcuts when typing in input fields (except Escape)
 * - Configurable per-shortcut behavior
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  /** The key to listen for (e.g., 'k', 'Escape', 'Enter') */
  key: string;
  /** Whether Ctrl key must be pressed (Windows/Linux) */
  ctrlKey?: boolean;
  /** Whether Meta/Cmd key must be pressed (macOS) */
  metaKey?: boolean;
  /** Whether Shift key must be pressed */
  shiftKey?: boolean;
  /** The action to execute when shortcut is triggered */
  action: () => void;
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Whether to ignore this shortcut when in input fields (default: true, except Escape) */
  ignoreInputs?: boolean;
}

/**
 * Check if the currently focused element is an input-like element
 */
function isInputElement(element: Element | null): boolean {
  if (!element) return false;
  
  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  const isContentEditable = element.getAttribute('contenteditable') === 'true';
  
  return isInput || isContentEditable;
}

/**
 * Hook for handling keyboard shortcuts
 * 
 * @param shortcuts - Array of keyboard shortcut definitions
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     metaKey: true,
 *     ctrlKey: true,
 *     action: () => searchInputRef.current?.focus(),
 *   },
 *   {
 *     key: 'Escape',
 *     action: () => setIsOpen(false),
 *   },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInInput = isInputElement(activeElement);

    for (const shortcut of shortcuts) {
      const {
        key,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        action,
        preventDefault = true,
        ignoreInputs,
      } = shortcut;

      // Check if the key matches (case-insensitive for letter keys)
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();
      if (!keyMatches) continue;

      // Check modifier keys
      // For cross-platform support: if both metaKey and ctrlKey are specified,
      // accept either one (Cmd on macOS, Ctrl on Windows/Linux)
      const needsModifier = ctrlKey || metaKey;
      const hasModifier = event.metaKey || event.ctrlKey;
      
      if (needsModifier && !hasModifier) continue;
      if (!needsModifier && hasModifier) continue;
      
      // Check shift key
      if (shiftKey !== event.shiftKey) continue;

      // Determine if we should ignore inputs for this shortcut
      // Escape key always works, even in inputs (unless explicitly set to true)
      const isEscapeKey = key.toLowerCase() === 'escape';
      const shouldIgnoreInputs = ignoreInputs ?? !isEscapeKey;

      // Skip if we're in an input and should ignore inputs
      if (isInInput && shouldIgnoreInputs) continue;

      // Execute the action
      if (preventDefault) {
        event.preventDefault();
      }

      try {
        action();
      } catch (error) {
        // Log error but don't break the app
        console.error('Keyboard shortcut action failed:', error);
      }

      // Only handle one shortcut per keypress
      break;
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export default useKeyboardShortcuts;
