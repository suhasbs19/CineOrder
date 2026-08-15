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
        className="relative rounded-3xl overflow-hidden glass-dark border border-primary/30 shadow-2xl group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Background Backdrop */}
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full overflow-hidden">
          <SafeImage
            src={item.backdrop_url || item.poster_url}
            alt={item.title}
            fallbackSrc="/placeholder-backdrop.svg"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        </div>

        {/* Content Banner Overlay */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/90 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg">
              {item.franchise_name}
            </span>

            {isReleasedMode ? (
              <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">
                Now Available
              </Badge>
            ) : (
              <Badge variant="primary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {item.countdown.text}
              </Badge>
            )}
          </div>

          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
              {item.title}
            </h2>

            <p className="text-muted-light text-xs sm:text-sm line-clamp-2 hidden sm:block">
              {item.overview}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {item.countdown.formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                {item.type === 'series' ? <Tv className="w-4 h-4 text-blue-400" /> : <Film className="w-4 h-4 text-primary" />}
                {item.type === 'series' ? 'TV Series' : 'Movie'}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button
                size="md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                leftIcon={isReleasedMode ? <Play className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                className="shadow-lg shadow-primary/25 font-bold"
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
      whileHover={{ y: -6 }}
      onClick={handleCardClick}
      className="glass-dark rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-primary/40 transition-all duration-300 shadow-xl"
    >
      <div className="space-y-3">
        {/* Poster Header */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <SafeImage
            src={item.poster_url}
            alt={item.title}
            fallbackSrc="/placeholder-poster.svg"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* Franchise Pill */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider">
              {item.franchise_name}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            {isReleasedMode ? (
              <span className="px-2 py-0.5 rounded-full bg-green-500/90 text-black text-[10px] font-extrabold uppercase">
                Now Available
              </span>
            ) : item.status === 'TBA' ? (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                TBA
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-primary/90 text-white text-[10px] font-bold">
                Upcoming
              </span>
            )}
          </div>

          {/* Countdown Pill at Poster Bottom */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
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

        {/* Card Body */}
        <div className="p-4 space-y-2">
          <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </h3>

          <div className="flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {item.countdown.formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 pt-0">
        <Button
          variant={isReleasedMode ? 'secondary' : 'outline'}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          leftIcon={isReleasedMode ? <Play className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
          className="w-full text-xs font-bold py-2"
        >
          {isReleasedMode ? 'Start Watching' : 'Prepare to Watch'}
        </Button>
      </div>
    </motion.div>
  );
}
