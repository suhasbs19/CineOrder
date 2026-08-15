import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  tooltipHeader?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const updateTooltipPosition = (tabId: string) => {
    const btn = iconRefs.current[tabId];
    if (btn) {
      const rect = btn.getBoundingClientRect();
      setTooltipPos({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const showTooltip = (tabId: string) => {
    updateTooltipPosition(tabId);
    setActiveTooltipId(tabId);
  };

  const hideTooltip = () => {
    setActiveTooltipId(null);
  };

  // Handle position recalculation on scroll/resize and tap outside
  useEffect(() => {
    if (!activeTooltipId) return;

    function handleScrollOrResize() {
      if (activeTooltipId) {
        updateTooltipPosition(activeTooltipId);
      }
    }

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        hideTooltip();
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeTooltipId]);

  const activeTabItem = tabs.find((t) => t.id === activeTooltipId);

  return (
    <div ref={containerRef} className={cn('relative flex gap-1 p-1 bg-surface rounded-xl', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isTooltipOpen = activeTooltipId === tab.id;
        const tooltipId = `tooltip-${tab.id}`;

        return (
          <div
            key={tab.id}
            className="relative flex items-center"
            onMouseEnter={() => {
              if (tab.description) showTooltip(tab.id);
            }}
            onMouseLeave={hideTooltip}
          >
            <div
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                isActive ? 'text-white' : 'text-muted hover:text-white/70'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-lg"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}

              <button
                type="button"
                onClick={() => onChange(tab.id)}
                className="relative z-10 flex items-center gap-2 focus:outline-none focus:text-white"
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>

              {tab.description && (
                <button
                  ref={(el) => {
                    iconRefs.current[tab.id] = el;
                  }}
                  type="button"
                  aria-label={`Information about ${tab.label}`}
                  aria-describedby={isTooltipOpen ? tooltipId : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isTooltipOpen) {
                      hideTooltip();
                    } else {
                      showTooltip(tab.id);
                    }
                  }}
                  onFocus={() => showTooltip(tab.id)}
                  onBlur={hideTooltip}
                  className="relative z-10 p-1 rounded-full text-muted-light/60 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Portaled Glassmorphism Tooltip */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {activeTooltipId && activeTabItem?.description && tooltipPos && (
              <motion.div
                id={`tooltip-${activeTabItem.id}`}
                role="tooltip"
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: tooltipPos.top,
                  left: tooltipPos.left,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 9999,
                }}
                className="pointer-events-none w-64 sm:w-72 max-w-[calc(100vw-2rem)]"
              >
                <div className="relative bg-card/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl text-left">
                  <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                    {activeTabItem.tooltipHeader || activeTabItem.label}
                  </p>
                  <p className="text-xs text-muted-light leading-relaxed">
                    "{activeTabItem.description}"
                  </p>

                  {/* Arrow pointing down to tab */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-card/95 border-r border-b border-white/10 rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

// ─── Tab Panels ─────────────────────────────────────────────

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
