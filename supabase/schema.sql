-- ╔══════════════════════════════════════════════════════════════╗
-- ║  CineOrder — Supabase Database Schema                       ║
-- ║  Run this in Supabase SQL Editor                            ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ─── Enable UUID Extension ──────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ───────────────────────────────────────────────
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  username_normalized TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'EMAIL' CHECK (account_type IN ('EMAIL', 'USERNAME_ONLY')),
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  spoiler_free_mode BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  public_profile BOOLEAN DEFAULT false,
  show_favorite_movies BOOLEAN DEFAULT true,
  show_ratings BOOLEAN DEFAULT true,
  show_reviews BOOLEAN DEFAULT true,
  show_recommendations BOOLEAN DEFAULT true,
  show_stats BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Franchises ─────────────────────────────────────────────
CREATE TABLE public.franchises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  poster_url TEXT DEFAULT '',
  banner_url TEXT DEFAULT '',
  tmdb_collection_id INTEGER,
  total_movies INTEGER DEFAULT 0,
  total_series INTEGER DEFAULT 0,
  total_runtime INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Contents ───────────────────────────────────────────────
CREATE TABLE public.contents (
  id TEXT PRIMARY KEY,
  franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE NOT NULL,
  tmdb_id INTEGER,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'ova', 'short', 'special', 'animated')),
  poster_url TEXT DEFAULT '',
  backdrop_url TEXT DEFAULT '',
  overview TEXT DEFAULT '',
  release_date DATE,
  runtime INTEGER DEFAULT 0,
  episode_count INTEGER,
  season_count INTEGER,
  rating NUMERIC(3,1) DEFAULT 0,
  status TEXT DEFAULT 'released' CHECK (status IN ('released', 'upcoming', 'in_production')),
  genres JSONB DEFAULT '[]',
  director TEXT DEFAULT '',
  cast_members JSONB DEFAULT '[]',
  trailer_url TEXT DEFAULT '',
  is_canon BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Watch Orders ───────────────────────────────────────────
CREATE TABLE public.watch_orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('release', 'chronological', 'recommended')),
  position INTEGER NOT NULL,
  notes TEXT DEFAULT '',
  UNIQUE(franchise_id, content_id, order_type)
);

-- ─── Watch History ──────────────────────────────────────────
CREATE TABLE public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  watched BOOLEAN DEFAULT false,
  watched_at TIMESTAMPTZ,
  UNIQUE(user_id, content_id)
);

-- ─── Favorites ──────────────────────────────────────────────
CREATE TABLE public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  franchise_id TEXT REFERENCES public.franchises(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, franchise_id)
);

-- ─── User Ratings ───────────────────────────────────────────
CREATE TABLE public.user_ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id TEXT REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- ─── Search History ─────────────────────────────────────────
CREATE TABLE public.search_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Achievements ───────────────────────────────────────────
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '',
  criteria TEXT DEFAULT ''
);

-- ─── User Achievements ──────────────────────────────────────
CREATE TABLE public.user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- ─── Streaming Providers ────────────────────────────────────
CREATE TABLE public.streaming_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_id TEXT REFERENCES public.contents(id) ON DELETE CASCADE NOT NULL,
  provider_name TEXT NOT NULL,
  provider_logo TEXT DEFAULT '',
  url TEXT DEFAULT '',
  country TEXT DEFAULT 'US'
);

-- ═════════════════════════════════════════════════════════════
-- ║  Row Level Security (RLS) Policies                       ║
-- ═════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_providers ENABLE ROW LEVEL SECURITY;

-- Public read access for content tables
CREATE POLICY "Public read franchises" ON public.franchises FOR SELECT USING (true);
CREATE POLICY "Public read contents" ON public.contents FOR SELECT USING (true);
CREATE POLICY "Public read watch_orders" ON public.watch_orders FOR SELECT USING (true);
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public read streaming_providers" ON public.streaming_providers FOR SELECT USING (true);

