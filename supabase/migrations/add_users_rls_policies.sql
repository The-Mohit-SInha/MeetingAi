-- ============================================================================
-- Row Level Security (RLS) Policies for Users Table
-- ============================================================================
-- These policies fix the loading screen issue by allowing users to read
-- and upsert their own profile data.
--
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard: https://app.supabase.com/
-- 2. Navigate to: SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
--
-- WHAT THIS DOES:
-- - Allows users to SELECT their own profile (fixes DB verification check)
-- - Allows users to INSERT/UPDATE their own profile (fixes email/password signup)
-- - Prevents users from accessing other users' data
-- ============================================================================

-- Policy 1: Allow users to read their own profile
-- This fixes the database verification check in AuthContext.tsx
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Allow users to insert/update their own profile
-- This fixes email/password signups that need to create a users table row
CREATE POLICY "Users can upsert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this SQL, verify the policies were created:
--
-- 1. In Supabase Dashboard, go to: Authentication → Policies
-- 2. Select the "users" table
-- 3. You should see three policies:
--    - "Users can read own profile" (SELECT)
--    - "Users can upsert own profile" (INSERT)
--    - "Users can update own profile" (UPDATE)
--
-- Or run this query to check:
-- SELECT * FROM pg_policies WHERE tablename = 'users';
-- ============================================================================

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If policies already exist with these names:
--
-- DROP POLICY "Users can read own profile" ON users;
-- DROP POLICY "Users can upsert own profile" ON users;
-- DROP POLICY "Users can update own profile" ON users;
--
-- Then re-run the CREATE POLICY statements above.
-- ============================================================================
