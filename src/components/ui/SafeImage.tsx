import { useState, useEffect } from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  fallbackSrc = '/placeholder-poster.svg',
  alt = '',
  className = '',
  ...props
}: SafeImageProps) {
  const primarySrc = src && src.trim().length > 0 ? src.trim() : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(primarySrc);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  useEffect(() => {
    const validSrc = src && src.trim().length > 0 ? src.trim() : fallbackSrc;
    setImgSrc(validSrc);
    setLoading(true);
    setHasFailedAll(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      // Primary image failed, switch to fallbackSrc (e.g. /placeholder-poster.svg)
      setImgSrc(fallbackSrc);
      setLoading(false);
    } else {
      // fallbackSrc also failed, render styled CSS placeholder box
      setHasFailedAll(true);
      setLoading(false);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && !hasFailedAll && (
        <div className="absolute inset-0 bg-secondary/40 animate-pulse flex items-center justify-center z-10" />
      )}
      {hasFailedAll ? (
        <div className="w-full h-full bg-gradient-to-br from-indigo-900/80 via-slate-900 to-purple-950/80 flex flex-col items-center justify-center p-2 text-center select-none border border-white/10">
          <span className="text-xl sm:text-2xl font-black text-white/90 uppercase tracking-wider drop-shadow-md">
            {alt ? alt.charAt(0) : '🎬'}
          </span>
          <span className="text-[9px] font-bold text-white/50 line-clamp-2 mt-1 px-1">
            {alt}
          </span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      )}
    </div>
  );
}
