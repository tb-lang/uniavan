

# Remove Remaining Mock Data — 3 Files

After reviewing the entire codebase, most pages are **already integrated with Supabase** (Discover, Matches, Chat, Profile, EditProfile, BlockedUsers, WhoLikedMe, Login, Register, VacationMode, AppSettings). Only **2 pages** still use mock data, plus the mock file itself.

## Files that still use mock data

1. **`src/pages/UserProfile.tsx`** — imports `MOCK_MATCHES` and `MOCK_PROFILES` from mockData
2. **`src/pages/Notifications.tsx`** — has inline `MOCK_NOTIFICATIONS` array
3. **`src/data/mockData.ts`** — the mock data file (to be deleted)

## Changes

### 1. Rewrite UserProfile.tsx
- Remove mockData import
- Fetch the user profile from Supabase: `supabase.from("users").select("*").eq("id", userId).single()`
- Add loading state with spinner
- Make report/block actions call Supabase (insert into `reports` and `blocked_users`)
- After blocking, navigate back

### 2. Rewrite Notifications.tsx
- Remove `MOCK_NOTIFICATIONS` constant
- Build notifications from real data: query recent matches, recent likes received, and recent unread messages
- Combine into a unified sorted list
- Each notification links to the appropriate screen (chat for messages, user profile for matches/likes)

### 3. Delete `src/data/mockData.ts`
- No other file imports from it after the above changes

### 4. Add RLS policy for messages UPDATE (mark as read)
- Currently the `messages` table has no UPDATE policy, which means `read_at` updates will fail
- Need migration: `CREATE POLICY "Users can mark messages as read" ON messages FOR UPDATE TO authenticated USING (...) WITH CHECK (...)`
- Allow update only where the user is a participant of the match AND is NOT the sender (you mark others' messages as read)

## Technical details
- No new tables or functions needed
- One small migration for the messages UPDATE RLS policy
- UserProfile.tsx will use `useUser()` for the logged-in user ID and `supabase.from("users")` for the viewed profile
- Notifications will be derived from existing tables (no dedicated notifications table)

