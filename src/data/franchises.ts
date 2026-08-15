import type { Franchise, Content, WatchOrder, OrderType } from '@/types';
import { allFranchises, allContent, allWatchOrders } from './franchises/index';
import { getFranchiseArtwork } from './franchiseArtwork';

export const franchises: Franchise[] = allFranchises.map((f) => {
  const art = getFranchiseArtwork(f.id);
  const stats = getFranchiseStats(f.id);
  return {
    ...f,
    poster_url: art.poster,
    banner_url: art.banner,
    logo_url: art.logo,
    total_movies: stats.movies,
    total_series: stats.series,
    total_runtime: stats.totalRuntime,
  };
});

export function getFranchiseContent(franchiseId: string): Content[] {
  const list = allContent.filter((c) => c.franchise_id === franchiseId);
  return Array.from(new Map(list.map((item) => [item.id, item])).values());
}

export function getWatchOrders(franchiseId: string, contentOverrides?: Content[]): WatchOrder[] {
  const orders = allWatchOrders.filter((o) => o.franchise_id === franchiseId);
  const franchiseContent = (contentOverrides || allContent).filter((c) => c.franchise_id === franchiseId);
  
  const mapped = orders
    .map((o) => {
      const itemContent = franchiseContent.find((c) => c.id === o.content_id);
      return {
        ...o,
        content: itemContent,
      };
    })
    .filter((o): o is WatchOrder & { content: Content } => Boolean(o.content && o.content.franchise_id === franchiseId));

  const uniqueMap = new Map<string, WatchOrder & { content: Content }>();
  for (const item of mapped) {
    const key = `${item.order_type}-${item.content.id}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  }

  // Pipeline Safety Guarantee: Ensure every canonical content item is present in both 'release' and 'chronological' orders
  const requiredOrderTypes: OrderType[] = ['release', 'chronological'];
  for (const orderType of requiredOrderTypes) {
    const existingContentIds = new Set(
      Array.from(uniqueMap.values())
        .filter((w) => w.order_type === orderType)
        .map((w) => w.content.id)
    );

    const missingContent = franchiseContent.filter((c) => !existingContentIds.has(c.id));
    if (missingContent.length > 0) {
      const sortedMissing = [...missingContent].sort((a, b) => (a.release_date || '').localeCompare(b.release_date || ''));
      const existingMaxPos = Math.max(
        0,
        ...Array.from(uniqueMap.values())
          .filter((w) => w.order_type === orderType)
          .map((w) => w.position)
      );

      sortedMissing.forEach((c, idx) => {
        const synthOrder: WatchOrder & { content: Content } = {
          id: `synth-wo-${orderType}-${c.id}`,
          franchise_id: franchiseId,
          content_id: c.id,
          order_type: orderType,
          position: existingMaxPos + idx + 1,
          notes: '',
          content: c,
        };
        uniqueMap.set(`${orderType}-${c.id}`, synthOrder);
      });
    }
  }

  return Array.from(uniqueMap.values());
}

export function getContentById(contentId: string): Content | undefined {
  if (!contentId) return undefined;

  // 1. Direct match on canonical CineOrder ID (e.g., "mcu-iron-man")
  const directMatch = allContent.find((c) => c.id === contentId);
  if (directMatch) return directMatch;

  // 2. Case-insensitive match on canonical CineOrder ID
  const lowerId = contentId.toLowerCase();
  const lowerMatch = allContent.find((c) => c.id.toLowerCase() === lowerId);
  if (lowerMatch) return lowerMatch;

  // 3. TMDB ID match (supports "tmdb-1726", "1726", or numeric TMDB ID)
  const cleanTmdbStr = contentId.replace(/^tmdb-/i, '');
  const numericTmdbId = parseInt(cleanTmdbStr, 10);
  if (!isNaN(numericTmdbId)) {
    const tmdbMatch = allContent.find((c) => c.tmdb_id === numericTmdbId);
    if (tmdbMatch) return tmdbMatch;
  }

  return undefined;
}

export function getFranchiseBySlug(slug: string): Franchise | undefined {
  return franchises.find((f) => f.slug === slug);
}

export function getPopularFranchises(): Franchise[] {
  return franchises.slice(0, 6);
}

export function getTrendingFranchises(): Franchise[] {
  return [...franchises].sort(() => Math.random() - 0.5).slice(0, 6);
}

export function getRecentFranchises(): Franchise[] {
  return franchises.slice(6, 12);
}

export function getTopRatedFranchises(): Franchise[] {
  return franchises.filter((f) => f.total_movies >= 5);
}

export function searchFranchises(query: string): Franchise[] {
  const q = query.toLowerCase();
  return franchises.filter(
    (f) => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q)
  );
}

export function formatRuntimeDetailed(totalMinutes: number): { days: number; hours: number; minutes: number } {
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

export function getFranchiseStats(franchiseId: string) {
  const content = getFranchiseContent(franchiseId);
  const franchise = allFranchises.find((f) => f.id === franchiseId);
  const movies = content.filter((c) => c.type === 'movie');
  const series = content.filter((c) => c.type === 'series');
  const games = content.filter((c) => c.type === 'game');
  const books = content.filter((c) => c.type === 'book');
  const comics = content.filter((c) => c.type === 'comic');
  const podcasts = content.filter((c) => c.type === 'podcast');
  const specials = content.filter((c) => ['special', 'short', 'ova', 'animated'].includes(c.type));
  const totalMinutes = content.reduce((sum, c) => sum + (c.runtime || 0), 0);
  const rt = formatRuntimeDetailed(franchise?.total_runtime || totalMinutes);
  return {
    movies: movies.length,
    series: series.length,
    games: games.length,
    books: books.length,
    comics: comics.length,
    podcasts: podcasts.length,
    specials: specials.length,
    totalContent: content.length,
    totalRuntime: franchise?.total_runtime || totalMinutes,
    formattedRuntime: rt,
    averageRating: content.length > 0
      ? +(content.reduce((sum, c) => sum + c.rating, 0) / content.length).toFixed(1)
      : 0,
  };
}

export { allContent };

export function searchAllContent(query: string): Content[] {
  const q = query.toLowerCase();
  return allContent.filter(
    (c) => c.title.toLowerCase().includes(q) || c.overview.toLowerCase().includes(q)
  );
}

