-- Quick Database Check - Run each query separately
-- Copy and paste each section individually in Supabase SQL Editor

-- ========== CHECK 1: Tables ==========
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY tablename;

-- ========== CHECK 2: Sample Data ==========  
SELECT id, category, title
FROM public.crisis_scenarios
LIMIT 1;

-- ========== CHECK 3: RLS Status ==========
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY tablename;