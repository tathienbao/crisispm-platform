-- ===========================================
-- SCHEMA DIAGNOSTIC - Check Current State
-- ===========================================
-- Run this first to see what's currently in your database

-- 1. Check what tables exist in public schema
SELECT 'Current Tables:' as status;
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check what functions exist
SELECT 'Current Functions:' as status;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 3. Check what triggers exist
SELECT 'Current Triggers:' as status;
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. Check if auth schema is accessible
SELECT 'Auth Schema Check:' as status;
SELECT EXISTS (
  SELECT 1 
  FROM information_schema.schemata 
  WHERE schema_name = 'auth'
) as auth_schema_exists;

-- ===========================================
-- NEXT STEPS BASED ON RESULTS
-- ===========================================
-- If no tables: Run the full supabase-schema.sql
-- If only some tables: Drop and recreate all
-- If trigger error: Tables exist, just re-run selective parts