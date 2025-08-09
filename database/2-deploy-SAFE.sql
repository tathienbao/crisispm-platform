-- ===========================================
-- SAFE DEPLOYMENT - CrisisPM Database Schema
-- ===========================================
-- PRODUCTION-SAFE VERSION: NO DROP TABLE COMMANDS
-- This script safely handles conflicts without destroying data

-- ⚠️ SAFETY FIRST: This script NEVER drops tables with user data
-- For development cleanup, use 4-maintenance.sql with explicit confirmation

-- Clean up functions and triggers safely (these can be recreated)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- ===========================================
-- CREATE TABLES ONLY IF THEY DON'T EXIST
-- ===========================================
-- This approach preserves existing data while ensuring schema exists

-- 1. PROFILES TABLE (CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT NOT NULL,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro', 'corporate')),
  subscription_end TIMESTAMPTZ,
  total_crises INTEGER DEFAULT 0 CHECK (total_crises >= 0),
  average_score DECIMAL(5,2) DEFAULT 0 CHECK (average_score >= 0 AND average_score <= 100),
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  categories TEXT[] DEFAULT '{}',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CRISIS SCENARIOS TABLE (CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.crisis_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN (
    'technical', 'business', 'resource', 'team', 'market', 'regulatory',
    'financial', 'strategic', 'operational', 'communication', 'quality',
    'international', 'innovation'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  template_id TEXT NOT NULL,
  industry TEXT CHECK (industry IN ('tech', 'healthcare', 'finance', 'retail')),
  company_size TEXT CHECK (company_size IN ('startup', 'midsize', 'enterprise')),
  severity TEXT CHECK (severity IN ('minor', 'major', 'critical')),
  timeline TEXT CHECK (timeline IN ('hours', 'days', 'weeks')),
  stakeholder_type TEXT CHECK (stakeholder_type IN ('internal', 'external', 'regulatory', 'mixed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL,
  stakeholders TEXT NOT NULL,
  time_pressure TEXT NOT NULL,
  expert_solution TEXT NOT NULL,
  assessment_criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER RESPONSES TABLE (CREATE IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.user_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.crisis_scenarios(id) ON DELETE CASCADE NOT NULL,
  response TEXT NOT NULL,
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  strategy_score INTEGER CHECK (strategy_score >= 0 AND strategy_score <= 25),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 25),
  leadership_score INTEGER CHECK (leadership_score >= 0 AND leadership_score <= 25),
  execution_score INTEGER CHECK (execution_score >= 0 AND execution_score <= 25),
  feedback TEXT,
  improvements TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY (SAFE TO REPEAT)
-- ===========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crisis_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CREATE POLICIES (DROP IF EXISTS, THEN CREATE)
-- ===========================================
-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Crisis scenarios policies
DROP POLICY IF EXISTS "Anyone can view crisis scenarios" ON public.crisis_scenarios;
CREATE POLICY "Anyone can view crisis scenarios"
  ON public.crisis_scenarios FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert scenarios" ON public.crisis_scenarios;
CREATE POLICY "Authenticated users can insert scenarios"
  ON public.crisis_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User responses policies  
DROP POLICY IF EXISTS "Users can view own responses" ON public.user_responses;
CREATE POLICY "Users can view own responses"
  ON public.user_responses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own responses" ON public.user_responses;
CREATE POLICY "Users can insert own responses"
  ON public.user_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own responses" ON public.user_responses;
CREATE POLICY "Users can update own responses"
  ON public.user_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================================
-- CREATE INDEXES (IF NOT EXISTS)
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription);
CREATE INDEX IF NOT EXISTS idx_crisis_scenarios_category ON public.crisis_scenarios(category);
CREATE INDEX IF NOT EXISTS idx_crisis_scenarios_difficulty ON public.crisis_scenarios(difficulty);
CREATE INDEX IF NOT EXISTS idx_crisis_scenarios_variables ON public.crisis_scenarios(industry, company_size, severity, timeline);
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON public.user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_scenario_id ON public.user_responses(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_submitted_at ON public.user_responses(submitted_at DESC);

-- ===========================================
-- RECREATE FUNCTIONS AND TRIGGERS
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- ADD SAMPLE DATA ONLY IF NONE EXISTS
-- ===========================================
-- Check if sample data already exists before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.crisis_scenarios WHERE template_id = 'TECH_001') THEN
    INSERT INTO public.crisis_scenarios (
      category, difficulty, template_id, industry, company_size, severity, timeline, stakeholder_type,
      title, description, context, stakeholders, time_pressure, expert_solution, assessment_criteria
    ) VALUES (
      'technical', 'intermediate', 'TECH_001', 'tech', 'startup', 'major', 'hours', 'mixed',
      'Critical Production Database Failure at Growing Tech Startup',
      'Your primary PostgreSQL database has crashed during peak traffic hours, affecting 80% of user functionality. The backup systems are showing inconsistent data, and your team of 3 engineers is overwhelmed. Customer complaints are flooding in, and the CEO is demanding immediate answers.',
      'Growing SaaS platform with 50,000 active users, recently secured Series A funding. Database has been showing performance issues for weeks but immediate fixes were delayed due to feature development pressure.',
      'Internal: Engineering team, DevOps, CEO, Customer Support. External: Customers, potential investors monitoring uptime.',
      'Peak traffic period - every minute offline costs an estimated $500 in lost revenue and user trust. Social media mentions increasing.',
      'Immediate: Implement emergency read-only mode using secondary database. Communicate transparently with users about estimated recovery time. Medium-term: Root cause analysis, infrastructure upgrade plan, and prevention strategy.',
      '{"strategy_keywords": ["emergency", "backup", "read-only", "root cause", "prevention"], "communication_keywords": ["transparent", "users", "timeline", "updates"], "leadership_keywords": ["team coordination", "prioritization", "decision making"], "execution_keywords": ["immediate action", "monitoring", "recovery plan"]}'
    );
  END IF;
END $$;

-- ===========================================
-- DEPLOYMENT COMPLETE - SAFE VERSION
-- ===========================================
SELECT 'Safe schema deployment completed. No user data was deleted.' as deployment_status;