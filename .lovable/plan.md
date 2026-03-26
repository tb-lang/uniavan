

# Backend Completo Uniavan Connect + Fix Build Error

## 1. Fix build error in BlockedUsers.tsx
Line 67: `animate={{ opacity: unblocking === user.id ? { opacity: 0 } : { opacity: 1 }, x: 0 }}` has nested objects. Fix to `animate={{ opacity: unblocking === user.id ? 0 : 1, x: 0 }}`.

## 2. Database Migration — Tables + Trigger + RLS + Functions + Storage + Realtime

A single large migration with all SQL:

### Tables
- **users** — linked to `auth.users(id)` (no FK to auth schema, just same UUID pattern), all specified columns
- **likes** — UNIQUE(from_user_id, to_user_id)
- **matches** — UNIQUE(user1_id, user2_id)
- **messages** — FK to matches and users
- **blocked_users** — UNIQUE(blocker_id, blocked_id)
- **reports** — FK to users

### Trigger: Auto-match
- `handle_new_like()` SECURITY DEFINER function — on INSERT to likes, checks reciprocal like/superlike, inserts match with ordered UUIDs

### RLS Policies
All tables get `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` plus policies as specified:
- **users**: SELECT (authenticated, active, not vacation, not blocked), INSERT/UPDATE (own record), plus SELECT own profile always
- **likes**: INSERT (from_user_id = auth.uid()), SELECT (participant)
- **matches**: SELECT only (participant)
- **messages**: SELECT/INSERT (participant of match, sender = auth.uid())
- **blocked_users**: INSERT/SELECT/DELETE (blocker = auth.uid())
- **reports**: INSERT only (reporter = auth.uid())

### SQL Functions (RPC)
- `get_discover_profiles()` — returns up to 20 random active profiles excluding self, already liked, blocked
- `get_match_with_profile(match_id uuid)` — returns match + other user's profile

### Storage
- Create `avatars` bucket (public)
- Policies: public SELECT, INSERT/DELETE restricted to own folder (`auth.uid()` prefix)

### Realtime
- Enable replica identity full on `messages` and `matches`
- Add tables to supabase realtime publication

## 3. Frontend Integration

### Auth hooks/context
- Create `src/hooks/useAuth.ts` with session state, login, signup, logout
- Update `UserContext.tsx` to load profile from Supabase `users` table
- Add `onAuthStateChange` listener

### Update pages
- **Register.tsx** — call `supabase.auth.signUp()` then insert into `users`
- **Login.tsx** — call `supabase.auth.signInWithPassword()`
- **Discover.tsx** — call `supabase.rpc('get_discover_profiles')`, insert likes via `supabase.from('likes').insert()`
- **Matches.tsx** — query matches table with joined profiles
- **Chat.tsx** — query/insert messages with realtime subscription
- **Profile.tsx** — read/update from `users` table
- **EditProfile.tsx** — update `users` + upload photos to `avatars` bucket
- **BlockedUsers.tsx** — CRUD on `blocked_users` table
- **App.tsx** — add auth guards / redirect logic

### Protected routes
- Wrap authenticated routes with auth check, redirect to `/login` if not authenticated

## Technical Notes
- No FK to `auth.users` (Supabase reserved schema) — use same UUID convention
- Trigger function uses SECURITY DEFINER to bypass RLS for match insertion
- Users table needs a policy allowing users to always SELECT their own profile (even if vacation_mode is true)
- Storage policies use `bucket_id = 'avatars'` and path prefix matching with `auth.uid()::text`

