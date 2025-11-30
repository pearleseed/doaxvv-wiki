/**
 * React Hook for Image Loading
 * 
 * Provides easy-to-use hooks for loading images with
 * configurable paths and fallback support.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ImageLoader,
  ImageLoaderConfig,
  resolveImagePath,
  setDatasetBasePath,
  getDatasetBasePath,
} from '../utils/image-loader';

export interface UseImageOptions {
  /** Fallback image URL */
  fallback?: string;
  /** Whether to preload the image */
  preload?: boolean;
  /** Custom base path (overrides global) */
  basePath?: string;
}

export interface UseImageResult {
  /** Resolved image URL */
  src: string;
  /** Whether the image is loading */
  isLoading: boolean;
  /** Whether the image failed to load */
  hasError: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Retry loading the image */
  retry: () => void;
}

/**
 * Hook for resolving and loading a single image
 */
export function useImage(
  imagePath: string | undefined,
  options: UseImageOptions = {}
): UseImageResult {
  const { fallback = '/placeholder.svg', preload = false, basePath } = options;
  
  const [isLoading, setIsLoading] = useState(preload);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const src = useMemo(() => {
    if (!imagePath) return fallback;
    return resolveImagePath(imagePath, basePath ? { basePath } : undefined);
  }, [imagePath, basePath, fallback]);

  const retry = useCallback(() => {
    setRetryCount(c => c + 1);
    setHasError(false);
    setError(null);
    setIsLoading(preload);
  }, [preload]);

  useEffect(() => {
    if (!preload || !src) return;

    setIsLoading(true);
    setHasError(false);
    setError(null);

    const img = new Image();
    
    img.onload = () => {
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      setError(`Failed to load image: ${imagePath}`);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, preload, imagePath, retryCount]);

  return { src, isLoading, hasError, error, retry };
}

/**
 * Hook for managing dataset base path
 */
export function useDatasetPath() {
  const [basePath, setBasePath] = useState(getDatasetBasePath);

  const updateBasePath = useCallback((newPath: string) => {
    setDatasetBasePath(newPath);
    setBasePath(newPath);
  }, []);

  return { basePath, setBasePath: updateBasePath };
}

/**
 * Hook for creating a custom image loader instance
 */
export function useImageLoader(config: Partial<ImageLoaderConfig> = {}) {
  const loader = useMemo(() => new ImageLoader(config), [config]);

  useEffect(() => {
    loader.setConfig(config);
  }, [loader, config]);

  const resolve = useCallback(
    (imagePath: string) => loader.resolve(imagePath),
    [loader]
  );

  const preload = useCallback(
    (imagePath: string) => loader.preload(imagePath),
    [loader]
  );

  const setBasePath = useCallback(
    (basePath: string) => loader.setBasePath(basePath),
    [loader]
  );

  return { resolve, preload, setBasePath, loader };
}

/**
 * Hook for preloading multiple images
 */
export function usePreloadImages(imagePaths: string[], basePath?: string) {
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imagePaths.length === 0) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const newLoaded = new Set<string>();
    const newFailed = new Set<string>();
    let completed = 0;

    imagePaths.forEach(path => {
      const img = new Image();
      const resolvedPath = resolveImagePath(path, basePath ? { basePath } : undefined);
      
      img.onload = () => {
        newLoaded.add(path);
        completed++;
        if (completed === imagePaths.length) {
          setLoaded(newLoaded);
          setFailed(newFailed);
          setIsLoading(false);
        }
      };
      
      img.onerror = () => {
        newFailed.add(path);
        completed++;
        if (completed === imagePaths.length) {
          setLoaded(newLoaded);
          setFailed(newFailed);
          setIsLoading(false);
        }
      };
      
      img.src = resolvedPath;
    });
  }, [imagePaths, basePath]);

  return {
    isLoading,
    loaded,
    failed,
    progress: imagePaths.length > 0 
      ? (loaded.size + failed.size) / imagePaths.length 
      : 1,
  };
}
