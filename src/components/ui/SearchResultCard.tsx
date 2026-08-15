import { motion } from 'framer-motion';
import { Film, Tv, Star, User, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { tmdbImage } from '@/lib/tmdb';
import { SafeImage } from '@/components/ui/SafeImage';
import { highlightMatchText } from '@/lib/searchUtils';

interface BaseResult {
  id: number;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
}

interface MovieResult extends BaseResult {
  media_type: 'movie';
  title: string;
  release_date?: string;
}

interface TVResult extends BaseResult {
  media_type: 'tv';
  name: string;
  first_air_date?: string;
}

interface PersonResult {
  id: number;
  media_type: 'person';
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  known_for?: Array<{
    id: number;
    title?: string;
    name?: string;
    media_type: 'movie' | 'tv';
    poster_path: string | null;
  }>;
}

type SearchResult = MovieResult | TVResult | PersonResult;

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  searchQuery?: string;
  onClick: () => void;
}

export function SearchResultCard({ result, index, searchQuery = '', onClick }: SearchResultCardProps) {
  if (result.media_type === 'person') {
    return <PersonCard result={result} index={index} searchQuery={searchQuery} onClick={onClick} />;
  }

  return <MediaCard result={result} index={index} searchQuery={searchQuery} onClick={onClick} />;
}

function MediaCard({ result, index, searchQuery = '', onClick }: {
  result: MovieResult | TVResult;
  index: number;
  searchQuery?: string;
  onClick: () => void;
}) {
  const title = result.media_type === 'movie' ? result.title : (result as TVResult).name;
  const date = result.media_type === 'movie'
    ? result.release_date
    : (result as TVResult).first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const TypeIcon = result.media_type === 'movie' ? Film : Tv;
  const typeLabel = result.media_type === 'movie' ? 'Movie' : 'TV Series';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card glow className="group" onClick={onClick}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <SafeImage
            src={tmdbImage.poster(result.poster_path, 'w342')}
            alt={title}
            fallbackSrc="/placeholder-poster.svg"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
              result.media_type === 'movie'
                ? 'bg-blue-600/90 text-blue-100'
                : 'bg-purple-600/90 text-purple-100'
            }`}>
              <TypeIcon className="w-2.5 h-2.5" />
              {typeLabel}
            </div>
          </div>

          {/* Rating badge */}
          {result.vote_average > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 text-xs">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{result.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-bold line-clamp-2 leading-tight mb-1">
              {highlightMatchText(title, searchQuery)}
            </h3>
            {year && (
              <span className="flex items-center gap-1 text-xs text-muted-light">
                <Calendar className="w-3 h-3" />
                {year}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PersonCard({ result, index, searchQuery = '', onClick }: {
  result: PersonResult;
  index: number;
  searchQuery?: string;
  onClick: () => void;
}) {
  const knownFor = result.known_for?.slice(0, 3) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card glow className="group" onClick={onClick}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <SafeImage
            src={result.profile_path
              ? tmdbImage.profile(result.profile_path, 'h632')
              : `/placeholder-avatar.svg`
            }
            alt={result.name}
            fallbackSrc="/placeholder-avatar.svg"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide bg-emerald-600/90 text-emerald-100">
              <User className="w-2.5 h-2.5" />
              Actor
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm font-bold line-clamp-2 leading-tight mb-1">
              {highlightMatchText(result.name, searchQuery)}
            </h3>
            {result.known_for_department && (
              <p className="text-xs text-muted-light mb-1">{result.known_for_department}</p>
            )}
            {knownFor.length > 0 && (
              <p className="text-xs text-muted line-clamp-1">
                {knownFor.map((k) => k.title || k.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
