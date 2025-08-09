-- ===========================================
-- CLEAN DEPLOYMENT - CrisisPM Database Schema
-- ===========================================
-- This script safely handles existing objects and deploys fresh schema

-- Clean up existing objects (safe - only if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_updated_at();

-- Drop tables (safe - only if they exist)
DROP TABLE IF EXISTS public.user_responses;
DROP TABLE IF EXISTS public.crisis_scenarios;
DROP TABLE IF EXISTS public.profiles;

-- ===========================================
-- 1. PROFILES TABLE
-- ===========================================
CREATE TABLE public.profiles (
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

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ===========================================
-- 2. CRISIS SCENARIOS TABLE
-- ===========================================
CREATE TABLE public.crisis_scenarios (
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

-- Enable RLS on crisis_scenarios table
ALTER TABLE public.crisis_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policy for crisis_scenarios (public read access)
CREATE POLICY "Anyone can view crisis scenarios"
  ON public.crisis_scenarios FOR SELECT
  USING (true);

-- Only authenticated users can insert scenarios (for admin/system use)
CREATE POLICY "Authenticated users can insert scenarios"
  ON public.crisis_scenarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===========================================
-- 3. USER RESPONSES TABLE
-- ===========================================
CREATE TABLE public.user_responses (
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

-- Enable RLS on user_responses table
ALTER TABLE public.user_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_responses
CREATE POLICY "Users can view own responses"
  ON public.user_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON public.user_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own responses"
  ON public.user_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================================
-- 4. INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription);
CREATE INDEX idx_crisis_scenarios_category ON public.crisis_scenarios(category);
CREATE INDEX idx_crisis_scenarios_difficulty ON public.crisis_scenarios(difficulty);
CREATE INDEX idx_crisis_scenarios_variables ON public.crisis_scenarios(industry, company_size, severity, timeline);
CREATE INDEX idx_user_responses_user_id ON public.user_responses(user_id);
CREATE INDEX idx_user_responses_scenario_id ON public.user_responses(scenario_id);
CREATE INDEX idx_user_responses_submitted_at ON public.user_responses(submitted_at DESC);

-- ===========================================
-- 5. FUNCTIONS AND TRIGGERS
-- ===========================================
-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- 6. SEED DATA (Sample Crisis Scenario)
-- ===========================================
INSERT INTO public.crisis_scenarios (
  category,
  difficulty,
  template_id,
  industry,
  company_size,
  severity,
  timeline,
  stakeholder_type,
  title,
  description,
  context,
  stakeholders,
  time_pressure,
  expert_solution,
  assessment_criteria
) VALUES (
  'technical',
  'intermediate',
  'TECH_001',
  'tech',
  'startup',
  'major',
  'hours',
  'mixed',
  'Critical Production Database Failure at Growing Tech Startup',
  'Your primary PostgreSQL database has crashed during peak traffic hours, affecting 80% of user functionality. The backup systems are showing inconsistent data, and your team of 3 engineers is overwhelmed. Customer complaints are flooding in, and the CEO is demanding immediate answers.',
  'Growing SaaS platform with 50,000 active users, recently secured Series A funding. Database has been showing performance issues for weeks but immediate fixes were delayed due to feature development pressure.',
  'Internal: Engineering team, DevOps, CEO, Customer Support. External: Customers, potential investors monitoring uptime.',
  'Peak traffic period - every minute offline costs an estimated $500 in lost revenue and user trust. Social media mentions increasing.',
  'Immediate: Implement emergency read-only mode using secondary database. Communicate transparently with users about estimated recovery time. Medium-term: Root cause analysis, infrastructure upgrade plan, and prevention strategy.',
  '{
    "strategy_keywords": ["emergency", "backup", "read-only", "root cause", "prevention"],
    "communication_keywords": ["transparent", "users", "timeline", "updates"],
    "leadership_keywords": ["team coordination", "prioritization", "decision making"],
    "execution_keywords": ["immediate action", "monitoring", "recovery plan"]
  }'
);

-- ===========================================
-- DEPLOYMENT COMPLETE
-- ===========================================
SELECT 'Schema deployed successfully! Run verify-schema.sql to confirm.' as deployment_status;