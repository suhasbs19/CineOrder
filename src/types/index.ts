// ─── Metadata Freshness Thresholds ────────────────────────────

/**
 * Number of days after which `metadata_checked_at` is considered stale.
 * WARN when between WARNING and ERROR thresholds.
 * ERROR only when stale data causes an actual application inconsistency
 * (e.g., a released title still marked upcoming).
 */
export const METADATA_FRESHNESS_WARNING_DAYS = 30;
export const METADATA_FRESHNESS_ERROR_DAYS = 90;

// ─── Franchise ──────────────────────────────────────────────

export interface Franchise {
  id: string;
  name: string;
  slug: string;
  description: string;
  poster_url: string;
  banner_url: string;
  tmdb_collection_id: number | null;
  total_movies: number;
  total_series: number;
  total_runtime: number;
  status: 'active' | 'completed' | 'upcoming';
  created_at: string;
  updated_at: string;
}

// ─── Content ────────────────────────────────────────────────

export type ContentType =
  | 'movie'
  | 'series'
  | 'ova'
  | 'short'
  | 'special'
  | 'animated'
  | 'game'
  | 'book'
  | 'comic'
  | 'podcast';

export type DetailedLifecycleStatus =
  | 'announced'
  | 'upcoming'
  | 'theatrically_released'
  | 'digital_available'
  | 'subscription_available';

/**
 * Canonical lifecycle state machine:
 *
 *   ANNOUNCED
 *     → UPCOMING          (release_date known, not yet theatrically released)
 *     → THEATRICALLY_RELEASED
 *     → DIGITAL_AVAILABLE  (digital_available = true)
 *     → SUBSCRIPTION_AVAILABLE (subscription_streaming_available = true)
 *
 * OTT Availability Rule (canonical, immutable):
 *   ott_available = digital_available OR subscription_streaming_available
 *   (unless an explicit verified_ott_available state overrides)
 *
 * The UI MUST NEVER infer lifecycle state independently.
 * All lifecycle decisions flow from this canonical model via:
 *   - classifyLifecycle()   → DetailedLifecycleStatus
 *   - isOttAvailable()      → boolean
 *   - isTheatricallyUpcoming() → boolean
 */
export interface Content {
  id: string;
  franchise_id: string;
  tmdb_id: number | null;
  title: string;
  type: ContentType;
  poster_url: string;
  backdrop_url: string;
  overview: string;
  release_date: string;
  runtime: number;
  episode_count: number | null;
  season_count: number | null;
  rating: number;
  status: 'released' | 'upcoming' | 'in_production' | 'tba' | 'planned';
  genres: string[];
  director: string;
  cast: CastMember[];
  trailer_url: string;
  is_canon: boolean;
  is_required: boolean;
  streaming_providers?: StreamingProvider[];
  /**
   * CANONICAL RULE: ott_available = digital_available OR subscription_streaming_available.
   * Never set this field independently from digital_available/subscription_streaming_available.
   * Use computeOttAvailable(item) or classifyLifecycle(item) to derive this value.
   * UI components must call isOttAvailable(item) — never read ott_available directly.
   */
  ott_available?: boolean;
  /** ISO date of theatrical release. Defaults to release_date if not set explicitly. */
  theatrical_release_date?: string;
  /** True once the title has been theatrically released (release_date has passed). */
  theatrical_released?: boolean;
  /** True when the title is available for digital purchase/rental (PVOD). */
  digital_available?: boolean;
  /** ISO date when digital/PVOD availability began. */
  digital_release_date?: string;
  /** True when the title is available on a subscription streaming service. */
  subscription_streaming_available?: boolean;
  /** ISO date when subscription streaming availability began. */
  subscription_streaming_release_date?: string;
  /** Canonical lifecycle phase. Derived by classifyLifecycle(). Do not set manually. */
  lifecycle_status?: DetailedLifecycleStatus;
  /** ISO timestamp of last metadata check (any field). Used for freshness validation. */
  metadata_checked_at?: string;
  /** ISO timestamp of last release-date / theatrical-status check. */
  release_metadata_checked_at?: string;
  /** ISO timestamp of last OTT availability check. */
  ott_metadata_checked_at?: string;
  created_at: string;
}

