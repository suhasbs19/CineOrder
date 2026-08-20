import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SafeImage } from './SafeImage';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = true, glow = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'bg-card rounded-xl overflow-hidden border border-white/5 transition-all duration-300',
        hover && 'cursor-pointer hover:border-white/10',
        glow && 'card-glow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop' | 'square';
  fallbackSrc?: string;
}

export function CardImage({ src, alt, className, aspectRatio = 'poster', fallbackSrc }: CardImageProps) {
  const defaultFallback = aspectRatio === 'backdrop' ? '/placeholder-backdrop.svg' : '/placeholder-poster.svg';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <SafeImage
        src={src}
        alt={alt}
        fallbackSrc={fallbackSrc || defaultFallback}
        aspectRatio={aspectRatio}
        imgClassName="transition-transform duration-500 group-hover:scale-105"
        className="w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