-- Profiles: public read for active public profiles, full read/update for owner
CREATE POLICY "Public read active profiles" ON public.profiles FOR SELECT USING (public_profile = true OR auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Watch History: users manage own
CREATE POLICY "Users read own watch_history" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watch_history" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own watch_history" ON public.watch_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own watch_history" ON public.watch_history FOR DELETE USING (auth.uid() = user_id);

-- Favorites: users manage own
CREATE POLICY "Users read own favorites" ON public.favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites" ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- User Ratings: users manage own, public read
CREATE POLICY "Public read ratings" ON public.user_ratings FOR SELECT USING (true);
CREATE POLICY "Users insert own ratings" ON public.user_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ratings" ON public.user_ratings FOR UPDATE USING (auth.uid() = user_id);

-- Search History: users manage own
CREATE POLICY "Users read own search_history" ON public.search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own search_history" ON public.search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own search_history" ON public.search_history FOR DELETE USING (auth.uid() = user_id);

-- User Achievements: users read own
CREATE POLICY "Users read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Admin policies for content management
CREATE POLICY "Admins manage franchises" ON public.franchises FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage contents" ON public.contents FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admins manage watch_orders" ON public.watch_orders FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- ═════════════════════════════════════════════════════════════
-- ║  Indexes                                                  ║
-- ═════════════════════════════════════════════════════════════

CREATE INDEX idx_contents_franchise_id ON public.contents(franchise_id);
CREATE INDEX idx_contents_tmdb_id ON public.contents(tmdb_id);
CREATE INDEX idx_watch_orders_franchise_type ON public.watch_orders(franchise_id, order_type, position);
CREATE INDEX idx_watch_history_user ON public.watch_history(user_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_search_history_user ON public.search_history(user_id, created_at DESC);

-- ═════════════════════════════════════════════════════════════
-- ║  Auto-create profile on signup trigger                    ║
-- ═════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  is_username_only BOOLEAN;
  extracted_username TEXT;
BEGIN
  is_username_only := (NEW.raw_user_meta_data->>'account_type' = 'USERNAME_ONLY') OR (NEW.email LIKE '%@username.cineorder.internal');
  extracted_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (
    id,
    username,
    username_normalized,
    account_type,
    email,
    display_name,
    avatar_url,
    public_profile
  )
  VALUES (
    NEW.id,
    extracted_username,
    LOWER(extracted_username),
    CASE WHEN is_username_only THEN 'USERNAME_ONLY' ELSE 'EMAIL' END,
    CASE WHEN is_username_only THEN NULL ELSE NEW.email END,
    COALESCE(NEW.raw_user_meta_data->>'display_name', extracted_username),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═════════════════════════════════════════════════════════════
-- ║  Seed Achievements                                        ║
-- ═════════════════════════════════════════════════════════════

INSERT INTO public.achievements (id, name, description, icon, criteria) VALUES
  ('first-watch', 'First Watch', 'Mark your first title as watched', '🎬', 'watch_count >= 1'),
  ('franchise-starter', 'Franchise Starter', 'Start watching a franchise', '🚀', 'franchise_started >= 1'),
  ('completionist', 'Completionist', 'Complete an entire franchise', '🏆', 'franchise_completed >= 1'),
  ('binge-watcher', 'Binge Watcher', 'Watch 5 titles in one day', '🔥', 'daily_watch >= 5'),
  ('movie-buff', 'Movie Buff', 'Watch 50 titles total', '🎥', 'watch_count >= 50'),
  ('marathon-runner', 'Marathon Runner', 'Watch 10 titles in one franchise', '🏃', 'franchise_watch >= 10'),
  ('explorer', 'Explorer', 'Start 5 different franchises', '🧭', 'franchise_started >= 5'),
  ('dedicated-fan', 'Dedicated Fan', 'Complete 3 franchises', '⭐', 'franchise_completed >= 3')
ON CONFLICT (id) DO NOTHING;
