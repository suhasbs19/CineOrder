import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Check, Film, Tv, Star, Clock } from 'lucide-react';
import { cn, formatRuntime, formatYear } from '@/lib/utils';
import type { WatchOrder } from '@/types';

import { SafeImage } from './SafeImage';

interface TimelineProps {
  orders: WatchOrder[];
  watchedIds: Set<string>;
  onToggleWatched?: (contentId: string) => void;
}

export function InteractiveTimeline({ orders, watchedIds, onToggleWatched }: TimelineProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => a.position - b.position),
    [orders]
  );

  const selectedContent = sortedOrders.find((o) => o.content_id === selectedId)?.content;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));
  const handleReset = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.timeline-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.max(0.4, Math.min(2, s + delta)));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg glass text-xs text-muted">
        {Math.round(scale * 100)}%
      </div>

      {/* Timeline Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[600px] overflow-hidden rounded-2xl bg-card border border-white/5 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute top-0 left-0 pointer-events-none"
            width="800"
            height={sortedOrders.length * 100 + 100}
            style={{ overflow: 'visible' }}
          >
            {sortedOrders.map((order, i) => {
              if (i === 0) return null;
              const isWatched = watchedIds.has(order.content_id) && watchedIds.has(sortedOrders[i - 1]?.content_id || '');
              return (
                <line
                  key={`line-${i}`}
                  x1={200}
                  y1={i * 100 + 30}
                  x2={200}
                  y2={(i + 1) * 100 + 30}
                  stroke={isWatched ? '#22C55E' : '#E50914'}
                  strokeWidth={2}
                  strokeDasharray={isWatched ? 'none' : '6 4'}
                  opacity={0.5}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {sortedOrders.map((order, i) => {
            const content = order.content;
            if (!content) return null;
            const isWatched = watchedIds.has(content.id);
            const isSelected = selectedId === content.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="timeline-node absolute"
                style={{
                  left: 60,
                  top: (i + 1) * 100,
                  width: 340,
                }}
              >
                <div
                  onClick={() => setSelectedId(isSelected ? null : content.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                      : isWatched
                        ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                        : 'border-white/10 bg-card hover:border-white/20 hover:bg-surface'
                  )}
                >
                  {/* Position Dot */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold',
                    isWatched
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-primary/20 text-primary'
                  )}>
                    {isWatched ? <Check className="w-5 h-5" /> : order.position}
                  </div>

                  {/* Poster */}
                  <SafeImage
                    src={content.poster_url}
                    alt={content.title}
                    fallbackSrc="/placeholder-poster.svg"
                    className={cn(
                      'w-12 h-18 rounded-lg object-cover flex-shrink-0',
                      isWatched && 'opacity-60'
                    )}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      'font-semibold text-sm truncate',
                      isWatched ? 'text-muted-light line-through' : 'text-white'
                    )}>
                      {content.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted">{formatYear(content.release_date)}</span>
                      {content.runtime > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-muted">
                          <Clock className="w-3 h-3" /> {formatRuntime(content.runtime)}
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-yellow-400" /> {content.rating.toFixed(1)}
                      </span>
                    </div>
                    {order.notes && (
                      <p className="text-xs text-primary/60 mt-1 truncate">💡 {order.notes}</p>
                    )}
                  </div>

                  {/* Type Icon */}
                  <div className="flex-shrink-0">
                    {content.type === 'movie' ? (
                      <Film className="w-4 h-4 text-muted" />
                    ) : (
                      <Tv className="w-4 h-4 text-muted" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 z-30 bg-card/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl"
          >
            <div className="flex gap-4">
              <SafeImage
                src={selectedContent.poster_url}
                alt={selectedContent.title}
                fallbackSrc="/placeholder-poster.svg"
                className="w-20 h-30 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{selectedContent.title}</h3>
                <p className="text-sm text-muted-light line-clamp-2 mt-1">{selectedContent.overview}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/movie/${selectedContent.id}`)}
                    className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors"
                  >
                    View Details
                  </button>
                  {onToggleWatched && (
                    <button
                      onClick={() => onToggleWatched(selectedContent.id)}
                      className={cn(
                        'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        watchedIds.has(selectedContent.id)
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      {watchedIds.has(selectedContent.id) ? '✓ Watched' : 'Mark Watched'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
