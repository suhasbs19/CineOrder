import {
  ShieldCheck,
  Clock,
  Zap,
  Eye,
  EyeOff,
  ChevronRight,
  Tv,
  Sparkles,
  Film,
  Compass,
} from 'lucide-react';
import type { ResponseMetadata } from '@/lib/aiAdvisorEngine';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatRuntime } from '@/lib/utils';
import type { Content } from '@/types';

interface AdvisorResponseCardProps {
  data: ResponseMetadata;
  spoilersRevealed?: boolean;
  onToggleSpoilers?: () => void;
  onNavigate?: (path: string) => void;
  onSendQuery?: (query: string) => void;
}

export function AdvisorResponseCard({
  data,
  spoilersRevealed = false,
  onToggleSpoilers,
  onNavigate,
  onSendQuery,
}: AdvisorResponseCardProps) {
  if (!data) return null;

  return (
    <div className="space-y-3.5 pt-2 w-full">
      {/* 1. PREPARATION GUIDE CARD */}
      {data.intent === 'prepare_for' && data.targetContent && (
        <div className="p-4 rounded-xl bg-black/40 border border-primary/30 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-bold text-white text-sm">Story Preparation Guide</span>
            </div>
            {data.storyReadiness !== undefined && (
              <Badge variant={data.storyReadiness >= 80 ? 'success' : 'warning'}>
                Readiness: {data.storyReadiness}%
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3.5 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => onNavigate?.(`/movie/${data.targetContent?.id}`)}>
            <SafeImage
              src={data.targetContent.poster_url}
              alt={data.targetContent.title}
              className="w-14 h-20 rounded-lg object-cover border border-white/10 flex-shrink-0 shadow-md"
            />
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="font-bold text-white text-base leading-tight truncate">{data.targetContent.title}</h4>
              <p className="text-xs text-muted">
                {data.targetContent.release_date?.slice(0, 4)} • {formatRuntime(data.targetContent.runtime || 120)}
              </p>
              {data.preparationData?.formattedWatchTime && (
                <p className="text-xs text-primary font-medium flex items-center gap-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5" /> Prep Watch Time: {data.preparationData.formattedWatchTime}
                </p>
              )}
            </div>
          </div>

          {/* Prerequisite breakdowns */}
          {data.preparationData && (
            <div className="space-y-2 pt-1">
              {data.preparationData.mustWatch.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    🚨 Must Watch Prerequisite ({data.preparationData.mustWatch.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.preparationData.mustWatch.slice(0, 4).map((rec) => (
                      <div
                        key={rec.content.id}
                        onClick={() => onNavigate?.(`/movie/${rec.content.id}`)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                      >
                        <SafeImage src={rec.content.poster_url} alt={rec.content.title} className="w-8 h-11 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-white truncate">{rec.content.title}</p>
                          <p className="text-[10px] text-muted line-clamp-1">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.preparationData.recommended.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    🟠 Recommended ({data.preparationData.recommended.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.preparationData.recommended.slice(0, 4).map((rec) => (
                      <div
                        key={rec.content.id}
                        onClick={() => onNavigate?.(`/movie/${rec.content.id}`)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
                      >
                        <SafeImage src={rec.content.poster_url} alt={rec.content.title} className="w-8 h-11 rounded object-cover flex-shrink-0" />
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-white truncate">{rec.content.title}</p>
                          <p className="text-[10px] text-muted line-clamp-1">{rec.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. SKIP ADVICE CARD */}
      {data.intent === 'skip_advice' && data.targetContent && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className={`w-4 h-4 ${data.importance === 'Skippable' ? 'text-green-400' : 'text-amber-400'}`} />
              Skip Advice Verdict
            </span>
            <Badge variant={data.importance === 'Skippable' ? 'success' : 'warning'}>
              {data.importance || 'Analysis'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <SafeImage
              src={data.targetContent.poster_url}
              alt={data.targetContent.title}
              className="w-12 h-16 rounded-md object-cover border border-white/10 flex-shrink-0"
            />
            <div className="space-y-1 text-xs">
              <p className="font-bold text-white">{data.targetContent.title}</p>
              {data.skipData && (
                <div className="space-y-1">
                  <p className="text-muted">Story Impact If Skipped: <span className="font-bold text-white">{data.skipData.storyImpactPercentage}%</span></p>
                  <ProgressBar value={data.skipData.storyImpactPercentage} size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. TIME BUDGET PLAN CARD */}
      {data.intent === 'time_budget' && data.timePlan && (
        <div className="p-4 rounded-xl bg-black/40 border border-primary/30 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Smart Custom Watch Plan
            </span>
            <span className="text-white font-semibold">
              {formatRuntime(data.timePlan.totalMinutes)} / {data.timePlan.budgetMinutes / 60}h Budget
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Story Coverage</span>
              <span className="font-bold text-primary">{data.timePlan.storyCoveragePercentage}%</span>
            </div>
            <ProgressBar value={data.timePlan.storyCoveragePercentage} size="md" />
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs text-muted font-medium">Recommended Titles in Budget:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.timePlan.recommendedTitles.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onNavigate?.(`/movie/${t.id}`)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-colors"
                >
                  <SafeImage src={t.poster_url} alt={t.title} className="w-9 h-12 rounded object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{t.title}</p>
                    <p className="text-[10px] text-muted">{formatRuntime(t.runtime)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. CHARACTER / VILLAIN ROADMAP CARD */}
      {(data.intent === 'character_journey' || data.characterData || data.villainData) && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              {data.characterData?.name || data.villainData?.name} Roadmap
            </span>
            <span className="text-muted text-[10px]">
              {data.characterData?.franchise || data.villainData?.franchise}
            </span>
          </div>

          <p className="text-xs text-muted-light">
            {data.characterData?.description || data.villainData?.description}
          </p>

          {/* Appearances horizontal scroll */}
          {(data.characterData?.appearances || data.villainData?.appearances) && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-white font-medium">Key Appearances ({data.characterData?.appearances?.length || data.villainData?.appearances?.length}):</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {(data.characterData?.appearances || data.villainData?.appearances || []).map((app: Content, idx: number) => (
                  <div
                    key={app.id}
                    onClick={() => onNavigate?.(`/movie/${app.id}`)}
                    className="flex-shrink-0 w-24 space-y-1.5 cursor-pointer group"
                  >
                    <div className="relative">
                      <SafeImage
                        src={app.poster_url}
                        alt={app.title}
                        className="w-24 h-32 rounded-lg object-cover border border-white/10 group-hover:border-primary/50 transition-colors"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-white border border-white/10">
                        #{idx + 1}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-white truncate group-hover:text-primary transition-colors">{app.title}</p>
                    <p className="text-[9px] text-muted">{app.release_date?.slice(0, 4)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4.5 CHARACTER / SUB-FRANCHISE SERIES CARD */}
      {data.intent === 'character_series' && data.seriesData && (
        <div className="p-4 rounded-xl bg-black/40 border border-primary/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              {data.seriesData.title}
            </span>
            <span className="text-muted text-[10px]">
              {data.seriesData.movies.length} titles • {data.seriesData.franchiseName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {data.seriesData.movies.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => onNavigate?.(`/movie/${m.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all group"
              >
                <div className="relative flex-shrink-0">
                  <SafeImage src={m.poster_url} alt={m.title} className="w-10 h-14 rounded object-cover" />
                  <span className="absolute top-0.5 left-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-bold text-white">
                    #{idx + 1}
                  </span>
                </div>
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-white truncate group-hover:text-primary transition-colors">{m.title}</p>
                  <p className="text-[10px] text-muted">{m.release_date?.slice(0, 4)} • {formatRuntime(m.runtime || 120)}</p>
                  {m.ott_available && (
                    <span className="inline-block text-[9px] text-green-400 font-medium">
                      Streamable Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FRANCHISE START CARD */}
      {data.intent === 'franchise_start' && data.franchiseStartData && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="font-bold text-green-400 flex items-center gap-1.5">
              <Compass className="w-4 h-4" />
              {data.franchiseStartData.franchise.name} Entry Points
            </span>
            <span className="text-muted text-[10px]">
              {data.franchiseStartData.totalTitles} titles total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.franchiseStartData.entryPoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => onNavigate?.(`/movie/${ep.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
              >
                <SafeImage src={ep.poster_url} alt={ep.title} className="w-10 h-14 rounded object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{ep.title}</p>
                  <p className="text-[10px] text-muted">{ep.release_date?.slice(0, 4)} • Entry Point</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. WHAT TO WATCH TONIGHT / WHAT'S NEXT CARD */}
      {(data.intent === 'watch_tonight' || data.intent === 'whats_next') && data.whatToWatchData && (
        <div className="p-4 rounded-xl bg-black/40 border border-primary/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
            <span className="font-bold text-primary flex items-center gap-1.5">
              <Film className="w-4 h-4" />
              Recommended Viewing
            </span>
            <span className="text-muted text-[10px]">
              {data.whatToWatchData.basedOn}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.whatToWatchData.suggestions.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate?.(`/movie/${item.id}`)}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all"
              >
                <SafeImage src={item.poster_url} alt={item.title} className="w-10 h-14 rounded object-cover flex-shrink-0" />
                <div className="min-w-0 text-xs">
                  <p className="font-bold text-white truncate">{item.title}</p>
                  <p className="text-[10px] text-muted">{item.release_date?.slice(0, 4)} • {formatRuntime(item.runtime || 120)}</p>
                  {item.ott_available && (
                    <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded bg-green-500/20 text-green-400 font-semibold">
                      Streamable Now
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. OTT STREAMING STATUS CARD */}
      {data.intent === 'ott_status' && data.ottData && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-blue-400" />
              Streaming Availability
            </span>
            <Badge variant={data.ottData.isAvailable ? 'success' : 'default'}>
              {data.ottData.isAvailable ? 'Streamable' : 'Pre-OTT / Theatrical'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <SafeImage
              src={data.ottData.title.poster_url}
              alt={data.ottData.title.title}
              className="w-11 h-15 rounded object-cover border border-white/10 flex-shrink-0"
            />
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">{data.ottData.title.title}</p>
              <p className="text-muted">
                {data.ottData.isAvailable
                  ? `Providers: ${data.ottData.providers.join(', ') || 'Major platforms'}`
                  : 'Currently not available on OTT platforms'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8. WATCH ORDER COMPARISON CARD */}
      {data.intent === 'compare_orders' && data.watchOrders && (
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 shadow-lg text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              Release Order vs Chronological Order
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <p className="font-bold text-primary">🎬 Release Order</p>
              <p className="text-[11px] text-muted">Watch in the order released in theaters. Preserves original plot reveals and post-credit surprises.</p>
              <div className="space-y-1 pt-1">
                {data.watchOrders.release.slice(0, 4).map((c, i) => (
                  <p key={c.id} className="text-[11px] text-white truncate">{i + 1}. {c.title} ({c.release_date?.slice(0, 4)})</p>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2">
              <p className="font-bold text-amber-400">⏳ Chronological Order</p>
              <p className="text-[11px] text-muted">Watch in the order events happen in-universe. Ideal for rewatches and deep lore appreciation.</p>
              <div className="space-y-1 pt-1">
                {data.watchOrders.chronological.slice(0, 4).map((c, i) => (
                  <p key={c.id} className="text-[11px] text-white truncate">{i + 1}. {c.title} ({c.release_date?.slice(0, 4)})</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SPOILER SHIELD TOGGLE */}
      {data.spoilerContent && (
        <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              Spoiler Shield
            </span>
            {onToggleSpoilers && (
              <button
                onClick={onToggleSpoilers}
                className="text-primary hover:underline text-xs flex items-center gap-1 font-semibold"
              >
                {spoilersRevealed ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide Spoilers
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Reveal Spoilers
                  </>
                )}
              </button>
            )}
          </div>

          {spoilersRevealed && (
            <p className="text-amber-300/90 italic pt-1 border-t border-white/5">
              {data.spoilerContent}
            </p>
          )}
        </div>
      )}

      {/* 10. FOLLOW-UP SUGGESTIONS CHIPS */}
      {data.followUpSuggestions && data.followUpSuggestions.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-1.5">
          {data.followUpSuggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => onSendQuery?.(sug)}
              className="px-2.5 py-1.5 rounded-lg bg-surface/90 hover:bg-primary/20 border border-white/10 hover:border-primary/40 text-xs text-muted hover:text-white transition-all flex items-center gap-1 text-left"
            >
              <span>{sug}</span>
              <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
