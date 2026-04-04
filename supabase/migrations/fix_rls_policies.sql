-- ============================================================================
-- Fix RLS Policies for Users Table - Race Condition Fix
-- ============================================================================
-- This fixes the infinite loading screen bug by ensuring proper RLS policies
-- are in place for users to read and write their own data.
--
-- HOW TO APPLY:
-- 1. Go to your Supabase Dashboard: https://app.supabase.com/
-- 2. Navigate to: SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire file
-- 5. Click "Run" to execute
-- ============================================================================

-- Allow users to read their own row
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert/update their own row  
DROP POLICY IF EXISTS "Users can upsert own profile" ON users;
CREATE POLICY "Users can upsert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this SQL, verify the policies were created:
-- Run this query:
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename = 'users';
--
-- Expected output:
-- public | users | Users can read own profile   | SELECT
-- public | users | Users can upsert own profile | INSERT
-- public | users | Users can update own profile | UPDATE
-- ============================================================================
