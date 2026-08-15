import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, Film, Tv, Sparkles, X, CornerDownLeft } from 'lucide-react';
import { allContent } from '@/data/franchises';
import { generatePreparationGuide } from '@/lib/preparationGuide';
import { highlightMatchText } from '@/lib/searchUtils';
import { cn } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Content } from '@/types';

interface TargetComboboxProps {
  value: string;
  onChange: (id: string) => void;
}

export function TargetCombobox({ value, onChange }: TargetComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Positioning coordinates for fixed portal popover
  const [coords, setCoords] = useState<{
    left: number;
    top: number;
    bottom: number;
    width: number;
    openUpward: boolean;
    maxListHeight: number;
  }>({
    left: 0,
    top: 0,
    bottom: 0,
    width: 0,
    openUpward: false,
    maxListHeight: 320,
  });

  // Currently selected item
  const selectedContent = useMemo(() => {
    return (allContent.find((c) => c.id === value) || allContent[0]) as Content;
  }, [value]);

  // Selected content preparation status
  const selectedGuide = useMemo(() => {
    return generatePreparationGuide(selectedContent.id);
  }, [selectedContent.id]);

  const selectedPrereqCount = selectedGuide
    ? selectedGuide.mustWatch.length + selectedGuide.recommended.length
    : 0;

  // Click outside to close (checks both trigger button and portal popover)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update fixed portal position based on trigger location & viewport collision
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const chromeHeight = 92; // fixed search input + hint header + padding
    const baseMaxHeight = Math.min(420, Math.floor(viewportHeight * 0.55));

    // Open upward if space below is too small (< 280px) and space above is greater
    const shouldOpenUp = spaceBelow < 280 && spaceAbove > spaceBelow;

    const availableSpace = shouldOpenUp
      ? spaceAbove - chromeHeight - 16
      : spaceBelow - chromeHeight - 16;

    const calculatedMaxHeight = Math.max(160, Math.min(baseMaxHeight, Math.floor(availableSpace)));

    setCoords({
      left: rect.left,
      top: rect.bottom + 8,
      bottom: viewportHeight - rect.top + 8,
      width: rect.width,
      openUpward: shouldOpenUp,
      maxListHeight: calculatedMaxHeight,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtered results list across entire catalog (without release-date restriction)
  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      // When empty, group into Titles with Preparation Requirements vs Direct Entry / Standalone Titles
      const withPrep = allContent.filter((c) => {
        const guide = generatePreparationGuide(c.id);
        const count = guide ? guide.mustWatch.length + guide.recommended.length : 0;
        return count > 0;
      });
      const withoutPrep = allContent.filter((c) => {
        const guide = generatePreparationGuide(c.id);
        const count = guide ? guide.mustWatch.length + guide.recommended.length : 0;
        return count === 0;
      });

      return {
        isSearching: false,
        major: withPrep,
        others: withoutPrep,
        flat: [...withPrep, ...withoutPrep],
      };
    }

    const matches = allContent.filter((c) => {
      const title = c.title.toLowerCase();
      const franchise = (c.franchise_id || '').toLowerCase();
      return title.includes(q) || franchise.includes(q);
    });

    return { isSearching: true, major: [], others: matches, flat: matches };
  }, [query]);

  const flatItems = filteredList.flat;

  // Reset selectedIndex when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = flatItems[selectedIndex];
      if (target) {
        onChange(target.id);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll active item into view during keyboard navigation
  useEffect(() => {
    if (isOpen && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Combobox Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full bg-surface border rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-all',
          isOpen
            ? 'border-primary/50 ring-2 ring-primary/30 bg-card'
            : 'border-white/10 hover:border-white/20'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-10 rounded overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
            <SafeImage
              src={selectedContent.poster_url}
              alt={selectedContent.title}
              fallbackSrc="/placeholder-poster.svg"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {selectedContent.title}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span>{selectedContent.franchise_id.toUpperCase()}</span>
              <span>•</span>
              <span className="capitalize">{selectedContent.type === 'series' ? 'TV Series' : 'Movie'}</span>
              {selectedContent.release_date && (
                <>
                  <span>•</span>
                  <span>{new Date(selectedContent.release_date).getFullYear()}</span>
                </>
              )}
              <span>•</span>
              {selectedPrereqCount > 0 ? (
                <span className="text-amber-300 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Preparation available ({selectedPrereqCount})
                </span>
              ) : (
                <span className="text-emerald-400 font-medium">
                  ✓ No prior movies required
                </span>
              )}
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn('w-4 h-4 text-muted flex-shrink-0 transition-transform', isOpen && 'rotate-180 text-white')}
        />
      </button>

      {/* Dropdown Popover Panel rendered into body portal to escape all ancestor stacking contexts */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={popoverRef}
                onKeyDown={handleKeyDown}
                style={{
                  position: 'fixed',
                  left: `${coords.left}px`,
                  width: `${coords.width}px`,
                  ...(coords.openUpward
                    ? { bottom: `${coords.bottom}px` }
                    : { top: `${coords.top}px` }),
                  zIndex: 99999,
                }}
                initial={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: coords.openUpward ? 6 : -6, scale: 0.99 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                className="bg-[#181818] border border-white/10 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col divide-y divide-white/5"
              >
                {/* Search Bar inside Dropdown - FIXED at top */}
                <div className="p-2.5 bg-[#1F1F1F] flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search title or franchise..."
                      className="w-full bg-[#141414] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-muted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => setQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Keyboard Hint Header - FIXED at top */}
                <div className="px-3 py-1.5 text-[10px] font-mono text-muted uppercase tracking-wider flex justify-between items-center bg-[#181818] flex-shrink-0">
                  <span>{filteredList.isSearching ? 'Search Results' : 'Select Target Title'}</span>
                  <span className="hidden sm:flex items-center gap-1 text-[9px]">
                    <CornerDownLeft className="w-3 h-3" /> ↑↓ to navigate
                  </span>
                </div>

                {/* Options List Container - ONLY THIS SCROLLS */}
                <div
                  style={{ maxHeight: `${coords.maxListHeight}px` }}
                  className="overflow-y-auto p-1.5 space-y-1 overscroll-contain"
                >
                  {flatItems.length === 0 ? (
                    <div className="py-8 text-center text-muted space-y-1">
                      <Search className="w-6 h-6 mx-auto opacity-30" />
                      <p className="text-xs font-semibold text-white">No matching titles found</p>
                      <p className="text-[11px]">Try searching for another movie or franchise name.</p>
                    </div>
                  ) : (
                    <>
                      {/* Section Header when not searching */}
                      {!filteredList.isSearching && (
                        <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" /> Titles with Preparation Guides ({filteredList.major.length})
                        </div>
                      )}

                      {flatItems.map((item, index) => {
                        const isSelected = item.id === value;
                        const isHighlighted = index === selectedIndex;
                        const isSeries = item.type === 'series';
                        const year = item.release_date ? new Date(item.release_date).getFullYear() : null;

                        const itemGuide = generatePreparationGuide(item.id);
                        const itemPrereqCount = itemGuide
                          ? itemGuide.mustWatch.length + itemGuide.recommended.length
                          : 0;

                        // Show divider before Standalone/Entry Points section
                        const isSectionDivider =
                          !filteredList.isSearching &&
                          index === filteredList.major.length &&
                          filteredList.major.length > 0;

                        return (
                          <div
                            key={item.id}
                            ref={(el) => {
                              itemRefs.current[index] = el;
                            }}
                          >
                            {isSectionDivider && (
                              <div className="px-2.5 pt-3 pb-1 text-[10px] font-bold text-muted uppercase tracking-wider border-t border-white/5 mt-1">
                                Direct Entry & Standalone Titles ({filteredList.others.length})
                              </div>
                            )}

                            <div
                              onClick={() => handleSelect(item.id)}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={cn(
                                'flex items-center justify-between px-2.5 py-2 rounded-xl cursor-pointer transition-all',
                                isHighlighted
                                  ? 'bg-primary/20 text-white border border-primary/30 shadow-md shadow-primary/10'
                                  : 'hover:bg-white/5 text-muted-light'
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Poster Thumbnail */}
                                <div className="w-7 h-10 rounded overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                                  <SafeImage
                                    src={item.poster_url}
                                    alt={item.title}
                                    fallbackSrc="/placeholder-poster.svg"
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <div className="min-w-0 space-y-0.5">
                                  <p className="text-xs font-bold truncate text-white">
                                    {highlightMatchText(item.title, query)}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-muted flex-wrap">
                                    <span className="font-semibold text-amber-300">
                                      {item.franchise_id.toUpperCase()}
                                    </span>
                                    <span>•</span>
                                    <span>{year || 'TBA'}</span>
                                    <span>•</span>
                                    {itemPrereqCount > 0 ? (
                                      <span className="text-amber-300/90 font-medium flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Preparation available ({itemPrereqCount})
                                      </span>
                                    ) : (
                                      <span className="text-emerald-400/90 font-medium">
                                        No prior movies required
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {/* Media Type Badge */}
                                <span
                                  className={cn(
                                    'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide flex items-center gap-1',
                                    isSeries
                                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  )}
                                >
                                  {isSeries ? <Tv className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                                  {isSeries ? 'TV' : 'Movie'}
                                </span>

                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
