-- ===========================================
-- MAINTENANCE OPERATIONS - CrisisPM Database
-- ===========================================
-- This script provides maintenance and cleanup operations

-- ===========================================
-- COMPLETE RESET (USE WITH CAUTION)
-- ===========================================
-- Uncomment the following section to completely reset the database

/*
-- Drop all triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;

-- Drop all functions  
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Drop all tables (in dependency order)
DROP TABLE IF EXISTS public.user_responses;
DROP TABLE IF EXISTS public.crisis_scenarios; 
DROP TABLE IF EXISTS public.profiles;

SELECT 'Database completely reset. Run 2-deploy.sql to recreate.' as reset_status;
*/

-- ===========================================
-- SELECTIVE CLEANUP OPTIONS
-- ===========================================

-- Clear all user data (keep structure)
-- DELETE FROM public.user_responses;
-- DELETE FROM public.profiles;

-- Clear all scenarios (keep structure)
-- DELETE FROM public.crisis_scenarios;

-- Reset sample data only
-- DELETE FROM public.crisis_scenarios WHERE template_id = 'TECH_001';

-- ===========================================
-- BACKUP QUERIES (for data export)
-- ===========================================

-- Export user profiles
-- SELECT * FROM public.profiles;

-- Export scenarios  
-- SELECT * FROM public.crisis_scenarios;

-- Export responses
-- SELECT * FROM public.user_responses;

-- ===========================================
-- DATABASE STATISTICS
-- ===========================================
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

-- Storage usage by table
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'crisis_scenarios', 'user_responses')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;