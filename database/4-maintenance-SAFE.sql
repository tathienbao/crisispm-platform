-- ===========================================
-- SAFE MAINTENANCE OPERATIONS - CrisisPM Database
-- ===========================================
-- ⚠️ PRODUCTION-SAFE VERSION: NO DESTRUCTIVE COMMANDS ACTIVE
-- All dangerous operations require explicit uncommenting + confirmation

-- ===========================================
-- 🔒 SAFETY NOTICE
-- ===========================================
-- This file contains DANGEROUS operations that can DELETE ALL USER DATA
-- ALL destructive commands are commented out by default
-- NEVER run uncommented destructive commands on production

-- ===========================================
-- 📊 SAFE OPERATIONS (Always Available)
-- ===========================================

-- Database Statistics (SAFE)
SELECT 'Database Statistics:' as info_type;

SELECT 
  'profiles' as table_name,
  COUNT(*) as record_count
FROM public.profiles
UNION ALL
SELECT 
  'crisis_scenarios' as table_name,
  COUNT(*) as record_count  
FROM public.crisis_scenarios
UNION ALL
SELECT 
  'user_responses' as table_name,
  COUNT(*) as record_count
FROM public.user_responses;

-- Storage usage by table (SAFE)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Recent activity check (SAFE)
SELECT 
  'Recent Profile Activity' as activity_type,
  COUNT(*) as profiles_created_today
FROM public.profiles 
WHERE DATE(created_at) = CURRENT_DATE;

-- ===========================================
-- ⚠️ DANGEROUS OPERATIONS (COMMENTED OUT)
-- ===========================================
-- 🚨 COMPLETE DATABASE RESET (EXTREMELY DANGEROUS)
-- 🚨 ONLY uncomment for development environment reset
-- 🚨 NEVER run on production with real user data

/*
-- ===== STEP 1: CONFIRM YOU WANT TO DELETE EVERYTHING =====
SELECT 'WARNING: Uncommenting this will DELETE ALL USER DATA!' as warning;
SELECT 'Type YES to confirm you understand this will destroy all data:' as confirmation_required;

-- ===== STEP 2: DROP ALL TRIGGERS =====
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- ===== STEP 3: DROP ALL FUNCTIONS =====  
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- ===== STEP 4: DROP ALL TABLES (DESTROYS ALL DATA) =====
DROP TABLE IF EXISTS public.user_responses;
DROP TABLE IF EXISTS public.crisis_scenarios; 
DROP TABLE IF EXISTS public.profiles;

SELECT 'Database completely reset. Run 0-initial-schema.sql to recreate.' as reset_status;
*/

-- ===========================================
-- ⚠️ SELECTIVE DATA CLEANUP (COMMENTED OUT)
-- ===========================================
-- 🚨 These commands will delete user data
-- 🚨 ONLY uncomment for specific cleanup needs

/*
-- Clear all user responses (keeps user profiles)
DELETE FROM public.user_responses;

-- Clear all user profiles (DESTRUCTIVE - removes all users)
DELETE FROM public.profiles;

-- Clear all crisis scenarios (affects app functionality)
DELETE FROM public.crisis_scenarios;

-- Remove only sample/test data
DELETE FROM public.crisis_scenarios WHERE template_id = 'TECH_001';
DELETE FROM public.profiles WHERE email LIKE '%@test.com' OR email LIKE '%@example.com';
*/

-- ===========================================
-- 🔍 DATA EXPORT QUERIES (SAFE)
-- ===========================================
-- Use these to backup data before any cleanup

-- Export user profiles (SAFE - READ ONLY)
-- SELECT * FROM public.profiles ORDER BY created_at;

-- Export crisis scenarios (SAFE - READ ONLY)
-- SELECT * FROM public.crisis_scenarios ORDER BY created_at;

-- Export user responses (SAFE - READ ONLY) 
-- SELECT * FROM public.user_responses ORDER BY submitted_at;

-- ===========================================
-- 🎯 PRODUCTION SAFETY CHECKLIST
-- ===========================================
-- Before running ANY uncommented commands:
-- [ ] Confirm this is development environment
-- [ ] Create manual backup in Supabase dashboard
-- [ ] Verify backup was created successfully
-- [ ] Get explicit approval from project lead
-- [ ] Test restore procedure on staging first
-- [ ] Document what data will be affected
-- [ ] Have rollback plan ready

SELECT 'Maintenance operations completed. No data was modified.' as status;