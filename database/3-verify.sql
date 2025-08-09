-- ===========================================
-- SUPABASE SCHEMA VERIFICATION
-- ===========================================
-- Run this to verify your database is properly set up

-- 1. Check if all tables exist
SELECT 'Tables Created:' as check_type;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY tablename;

-- 2. Check if RLS is enabled
SELECT 'Row Level Security Status:' as check_type;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY tablename;

-- 3. Check if policies exist
SELECT 'RLS Policies Created:' as check_type;
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY tablename, policyname;

-- 4. Check if triggers exist
SELECT 'Triggers Created:' as check_type;
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 5. Check sample data
SELECT 'Sample Crisis Scenario:' as check_type;
SELECT id, category, difficulty, title
FROM public.crisis_scenarios
LIMIT 1;

-- 6. Check if functions exist
SELECT 'Functions Created:' as check_type;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_updated_at')
ORDER BY routine_name;

-- ===========================================
-- EXPECTED RESULTS SUMMARY
-- ===========================================
-- Tables: 3 (profiles, crisis_scenarios, user_responses)
-- RLS Enabled: All 3 tables should show 't'
-- Policies: 6 total (3 for profiles, 2 for crisis_scenarios, 3 for user_responses)
-- Triggers: 2 (on_auth_user_created, on_profiles_updated)
-- Functions: 2 (handle_new_user, handle_updated_at)
-- Sample Data: 1 crisis scenario