export interface CastMember {
  name: string;
  character: string;
  profile_url: string;
}

// ─── Watch Order ────────────────────────────────────────────

export type OrderType =
  | 'release'
  | 'chronological'
  | 'recommended';

export interface WatchOrder {
  id: string;
  franchise_id: string;
  content_id: string;
  order_type: OrderType;
  position: number;
  notes: string;
  content?: Content;
}

/**
 * Canonical Franchise Module Contract
 * Defines the standard shape of a self-contained franchise data file
 * (e.g., src/data/franchises/<slug>.ts).
 */
export interface FranchiseModule {
  franchise: Franchise;
  content: Content[];
  watchOrders: WatchOrder[];
  releaseOrder?: WatchOrder[];
  chronologicalOrder?: WatchOrder[];
  recommendedOrder?: WatchOrder[];
}

// ─── User / Profile ─────────────────────────────────────────

export type AccountType = 'EMAIL' | 'USERNAME_ONLY';

export interface Profile {
  id: string; // immutable user_id (UUID)
  username: string;
  username_normalized: string;
  account_type: AccountType;
  email: string | null;
  display_name: string;
  avatar_url: string;
  spoiler_free_mode: boolean;
  is_admin: boolean;
  public_profile: boolean;
  show_favorite_movies: boolean;
  show_ratings: boolean;
  show_reviews: boolean;
  show_recommendations: boolean;
  show_stats: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PublicProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  account_type: AccountType;
  public_profile: boolean;
  privacy: {
    show_favorite_movies: boolean;
    show_ratings: boolean;
    show_reviews: boolean;
    show_recommendations: boolean;
    show_stats: boolean;
  };
  favorite_movies?: Array<{ id: string; title: string; poster_url: string; franchise_id: string }>;
  ratings?: Array<{ content_id: string; rating: number }>;
  reviews?: Array<{ id: string; content_id: string; review_text: string }>;
  recommendations?: Array<{ title: string; reason: string }>;
  top_genres?: string[];
  stats?: {
    total_watched: number;
    hours_watched: number;
    favorite_genre: string;
  };
}

// ─── Watch History ──────────────────────────────────────────

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  content_id: string;
  watched: boolean;
  watched_at: string | null;
}

// ─── Favorites ──────────────────────────────────────────────

export interface Favorite {
  id: string;
  user_id: string;
  franchise_id: string;
  created_at: string;
  franchise?: Franchise;
}

// ─── Ratings ────────────────────────────────────────────────

export interface UserRating {
  id: string;
  user_id: string;
  content_id: string;
  rating: number;
  created_at: string;
}

// ─── Search ─────────────────────────────────────────────────

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
}

// ─── Achievement ────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  stars?: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

// ─── Streaming Provider ─────────────────────────────────────

export interface StreamingProvider {
  id: string;
  content_id: string;
  provider_name: string;
  provider_logo: string;
  url: string;
  country: string;
}

// ─── Franchise Progress ─────────────────────────────────────

export interface FranchiseProgress {
  franchise: Franchise;
  totalItems: number;
  watchedItems: number;
  percentage: number;
}

// ─── User Analytics ─────────────────────────────────────────

export interface UserAnalytics {
  totalHoursWatched: number;
  totalMoviesWatched: number;
  totalSeriesWatched: number;
  totalSeasonsWatched: number;
  longestStreakDays: number;
  currentStreakDays: number;
  franchisesStarted: number;
  franchisesCompleted: number;
  averageRating: number;
  favoriteGenre: string;
  monthlyWatchTime: { month: string; hours: number }[];
}

// ─── Timeline Node ──────────────────────────────────────────

export interface TimelineNode {
  id: string;
  content: Content;
  position: number;
  connections: string[]; // content IDs this connects to
  year: string;
  era?: string;
  isWatched: boolean;
}

// ─── Filter State ───────────────────────────────────────────

export interface FilterState {
  types: ContentType[];
  canon: 'all' | 'canon' | 'non-canon';
  required: 'all' | 'required' | 'optional';
}
