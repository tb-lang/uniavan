
-- ============================================
-- 1. TABLES
-- ============================================

-- Users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  age integer,
  course text,
  period text,
  bio text,
  instagram text,
  interests text[] DEFAULT '{}',
  photos text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  vacation_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Likes table
CREATE TABLE public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'dislike', 'superlike')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (from_user_id, to_user_id)
);

-- Matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user2_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user1_id, user2_id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Blocked users table
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

-- Reports table
CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. TRIGGER: Auto-match on like
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user1 uuid;
  v_user2 uuid;
BEGIN
  -- Only process likes and superlikes
  IF NEW.type NOT IN ('like', 'superlike') THEN
    RETURN NEW;
  END IF;

  -- Check for reciprocal like
  IF EXISTS (
    SELECT 1 FROM public.likes
    WHERE from_user_id = NEW.to_user_id
      AND to_user_id = NEW.from_user_id
      AND type IN ('like', 'superlike')
  ) THEN
    -- Order UUIDs for consistency
    IF NEW.from_user_id < NEW.to_user_id THEN
      v_user1 := NEW.from_user_id;
      v_user2 := NEW.to_user_id;
    ELSE
      v_user1 := NEW.to_user_id;
      v_user2 := NEW.from_user_id;
    END IF;

    -- Insert match if not exists
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (v_user1, v_user2)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_like();

-- ============================================
-- 3. RLS POLICIES
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper function to check if blocked
CREATE OR REPLACE FUNCTION public.is_blocked(checker_id uuid, target_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_id = checker_id AND blocked_id = target_id)
       OR (blocker_id = target_id AND blocked_id = checker_id)
  );
$$;

-- USERS policies
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view active non-blocked profiles"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND vacation_mode = false
    AND id != auth.uid()
    AND NOT public.is_blocked(auth.uid(), id)
  );

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- LIKES policies
CREATE POLICY "Users can insert own likes"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (from_user_id = auth.uid());

CREATE POLICY "Users can view own likes"
  ON public.likes FOR SELECT
  TO authenticated
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- MATCHES policies
CREATE POLICY "Users can view own matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- MESSAGES policies
CREATE POLICY "Users can view messages in own matches"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own matches"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- BLOCKED_USERS policies
CREATE POLICY "Users can block others"
  ON public.blocked_users FOR INSERT
  TO authenticated
  WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can view own blocks"
  ON public.blocked_users FOR SELECT
  TO authenticated
  USING (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others"
  ON public.blocked_users FOR DELETE
  TO authenticated
  USING (blocker_id = auth.uid());

-- REPORTS policies
CREATE POLICY "Users can report others"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- ============================================
-- 4. SQL FUNCTIONS (RPC)
-- ============================================

CREATE OR REPLACE FUNCTION public.get_discover_profiles()
RETURNS SETOF public.users
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.* FROM public.users u
  WHERE u.id != auth.uid()
    AND u.is_active = true
    AND u.vacation_mode = false
    -- Exclude already liked/disliked
    AND NOT EXISTS (
      SELECT 1 FROM public.likes l
      WHERE l.from_user_id = auth.uid() AND l.to_user_id = u.id
    )
    -- Exclude blocked in both directions
    AND NOT public.is_blocked(auth.uid(), u.id)
  ORDER BY random()
  LIMIT 20;
$$;

CREATE OR REPLACE FUNCTION public.get_match_with_profile(p_match_id uuid)
RETURNS TABLE (
  match_id uuid,
  matched_at timestamptz,
  user_id uuid,
  name text,
  age integer,
  course text,
  period text,
  bio text,
  instagram text,
  interests text[],
  photos text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id as match_id,
    m.created_at as matched_at,
    u.id as user_id,
    u.name,
    u.age,
    u.course,
    u.period,
    u.bio,
    u.instagram,
    u.interests,
    u.photos
  FROM public.matches m
  JOIN public.users u ON u.id = CASE
    WHEN m.user1_id = auth.uid() THEN m.user2_id
    ELSE m.user1_id
  END
  WHERE m.id = p_match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid());
$$;

-- ============================================
-- 5. STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 6. REALTIME
-- ============================================

ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.matches REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
