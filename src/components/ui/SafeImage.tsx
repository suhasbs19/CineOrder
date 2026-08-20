import { useState, useEffect, useRef, useCallback } from 'react';
import { Film, Tv, Image as ImageIcon } from 'lucide-react';
import { isImageCached, markImageLoaded } from '@/lib/imagePreload';
import { cn } from '@/lib/utils';

export interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  type?: 'poster' | 'backdrop' | 'avatar' | 'auto';
  aspectRatio?: 'poster' | 'backdrop' | 'avatar' | 'square' | 'auto';
  priority?: boolean;
  imgClassName?: string;
  showSkeleton?: boolean;
}

export function SafeImage({
  src,
  fallbackSrc = '/placeholder-poster.svg',
  alt = '',
  className = '',
  imgClassName = '',
  type = 'auto',
  aspectRatio = 'auto',
  priority = false,
  showSkeleton = true,
  loading: imgLoadingProp,
  decoding = 'async',
  ...props
}: SafeImageProps) {
  const cleanSrc = src && src.trim().length > 0 ? src.trim() : '';
  const initialValid = cleanSrc.length > 0;
  const initialCached = initialValid && isImageCached(cleanSrc);

  const [currentSrc, setCurrentSrc] = useState<string>(initialValid ? cleanSrc : fallbackSrc);
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>(
    !initialValid ? 'error' : initialCached ? 'loaded' : 'loading'
  );
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const isMountedRef = useRef<boolean>(true);

  // Sync state when src or fallbackSrc props change
  useEffect(() => {
    isMountedRef.current = true;
    const valid = cleanSrc.length > 0;

    if (!valid) {
      setCurrentSrc(fallbackSrc);
      setImageState('error');
      setHasFailedAll(false);
      return;
    }

    if (isImageCached(cleanSrc)) {
      setCurrentSrc(cleanSrc);
      setImageState('loaded');
      setHasFailedAll(false);
      return;
    }

    setCurrentSrc(cleanSrc);
    setImageState('loading');
    setHasFailedAll(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [cleanSrc, fallbackSrc]);

  const handleLoad = useCallback(() => {
    if (!isMountedRef.current) return;
    markImageLoaded(currentSrc);
    setImageState('loaded');
    setHasFailedAll(false);
  }, [currentSrc]);

  const handleError = useCallback(() => {
    if (!isMountedRef.current) return;
    if (currentSrc !== fallbackSrc && fallbackSrc) {
      // Primary URL failed, attempt fallbackSrc
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    } else {
      // Both primary and fallbackSrc failed
      setImageState('error');
      setHasFailedAll(true);
    }
  }, [currentSrc, fallbackSrc]);

  // Synchronous browser-cache verification on mount & update
  useEffect(() => {
    if (imageState === 'loading' && imgRef.current) {
      if (imgRef.current.complete) {
        if (imgRef.current.naturalWidth > 0) {
          handleLoad();
        } else if (imgRef.current.naturalWidth === 0) {
          handleError();
        }
      }
    }
  }, [currentSrc, imageState, handleLoad, handleError]);

  // Determine aspect ratio class
  const resolvedAspect = aspectRatio !== 'auto' ? aspectRatio : type;
  const aspectClass =
    resolvedAspect === 'poster'
      ? 'aspect-[2/3]'
      : resolvedAspect === 'backdrop'
      ? 'aspect-video'
      : resolvedAspect === 'avatar' || resolvedAspect === 'square'
      ? 'aspect-square'
      : '';

  const IconComponent =
    resolvedAspect === 'backdrop' ? Tv : resolvedAspect === 'poster' ? Film : ImageIcon;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-card/90 select-none',
        aspectClass,
        className
      )}
    >
      {/* ─── Shimmer Loading Skeleton ─── */}
      {showSkeleton && imageState === 'loading' && !hasFailedAll && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card shimmer border border-white/5 transition-opacity duration-200"
        >
          <IconComponent className="w-8 h-8 text-white/15 animate-pulse drop-shadow" />
        </div>
      )}

      {/* ─── Final Fallback Styled Card Tile ─── */}
      {hasFailedAll ? (
        <div
          role="img"
          aria-label={alt || 'Artwork placeholder'}
          className="w-full h-full bg-gradient-to-br from-surface via-card to-background flex flex-col items-center justify-center p-3 text-center border border-white/10"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1.5 shadow-inner">
            <span className="text-base font-black text-white/80 uppercase">
              {alt ? alt.charAt(0) : '🎬'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-muted line-clamp-2 px-1 leading-tight">
            {alt || 'Artwork Unavailable'}
          </span>
        </div>
      ) : (
        /* ─── Actual Image ─── */
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : (imgLoadingProp || 'lazy')}
          decoding={decoding}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            imageState === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * ArtworkImage: Unified alias for SafeImage conforming to CineOrder's
 * Artwork Engineering Architecture.
 */
export const ArtworkImage = SafeImage;
