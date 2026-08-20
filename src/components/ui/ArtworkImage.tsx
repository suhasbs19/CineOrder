/**
 * CineOrder Unified Artwork Image Component
 * Re-exports the unified, robust SafeImage component conforming to
 * CineOrder's Artwork Engineering Architecture.
 */

export {
  SafeImage as default,
  SafeImage,
  ArtworkImage,
  type SafeImageProps,
} from './SafeImage';

export {
  preloadImage,
  preloadImages,
  isImageCached,
  markImageLoaded,
  clearImageCache,
} from '@/lib/imagePreload';
