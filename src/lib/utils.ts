// ─── Utility: className merger ──────────────────────────────
// Lightweight cn() utility without clsx dependency
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Format Runtime ─────────────────────────────────────────
export function formatRuntime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// ─── Format Total Runtime ───────────────────────────────────
export function formatTotalRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  }
  return `${hours}h`;
}

// ─── Format Date ────────────────────────────────────────────
export function formatDate(dateString: string): string {
  if (!dateString) return 'TBA';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Format Year ────────────────────────────────────────────
export function formatYear(dateString: string): string {
  if (!dateString) return 'TBA';
  return new Date(dateString).getFullYear().toString();
}

// ─── Slugify ────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Rating to Stars ────────────────────────────────────────
export function ratingToStars(rating: number): number {
  return Math.round((rating / 10) * 5 * 10) / 10;
}

// ─── Debounce ───────────────────────────────────────────────
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// ─── Content Type Labels ────────────────────────────────────
export const contentTypeLabels: Record<string, string> = {
  movie: 'Movie',
  series: 'TV Series',
  ova: 'OVA',
  short: 'Short Film',
  special: 'Special',
  animated: 'Animated',
  game: 'Game',
  book: 'Book',
  comic: 'Comic',
  podcast: 'Podcast',
};

// ─── Content Type Colors ────────────────────────────────────
export const contentTypeColors: Record<string, string> = {
  movie: 'bg-blue-600',
  series: 'bg-purple-600',
  ova: 'bg-orange-600',
  short: 'bg-teal-600',
  special: 'bg-yellow-600',
  animated: 'bg-pink-600',
  game: 'bg-emerald-600',
  book: 'bg-amber-600',
  comic: 'bg-rose-600',
  podcast: 'bg-cyan-600',
};

// ─── Status Labels ──────────────────────────────────────────
export const statusLabels: Record<string, string> = {
  released: 'Released',
  upcoming: 'Upcoming',
  in_production: 'In Production',
};

// ─── Normalize Title & Equivalence ───────────────────────────

/**
 * Basic title normalization (strips special chars, converts & to and, lowercases).
 */
export function normalizeTitle(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['":,.-]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reusable canonical title normalization function for TMDB & metadata comparisons.
 * Normalizes punctuation, ampersands, Roman numerals, digit words, Unicode symbols,
 * franchise/brand prefixes, and subtitle separators.
 */
export function normalizeTitleForMetadataComparison(str: string | null | undefined): string {
  if (!str) return '';

  let s = str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Normalize Unicode quotes & dashes
  s = s
    .replace(/[’'‘`´]/g, '')
    .replace(/[“”"]/g, '')
    .replace(/[—–-]/g, ' ')
    .replace(/&/g, ' and ');

  // Standardize Roman numerals to digits
  s = s
    .replace(/\bviii\b/gi, '8')
    .replace(/\bvii\b/gi, '7')
    .replace(/\bvi\b/gi, '6')
    .replace(/\biv\b/gi, '4')
    .replace(/\biii\b/gi, '3')
    .replace(/\bii\b/gi, '2')
    .replace(/\bix\b/gi, '9')
    .replace(/\bv\b/gi, '5')
    .replace(/\bx\b/gi, '10')
    .replace(/\bi\b/gi, '1');

  // Standardize word numbers to digits
  s = s
    .replace(/\bten\b/gi, '10')
    .replace(/\bnine\b/gi, '9')
    .replace(/\beight\b/gi, '8')
    .replace(/\bseven\b/gi, '7')
    .replace(/\bsix\b/gi, '6')
    .replace(/\bfive\b/gi, '5')
    .replace(/\bfour\b/gi, '4')
    .replace(/\bthree\b/gi, '3')
    .replace(/\btwo\b/gi, '2')
    .replace(/\bone\b/gi, '1');

  // Strip subtitle/part keywords if followed by digits
  s = s
    .replace(/\bchapter\b/gi, '')
    .replace(/\bpart\b/gi, '')
    .replace(/\bvolume\b/gi, '')
    .replace(/\bvol\b/gi, '');

  // Strip common brand/franchise prefixes that vary in TMDB
  s = s
    .replace(/\bmarvels\b/gi, '')
    .replace(/\bmarvel\b/gi, '')
    .replace(/\bfrom the world of john wick\b/gi, '')
    .replace(/\bstar wars\b/gi, '')
    .replace(/\bepisode\s+[0-9ivx]+\b/gi, '');

  // Strip non-alphanumeric
  s = s.replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  return s;
}

/**
 * Checks whether two title strings represent the same underlying movie or TV title.
 */
export function isTitleEquivalent(titleA: string | null | undefined, titleB: string | null | undefined): boolean {
  if (!titleA || !titleB) return false;

  const normA = normalizeTitle(titleA);
  const normB = normalizeTitle(titleB);
  if (normA === normB) return true;

  const canonA = normalizeTitleForMetadataComparison(titleA);
  const canonB = normalizeTitleForMetadataComparison(titleB);
  if (canonA === canonB && canonA.length > 0) return true;

  // Extract numbers to prevent false positive matches between sequels (e.g. "Evil Dead" vs "Evil Dead 2")
  const getDigits = (s: string) => (s.match(/\d+/g) || []).join('');
  const digitsA = getDigits(canonA);
  const digitsB = getDigits(canonB);
  if (digitsA !== digitsB) {
    return false;
  }

  // Strip leading "the"
  const stripThe = (s: string) => s.replace(/^the\s+/, '').trim();
  if (stripThe(canonA) === stripThe(canonB) && stripThe(canonA).length > 0) return true;

  // Subtitle colon splitting
  const colonA = normalizeTitleForMetadataComparison(titleA.split(':')[0]);
  const colonB = normalizeTitleForMetadataComparison(titleB.split(':')[0]);
  if (colonA === colonB && colonA.length > 3) return true;

  // Synonym mappings for specific franchise working titles
  const synonyms: Array<[string, string]> = [
    ['shang chi 2', 'untitled shang chi sequel'],
    ['vision quest', 'untitled vision series'],
    ['fast x part 2', 'fast xi'],
    ['fast x part 2', 'fast forever'],
    ['fast xi', 'fast forever'],
    ['fast x part 2', 'fast x 2'],
    ['harry potter tv series', 'harry potter'],
    ['star wars episode 4 a new hope', 'star wars'],
    ['star wars episode iv a new hope', 'star wars'],
  ];

  for (const [s1, s2] of synonyms) {
    const cs1 = normalizeTitleForMetadataComparison(s1);
    const cs2 = normalizeTitleForMetadataComparison(s2);
    if (
      (canonA.includes(cs1) && canonB.includes(cs2)) ||
      (canonA.includes(cs2) && canonB.includes(cs1))
    ) {
      return true;
    }
  }

  return false;
}
