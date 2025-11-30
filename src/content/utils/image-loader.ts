/**
 * Image Loader Utility
 * 
 * Supports loading images from:
 * - Web URLs (http/https)
 * - Windows paths (C:\path\to\image.jpg)
 * - Unix paths (/path/to/image.jpg)
 * - Relative paths (./images/image.jpg)
 * 
 * Features:
 * - Configurable base path for dataset images
 * - Path normalization for cross-platform support
 * - URL validation and transformation
 * - Fallback image support
 */

export interface ImageLoaderConfig {
  /** Base path for dataset images (can be local path or URL) */
  basePath: string;
  /** Fallback image when loading fails */
  fallbackImage?: string;
  /** Whether to allow external URLs */
  allowExternalUrls?: boolean;
  /** Custom path resolver function */
  pathResolver?: (path: string) => string;
}

// Default configuration
const DEFAULT_CONFIG: ImageLoaderConfig = {
  basePath: '/images',
  fallbackImage: '/placeholder.svg',
  allowExternalUrls: true,
};

// Global configuration state
let globalConfig: ImageLoaderConfig = { ...DEFAULT_CONFIG };

/**
 * Check if a string is a web URL
 */
export function isWebUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

/**
 * Check if a string is a Windows absolute path
 * Matches patterns like: C:\, D:\, \\server\share
 */
export function isWindowsPath(path: string): boolean {
  return /^[a-zA-Z]:\\/.test(path) || /^\\\\/.test(path);
}

/**
 * Check if a string is a Unix absolute path
 */
export function isUnixAbsolutePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//');
}

/**
 * Check if a string is a data URL
 */
export function isDataUrl(path: string): boolean {
  return path.startsWith('data:');
}

/**
 * Check if a string is a blob URL
 */
export function isBlobUrl(path: string): boolean {
  return path.startsWith('blob:');
}

/**
 * Normalize Windows path to Unix-style path
 * Converts backslashes to forward slashes
 */
export function normalizeWindowsPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Convert a Windows file path to a file:// URL
 */
export function windowsPathToFileUrl(path: string): string {
  const normalized = normalizeWindowsPath(path);
  // Handle UNC paths (\\server\share)
  if (normalized.startsWith('//')) {
    return `file:${normalized}`;
  }
  // Handle drive letter paths (C:\)
  return `file:///${normalized}`;
}

/**
 * Convert a Unix file path to a file:// URL
 */
export function unixPathToFileUrl(path: string): string {
  return `file://${path}`;
}

/**
 * Resolve an image path based on its type and configuration
 */
export function resolveImagePath(
  imagePath: string,
  config: Partial<ImageLoaderConfig> = {}
): string {
  const mergedConfig = { ...globalConfig, ...config };
  
  // Handle empty or undefined paths
  if (!imagePath || imagePath.trim() === '') {
    return mergedConfig.fallbackImage || '';
  }

  const trimmedPath = imagePath.trim();

  // Use custom resolver if provided
  if (mergedConfig.pathResolver) {
    return mergedConfig.pathResolver(trimmedPath);
  }

  // Handle data URLs and blob URLs (pass through)
  if (isDataUrl(trimmedPath) || isBlobUrl(trimmedPath)) {
    return trimmedPath;
  }

  // Handle web URLs
  if (isWebUrl(trimmedPath)) {
    if (!mergedConfig.allowExternalUrls) {
      console.warn(`External URLs not allowed: ${trimmedPath}`);
      return mergedConfig.fallbackImage || '';
    }
    return trimmedPath;
  }

  // Handle Windows absolute paths
  if (isWindowsPath(trimmedPath)) {
    return windowsPathToFileUrl(trimmedPath);
  }

  // Handle Unix absolute paths
  if (isUnixAbsolutePath(trimmedPath)) {
    return unixPathToFileUrl(trimmedPath);
  }

  // Handle relative paths - combine with base path
  const basePath = mergedConfig.basePath.replace(/\/+$/, ''); // Remove trailing slashes
  const relativePath = trimmedPath.replace(/^\.?\//, ''); // Remove leading ./ or /
  
  return `${basePath}/${relativePath}`;
}

/**
 * Set the global image loader configuration
 */
export function setImageLoaderConfig(config: Partial<ImageLoaderConfig>): void {
  globalConfig = { ...globalConfig, ...config };
}

/**
 * Get the current global configuration
 */
export function getImageLoaderConfig(): ImageLoaderConfig {
  return { ...globalConfig };
}

/**
 * Reset configuration to defaults
 */
export function resetImageLoaderConfig(): void {
  globalConfig = { ...DEFAULT_CONFIG };
}

/**
 * Set the base path for dataset images
 * This is the primary way to change where images are loaded from
 */
export function setDatasetBasePath(basePath: string): void {
  globalConfig.basePath = basePath;
}

/**
 * Get the current dataset base path
 */
export function getDatasetBasePath(): string {
  return globalConfig.basePath;
}

/**
 * Create an image loader instance with custom configuration
 * Useful when you need multiple loaders with different settings
 */
export class ImageLoader {
  private config: ImageLoaderConfig;

  constructor(config: Partial<ImageLoaderConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Resolve an image path using this loader's configuration
   */
  resolve(imagePath: string): string {
    return resolveImagePath(imagePath, this.config);
  }

  /**
   * Update this loader's configuration
   */
  setConfig(config: Partial<ImageLoaderConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get this loader's configuration
   */
  getConfig(): ImageLoaderConfig {
    return { ...this.config };
  }

  /**
   * Set the base path for this loader
   */
  setBasePath(basePath: string): void {
    this.config.basePath = basePath;
  }

  /**
   * Get the base path for this loader
   */
  getBasePath(): string {
    return this.config.basePath;
  }

  /**
   * Preload an image and return a promise
   */
  preload(imagePath: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const resolvedPath = this.resolve(imagePath);
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        if (this.config.fallbackImage) {
          img.src = this.config.fallbackImage;
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
        } else {
          reject(new Error(`Failed to load image: ${imagePath}`));
        }
      };
      
      img.src = resolvedPath;
    });
  }

  /**
   * Check if an image exists (for web URLs)
   */
  async exists(imagePath: string): Promise<boolean> {
    const resolvedPath = this.resolve(imagePath);
    
    if (!isWebUrl(resolvedPath)) {
      // For local files, we can't easily check existence in browser
      return true;
    }

    try {
      const response = await fetch(resolvedPath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Default image loader instance
 */
export const imageLoader = new ImageLoader();
