import { useState, useEffect } from 'react';
import { tmdb, isTMDbConfigured, tmdbImage } from '@/lib/tmdb';
import type { TMDbWatchProviders } from '@/lib/tmdb';

interface StreamingProvidersProps {
  tmdbId: number | null;
  type: 'movie' | 'tv';
  country?: string;
}

interface ProviderInfo {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export function StreamingProviders({ tmdbId, type, country }: StreamingProvidersProps) {
  const [providers, setProviders] = useState<{
    flatrate: ProviderInfo[];
    rent: ProviderInfo[];
    buy: ProviderInfo[];
    link?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-detect country from browser locale
  const detectedCountry = country || navigator.language?.split('-')[1]?.toUpperCase() || 'US';

  useEffect(() => {
    if (!tmdbId || !isTMDbConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProviders() {
      try {
        const data: TMDbWatchProviders = type === 'movie'
          ? await tmdb.getMovieProviders(tmdbId!)
          : await tmdb.getTVProviders(tmdbId!);

        if (cancelled) return;

        const regionData = data.results?.[detectedCountry] || data.results?.['US'];
        if (regionData) {
          setProviders({
            flatrate: regionData.flatrate || [],
            rent: regionData.rent || [],
            buy: regionData.buy || [],
            link: regionData.link,
          });
        }
      } catch {
        // Silently fail — just don't show providers
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProviders();
    return () => { cancelled = true; };
  }, [tmdbId, type, detectedCountry]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-white/5 p-5">
        <h3 className="font-semibold text-lg mb-3">Where to Watch</h3>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-12 rounded-lg shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const hasProviders = providers &&
    (providers.flatrate.length > 0 || providers.rent.length > 0 || providers.buy.length > 0);

  return (
    <div className="bg-card rounded-xl border border-white/5 p-5">
      <h3 className="font-semibold text-lg mb-3">Where to Watch</h3>

      {!hasProviders ? (
        <p className="text-sm text-muted">
          {isTMDbConfigured()
            ? 'No streaming information available for your region.'
            : 'Configure TMDb API key to see streaming availability.'}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Stream (Flatrate) */}
          {providers!.flatrate.length > 0 && (
            <ProviderSection label="Stream" providers={providers!.flatrate} />
          )}

          {/* Rent */}
          {providers!.rent.length > 0 && (
            <ProviderSection label="Rent" providers={providers!.rent} />
          )}

          {/* Buy */}
          {providers!.buy.length > 0 && (
            <ProviderSection label="Buy" providers={providers!.buy} />
          )}

          {/* TMDb attribution */}
          {providers?.link && (
            <a
              href={providers.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-muted hover:text-muted-light transition-colors mt-2"
            >
              Powered by JustWatch · View all options →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ProviderSection({ label, providers }: { label: string; providers: ProviderInfo[] }) {
  return (
    <div>
      <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <div
            key={p.provider_id}
            className="group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-light border border-white/5 hover:border-white/10 transition-all"
          >
            <img
              src={tmdbImage.logo(p.logo_path, 'w92')}
              alt={p.provider_name}
              className="w-6 h-6 rounded"
              loading="lazy"
            />
            <span className="text-xs font-medium text-muted-light group-hover:text-white transition-colors">
              {p.provider_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
