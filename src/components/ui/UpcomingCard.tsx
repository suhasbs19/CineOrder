import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Film, Tv, Play, Info, Sparkles } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { UpcomingItem } from '@/hooks/useUpcomingReleases';

interface UpcomingCardProps {
  item: UpcomingItem;
  featured?: boolean;
  mode?: 'upcoming' | 'recently_released';
}

export function UpcomingCard({ item, featured = false, mode = 'upcoming' }: UpcomingCardProps) {
  const navigate = useNavigate();

  const isReleasedMode = mode === 'recently_released' || item.status === 'Released';

  const handleCardClick = () => {
    navigate(`/movie/${item.id}`);
  };

  if (featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-dark border border-primary/30 shadow-2xl group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background Backdrop */}
        <div className="relative aspect-[16/10] sm:aspect-[2.4/1] w-full min-h-[180px] sm:min-h-[260px] overflow-hidden">
          <SafeImage
            src={item.backdrop_url || item.poster_url}
            alt={item.title}
            fallbackSrc="/placeholder-backdrop.svg"
            aspectRatio="auto"
            priority={featured}
            imgClassName="group-hover:scale-105 transition-transform duration-700 w-full h-full object-cover"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent pointer-events-none" />
        </div>

        {/* Content Banner Overlay */}
        <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-10">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-primary/90 text-white text-[10px] sm:text-xs font-extrabold uppercase tracking-wider shadow-lg">
              {item.franchise_name}
            </span>

            {isReleasedMode ? (
              <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] sm:text-xs py-0.5 sm:py-1">
                Now Available
              </Badge>
            ) : (
              <Badge variant="primary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] sm:text-xs py-0.5 sm:py-1">
                {item.countdown.text}
              </Badge>
            )}
          </div>

          <div className="max-w-2xl space-y-1.5 sm:space-y-3">
            <h2 className="text-lg sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md line-clamp-2">
              {item.title}
            </h2>

            <p className="text-muted-light text-xs sm:text-sm line-clamp-2 hidden sm:block">
              {item.overview}
            </p>

            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-medium text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {item.countdown.formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                {item.type === 'series' ? <Tv className="w-3.5 h-3.5 text-blue-400" /> : <Film className="w-3.5 h-3.5 text-primary" />}
                {item.type === 'series' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            <div className="pt-1 sm:pt-2 flex items-center gap-3">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                leftIcon={isReleasedMode ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                className="shadow-lg shadow-primary/25 font-bold text-xs sm:text-sm py-1.5 sm:py-2.5"
              >
                {isReleasedMode ? 'Start Watching' : 'Prepare to Watch'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      data-testid="upcoming-card"
      className="glass-dark rounded-2xl border border-white/10 overflow-hidden flex flex-row sm:flex-col justify-between group cursor-pointer hover:border-primary/40 transition-all duration-300 shadow-xl"
    >
      {/* ─── Poster Header (Left on Mobile, Top on Desktop) ─── */}
      <div className="relative w-[105px] min-w-[105px] max-w-[105px] sm:w-full sm:min-w-0 sm:max-w-none aspect-[2/3] self-stretch sm:self-auto overflow-hidden flex-shrink-0 bg-surface/40">
        <SafeImage
          src={item.poster_url}
          alt={item.title}
          fallbackSrc="/placeholder-poster.svg"
          aspectRatio="poster"
          imgClassName="group-hover:scale-105 transition-transform duration-500 w-full h-full object-cover"
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        {/* Franchise Pill (Desktop only inside poster) */}
        <div className="hidden sm:block absolute top-3 left-3 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
            {item.franchise_name}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-auto sm:right-3 z-10">
          {isReleasedMode ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded sm:rounded-full bg-green-500/90 text-black text-[9px] sm:text-[10px] font-extrabold uppercase shadow">
              <span className="sm:hidden">Available</span>
              <span className="hidden sm:inline">Now Available</span>
            </span>
          ) : item.status === 'TBA' ? (
            <span className="px-1.5 sm:px-2 py-0.5 rounded sm:rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold shadow">
              TBA
            </span>
          ) : (
            <span className="px-1.5 sm:px-2 py-0.5 rounded sm:rounded-full bg-primary/90 text-white text-[9px] sm:text-[10px] font-bold shadow">
              Upcoming
            </span>
          )}
        </div>

        {/* Countdown Pill at Poster Bottom (Desktop only) */}
        <div className="hidden sm:block absolute bottom-3 left-3 right-3 z-10">
          <div className="px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-primary">
              <Clock className="w-3.5 h-3.5" />
              {item.countdown.text}
            </span>
            <span className="text-[10px] text-muted font-normal">
              {item.type === 'series' ? 'TV' : 'Movie'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Card Body & Actions (Right on Mobile, Bottom on Desktop) ─── */}
      <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 min-w-0">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          {/* Mobile-only Top Row: Franchise Pill & Media Type */}
          <div className="flex sm:hidden items-center justify-between gap-1 text-[10px] text-muted">
            <span className="px-1.5 py-0.5 rounded bg-white/10 font-semibold text-white/90 truncate max-w-[130px]">
              {item.franchise_name}
            </span>
            <span className="flex items-center gap-1 font-medium flex-shrink-0">
              {item.type === 'series' ? <Tv className="w-3 h-3 text-blue-400" /> : <Film className="w-3 h-3 text-primary" />}
              {item.type === 'series' ? 'TV' : 'Movie'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-1 leading-snug">
            {item.title}
          </h3>

          {/* Mobile Countdown & Date */}
          <div className="flex sm:hidden flex-col gap-0.5 text-xs pt-0.5">
            <span className="flex items-center gap-1 font-bold text-primary text-xs">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{item.countdown.text}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{item.countdown.formattedDate}</span>
            </span>
          </div>

          {/* Desktop Date */}
          <div className="hidden sm:flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.countdown.formattedDate}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 sm:pt-3">
          <Button
            variant={isReleasedMode ? 'secondary' : 'outline'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            leftIcon={isReleasedMode ? <Play className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
            className="w-full text-xs font-semibold py-1 sm:py-2 h-7 sm:h-9 text-[11px] sm:text-xs"
          >
            {isReleasedMode ? 'Start Watching' : 'Prepare to Watch'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
