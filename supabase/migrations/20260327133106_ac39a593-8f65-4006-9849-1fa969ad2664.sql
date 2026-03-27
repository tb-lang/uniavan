-- 1. Update get_discover_profiles to accept filter params
CREATE OR REPLACE FUNCTION public.get_discover_profiles(
  p_course text DEFAULT NULL,
  p_period text DEFAULT NULL,
  p_min_age integer DEFAULT NULL,
  p_max_age integer DEFAULT NULL
)
RETURNS SETOF users
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT u.* FROM public.users u
  WHERE u.id != auth.uid()
    AND u.is_active = true
    AND u.vacation_mode = false
    AND NOT EXISTS (
      SELECT 1 FROM public.likes l
      WHERE l.from_user_id = auth.uid() AND l.to_user_id = u.id
    )
    AND NOT public.is_blocked(auth.uid(), u.id)
    AND (p_course IS NULL OR u.course = p_course)
    AND (p_period IS NULL OR u.period = p_period)
    AND (p_min_age IS NULL OR u.age >= p_min_age)
    AND (p_max_age IS NULL OR u.age <= p_max_age)
  ORDER BY random()
  LIMIT 20;
$$;

-- 2. Add DELETE policy on matches
CREATE POLICY "Users can delete own matches"
ON public.matches FOR DELETE TO authenticated
USING (user1_id = auth.uid() OR user2_id = auth.uid());