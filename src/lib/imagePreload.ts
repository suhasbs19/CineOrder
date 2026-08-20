/**
 * CineOrder Image Preloading & Session In-Memory Cache System
 *
 * Provides:
 * 1. Global in-memory cache of successfully loaded image URLs to eliminate re-loading flicker
 * 2. Deterministic preloading helper for priority cards and hero banners
 * 3. Cache-aware status checking to avoid flashing skeletons on route transitions
 */

const loadedImageUrls = new Set<string>();
const inFlightPreloads = new Map<string, Promise<string>>();

/**
 * Checks whether a given image URL has already been loaded in the current browser session.
 */
export function isImageCached(url?: string | null): boolean {
  if (!url) return false;
  return loadedImageUrls.has(url.trim());
}

/**
 * Marks an image URL as successfully loaded in session memory.
 */
export function markImageLoaded(url?: string | null): void {
  if (!url) return;
  const clean = url.trim();
  if (clean.length > 0) {
    loadedImageUrls.add(clean);
  }
}

/**
 * Preloads an image URL into browser memory.
 * Resolves on successful load or if the URL is already cached.
 * Rejects on network / decode error.
 */
export function preloadImage(url: string): Promise<string> {
  if (!url || url.trim().length === 0) {
    return Promise.reject(new Error('Empty image URL'));
  }

  const cleanUrl = url.trim();

  // If already loaded in session cache
  if (loadedImageUrls.has(cleanUrl)) {
    return Promise.resolve(cleanUrl);
  }

  // If already preloading in flight, reuse existing promise
  const existing = inFlightPreloads.get(cleanUrl);
  if (existing) {
    return existing;
  }

  const promise = new Promise<string>((resolve, reject) => {
    // In SSR or non-browser environments (e.g. unit tests without DOM Image)
    if (typeof Image === 'undefined') {
      loadedImageUrls.add(cleanUrl);
      resolve(cleanUrl);
      return;
    }

    const img = new Image();
    img.decoding = 'async';

    img.onload = () => {
      loadedImageUrls.add(cleanUrl);
      inFlightPreloads.delete(cleanUrl);
      resolve(cleanUrl);
    };

    img.onerror = (err) => {
      inFlightPreloads.delete(cleanUrl);
      reject(err);
    };

    img.src = cleanUrl;

    // Check if the browser synchronously marked it as complete
    if (img.complete && img.naturalWidth > 0) {
      loadedImageUrls.add(cleanUrl);
      inFlightPreloads.delete(cleanUrl);
      resolve(cleanUrl);
    }
  });

  inFlightPreloads.set(cleanUrl, promise);
  return promise;
}

/**
 * Preloads an array of image URLs concurrently.
 * Rejection of a single image does not fail the batch.
 */
export function preloadImages(urls: string[]): Promise<string[]> {
  const validUrls = urls.filter((u) => Boolean(u && u.trim().length > 0));
  return Promise.allSettled(validUrls.map(preloadImage)).then(() => validUrls);
}

/**
 * Clears the session image cache (useful for testing).
 */
export function clearImageCache(): void {
  loadedImageUrls.clear();
  inFlightPreloads.clear();
}
