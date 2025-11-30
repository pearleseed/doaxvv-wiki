/**
 * Hook for loading guide markdown content
 * 
 * Supports:
 * - Bundled markdown files (default)
 * - External files via setMarkdownBasePath() for Windows/Unix paths
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getMarkdownContent,
  loadMarkdownContentAsync,
  parseMarkdownSections,
  markdownToHtml,
  getMarkdownLoaderConfig,
  type MarkdownSection,
} from '../utils/markdown-loader';

export interface UseGuideContentResult {
  /** Raw markdown content */
  rawContent: string | null;
  /** Parsed sections from the markdown */
  sections: MarkdownSection[];
  /** HTML converted from markdown */
  htmlContent: string | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if content couldn't be loaded */
  error: string | null;
  /** Reload the content */
  reload: () => void;
}

/**
 * Hook to load and parse guide markdown content
 * 
 * Usage:
 * ```tsx
 * // Default: loads from bundled files
 * const { sections, isLoading } = useGuideContent("guides/beginner-guide.md");
 * 
 * // With external path configured:
 * // setMarkdownBasePath("C:\\Users\\Name\\Documents\\guides");
 * // or setMarkdownBasePath("/home/user/guides");
 * // Then pre-load content with setExternalMarkdownContent()
 * ```
 * 
 * @param contentRef - The content_ref path (e.g., "guides/beginner-guide.md")
 * @returns Object with content, sections, loading state, and error
 */
export function useGuideContent(
  contentRef: string | undefined
): UseGuideContentResult {
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [sections, setSections] = useState<MarkdownSection[]>([]);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (!contentRef) {
      setRawContent(null);
      setSections([]);
      setHtmlContent(null);
      setIsLoading(false);
      setError('No content reference provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const config = getMarkdownLoaderConfig();
      let content: string | null;

      // Use async loading if external files are configured
      if (config.useExternalFiles) {
        content = await loadMarkdownContentAsync(contentRef);
      } else {
        content = getMarkdownContent(contentRef);
      }

      if (content) {
        setRawContent(content);
        setSections(parseMarkdownSections(content));
        setHtmlContent(markdownToHtml(content));
        setError(null);
      } else {
        setRawContent(null);
        setSections([]);
        setHtmlContent(null);
        setError(`Guide content not found: ${contentRef}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load guide content'
      );
      setRawContent(null);
      setSections([]);
      setHtmlContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [contentRef]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    rawContent,
    sections,
    htmlContent,
    isLoading,
    error,
    reload: loadContent,
  };
}
