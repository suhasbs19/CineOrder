-- ╔══════════════════════════════════════════════════════════════╗
-- ║  CineOrder — Auth Identity & Public Profile Migration        ║
-- ╚══════════════════════════════════════════════════════════════╝

-- 1. Extend profiles table with account types, normalized username, and privacy controls
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'EMAIL' CHECK (account_type IN ('EMAIL', 'USERNAME_ONLY')),
  ADD COLUMN IF NOT EXISTS username_normalized TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS public_profile BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_favorite_movies BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_ratings BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_recommendations BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_stats BOOLEAN NOT NULL DEFAULT true;

-- 2. Populate username_normalized for existing records
UPDATE public.profiles
SET username_normalized = LOWER(username)
WHERE username_normalized IS NULL;

-- 3. Add UNIQUE constraint and index on username_normalized
ALTER TABLE public.profiles
  ALTER COLUMN username_normalized SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_normalized ON public.profiles(username_normalized);

-- 4. Update RLS policies for profiles to support public profiles and self-edits
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

CREATE POLICY "Public read active profiles" ON public.profiles
  FOR SELECT USING (
    public_profile = true OR auth.uid() = id
  );

CREATE POLICY "Users update own profile settings" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
  );
