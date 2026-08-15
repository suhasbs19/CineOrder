import { cn } from '@/lib/utils';
import type { StreamingProvider } from '@/types';

interface StreamingBadgesProps {
  providers: StreamingProvider[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const providerColors: Record<string, string> = {
  'Netflix': 'bg-[#E50914]/15 border-[#E50914]/30 text-[#E50914]',
  'Disney+': 'bg-[#113CCF]/15 border-[#113CCF]/30 text-[#1CA0F2]',
  'JioHotstar': 'bg-[#002244]/20 border-[#138808]/40 text-[#138808]',
  'Hotstar': 'bg-[#002244]/20 border-[#138808]/40 text-[#138808]',
  'Prime Video': 'bg-[#00A8E1]/15 border-[#00A8E1]/30 text-[#00A8E1]',
  'Apple TV+': 'bg-white/10 border-white/20 text-white',
  'HBO Max': 'bg-[#B528F7]/15 border-[#B528F7]/30 text-[#B528F7]',
  'Hulu': 'bg-[#1CE783]/15 border-[#1CE783]/30 text-[#1CE783]',
  'Peacock': 'bg-[#FFC107]/15 border-[#FFC107]/30 text-[#FFC107]',
  'Paramount+': 'bg-[#0064FF]/15 border-[#0064FF]/30 text-[#0064FF]',
};

export function getProviderUrl(providerName: string, title?: string): string {
  if (!title) return '';
  const encodedTitle = encodeURIComponent(title);
  switch (providerName) {
    case 'Disney+':
      return `https://www.disneyplus.com/search?q=${encodedTitle}`;
    case 'JioHotstar':
    case 'Hotstar':
      return `https://www.hotstar.com/in?q=${encodedTitle}`;
    case 'Max':
    case 'HBO Max':
      return `https://www.max.com/search?q=${encodedTitle}`;
    case 'Netflix':
      return `https://www.netflix.com/search?q=${encodedTitle}`;
    case 'Prime Video':
    case 'Amazon Prime Video':
      return `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodedTitle}`;
    case 'Apple TV':
    case 'Apple TV+':
      return `https://tv.apple.com/search?term=${encodedTitle}`;
    case 'Peacock':
      return `https://www.peacocktv.com/search?query=${encodedTitle}`;
    case 'Paramount+':
      return `https://www.paramountplus.com/search/?q=${encodedTitle}`;
    case 'Hulu':
      return `https://www.hulu.com/search?q=${encodedTitle}`;
    default:
      return '';
  }
}

export function StreamingBadges({ providers, title, className, size = 'md' }: StreamingBadgesProps & { title?: string }) {
  if (!providers || providers.length === 0) return null;

  // Filter ONLY providers that have a valid HTTP/HTTPS URL
  const validProviders = providers
    .map((provider) => {
      let url = provider.url;
      if ((!url || url === '#' || !url.startsWith('http')) && title) {
        url = getProviderUrl(provider.provider_name, title);
      }
      return { ...provider, url };
    })
    .filter((p): p is StreamingProvider & { url: string } => Boolean(p.url && p.url !== '#' && p.url.startsWith('http')));

  if (validProviders.length === 0) return null;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1.5 gap-1.5',
    lg: 'text-sm px-3.5 py-2 gap-2',
  };

  const logoSize = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };

  return (
    <div className={cn('flex flex-wrap gap-2 items-center', className)}>
      {validProviders.map((provider) => (
        <a
          key={provider.id}
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center rounded-xl border font-semibold shadow-sm transition-all hover:scale-105 hover:shadow-md cursor-pointer',
            sizeClasses[size],
            providerColors[provider.provider_name] || 'bg-white/10 border-white/20 text-white'
          )}
        >
          {provider.provider_logo && (
            <img
              src={provider.provider_logo}
              alt={provider.provider_name}
              className={cn('rounded-sm object-cover', logoSize[size])}
            />
          )}
          <span>{provider.provider_name}</span>
        </a>
      ))}
    </div>
  );
}

// Compact version for list items
export function StreamingDots({ providers, className }: { providers?: StreamingProvider[]; className?: string }) {
  if (!providers || providers.length === 0) return null;

  const dotColors: Record<string, string> = {
    'Netflix': 'bg-[#E50914]',
    'Disney+': 'bg-[#113CCF]',
    'Prime Video': 'bg-[#00A8E1]',
    'Apple TV+': 'bg-white',
    'HBO Max': 'bg-[#B528F7]',
    'Hulu': 'bg-[#1CE783]',
    'Peacock': 'bg-[#FFC107]',
    'Paramount+': 'bg-[#0064FF]',
  };

  return (
    <div className={cn('flex items-center gap-1', className)} title={providers.map((p) => p.provider_name).join(', ')}>
      {providers.map((p) => (
        <div
          key={p.id}
          className={cn('w-2 h-2 rounded-full', dotColors[p.provider_name] || 'bg-white/30')}
        />
      ))}
    </div>
  );
}
