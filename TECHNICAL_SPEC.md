# CrisisPM Platform - Technical Specification

## Executive Summary

**Product:** AI-powered PM crisis training platform  
**Core Function:** Daily crisis scenarios + expert AI assessment  
**Business Model:** Freemium SaaS ($0 → $19 → $99/user)  
**Tech Stack:** Next.js + Firebase + Groq AI  

## System Requirements

### Core Features
1. **User Management:** Auth, profiles, subscriptions
2. **Crisis Engine:** Generate scenarios, collect responses, score with AI
3. **Analytics:** Progress tracking, learning insights
4. **Notifications:** Email delivery, mobile alerts

### Performance Targets
- **Latency:** <2s crisis generation, <3s AI assessment
- **Scale:** 10,000 concurrent users
- **Availability:** 99.9% uptime
- **Mobile:** Full responsive design

## Architecture

### Stack Decisions
```
Frontend:  Next.js 15 + TypeScript + Tailwind
Backend:   Supabase (Auth + PostgreSQL + Edge Functions)
AI:        Groq Llama-3.1-70b + Claude-3.5-Sonnet
Payments:  Stripe
Email:     SendGrid
Deploy:    Vercel
```

### System Flow
```
User → Next.js App → Supabase Auth → PostgreSQL → Edge Function → Groq API → Response
```

## Database Schema (PostgreSQL)

### SQL Tables
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription VARCHAR(20) DEFAULT 'free' CHECK (subscription IN ('free', 'pro', 'corporate')),
  subscription_end TIMESTAMP,
  total_crises INTEGER DEFAULT 0,
  average_score DECIMAL(5,2) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  categories TEXT[] DEFAULT '{}',
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crisis scenarios table
CREATE TABLE crisis_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL CHECK (category IN (
    'technical', 'business', 'resource', 'team', 'market', 'regulatory',
    'financial', 'strategic', 'operational', 'communication', 'quality',
    'international', 'innovation'
  )),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  template_id VARCHAR(50) NOT NULL,
  industry VARCHAR(20) CHECK (industry IN ('tech', 'healthcare', 'finance', 'retail')),
  company_size VARCHAR(20) CHECK (company_size IN ('startup', 'midsize', 'enterprise')),
  severity VARCHAR(20) CHECK (severity IN ('minor', 'major', 'critical')),
  timeline VARCHAR(20) CHECK (timeline IN ('hours', 'days', 'weeks')),
  stakeholder_type VARCHAR(20) CHECK (stakeholder_type IN ('internal', 'external', 'regulatory', 'mixed')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL,
  stakeholders TEXT NOT NULL,
  time_pressure TEXT NOT NULL,
  expert_solution TEXT NOT NULL,
  assessment_criteria JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User responses table  
CREATE TABLE user_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES crisis_scenarios(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 100),
  strategy_score INTEGER CHECK (strategy_score >= 0 AND strategy_score <= 25),
  communication_score INTEGER CHECK (communication_score >= 0 AND communication_score <= 25),
  leadership_score INTEGER CHECK (leadership_score >= 0 AND leadership_score <= 25),
  execution_score INTEGER CHECK (execution_score >= 0 AND execution_score <= 25),
  feedback TEXT,
  improvements TEXT[],
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription);
CREATE INDEX idx_scenarios_category ON crisis_scenarios(category);
CREATE INDEX idx_scenarios_difficulty ON crisis_scenarios(difficulty);
CREATE INDEX idx_scenarios_variables ON crisis_scenarios(industry, company_size, severity, timeline);
CREATE INDEX idx_responses_user_id ON user_responses(user_id);
CREATE INDEX idx_responses_scenario_id ON user_responses(scenario_id);
CREATE INDEX idx_responses_submitted_at ON user_responses(submitted_at);
```

### TypeScript Interfaces (Generated from SQL)
```typescript
interface User {
  id: string
  email: string
  subscription: 'free' | 'pro' | 'corporate'
  subscription_end: string | null
  total_crises: number
  average_score: number
  streak_days: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  categories: string[]
  email_notifications: boolean
  created_at: string
  updated_at: string
}

interface CrisisScenario {
  id: string
  category: string
  difficulty: string
  template_id: string
  industry: string
  company_size: string
  severity: string
  timeline: string
  stakeholder_type: string
  title: string
  description: string
  context: string
  stakeholders: string
  time_pressure: string
  expert_solution: string
  assessment_criteria: AssessmentCriteria
  created_at: string
}

interface UserResponse {
  id: string
  user_id: string
  scenario_id: string
  response: string
  total_score: number
  strategy_score: number
  communication_score: number
  leadership_score: number
  execution_score: number
  feedback: string
  improvements: string[]
  submitted_at: string
}
```

## Scenario Generation System

### Algorithmic Generation (44,928 Unique Scenarios)
**Mathematics:** 
- 13 categories × 8 templates per category × 432 variable combinations = **44,928 unique scenarios**

**Variable Combinations:**
- Industry (4) × Company Size (3) × Severity (3) × Timeline (3) × Stakeholders (4) = **432 combinations per template**

**13 Categories:**
1. **Technical** - System failures, security breaches, data loss
2. **Business** - Competitor threats, market changes, partnerships
3. **Resource** - Budget cuts, staff departures, capacity limits  
4. **Team** - Burnout, conflicts, skill gaps, performance
5. **Market** - Customer complaints, product failures, regulations
6. **Regulatory/Compliance** - Legal issues, audits, policy violations
7. **Financial** - Cash flow, investor relations, budget overruns
8. **Strategic** - Pivot decisions, market positioning, competitive threats
9. **Operational** - Supply chain, vendor issues, process breakdowns
10. **Communication** - PR crises, internal conflicts, stakeholder management
11. **Quality** - Product defects, customer complaints, reputation damage
12. **International** - Cultural issues, global expansion challenges
13. **Innovation** - R&D failures, patent disputes, technology pivots

**Template Example:**
```typescript
const budgetCrisisTemplate = {
  title: "${severity} Budget Crisis at ${companySize} ${industry} Company",
  description: "Available funding reduced by ${severity}%, must decide within ${timeline}...",
  variables: { industry, companySize, severity, timeline, stakeholders }
}
```

## AI Assessment System

### Primary Engine: Groq Llama-3.1-70b-Versatile
**Why:** GPT-4 level intelligence, 50-100 tokens/sec, $0.59/1M tokens

### Assessment Process
1. **Template Scoring:** Keyword matching + structure analysis (40% weight)
2. **AI Evaluation:** Semantic analysis + expert comparison (60% weight)
3. **Multi-dimensional:** Strategy, Communication, Leadership, Execution
4. **Feedback Generation:** Specific improvements + strengths

### Prompt Engineering
```typescript
const assessmentPrompt = `
You are a Harvard Business School professor grading PM crisis responses.

SCENARIO: ${scenario}
STUDENT RESPONSE: ${response}

Grade using 4 dimensions (0-25 points each):
- Strategy: Root cause analysis, solution quality
- Communication: Stakeholder messaging, clarity
- Leadership: Decision-making, team management
- Execution: Timeline, resource allocation

Format:
SCORE: __/100
BREAKDOWN: Strategy __/25, Communication __/25, Leadership __/25, Execution __/25
FEEDBACK: [Specific strengths and improvements]
`
```

## Security & Compliance

### Authentication
- Supabase Auth with email/password + Google OAuth
- JWT tokens for API access
- Row Level Security (RLS) for data isolation

### Data Protection
- PostgreSQL RLS policies enforce user data ownership
- Input validation with Zod schemas
- GDPR compliance (built-in data export/deletion)

### Row Level Security Policies
```sql
-- Users can only access their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users FOR ALL USING (auth.uid() = id);

-- Users can only see their own responses
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own responses" ON user_responses FOR ALL USING (auth.uid() = user_id);

-- Crisis scenarios are public (read-only for users)
ALTER TABLE crisis_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view scenarios" ON crisis_scenarios FOR SELECT USING (true);
```

### Rate Limiting
- Supabase Edge Functions: 1000 req/min per user
- AI API: Cached responses, fallback to template scoring
- Stripe webhook validation

## Cost Analysis

### Monthly Operating Costs (1000 users)
```
Vercel Hosting:     $0
Supabase:           $25 (Pro plan: unlimited API requests, 8GB database)
Groq API:           $50 (1M tokens @ $0.59)
SendGrid:           $15 (email notifications)
Stripe:             3% of revenue
Domain:             $1/month

Total Fixed Costs:  $91/month
```

### Revenue Model
```
Free Tier:     1 crisis/week (limited AI feedback)
Pro Tier:      $19/month (daily crises, full AI assessment)
Corporate:     $99/user/month (custom scenarios, team features)

Break-even:    4 paid users
Target:        10% conversion (100 paid users = $1,900/month)
Profit:        $1,834/month (96% margin)
```

## Development Roadmap

### Phase 1: MVP (2 weeks)
**Core Features:**
- User auth and basic profile
- Crisis display and response submission
- Template-based scoring
- Basic analytics dashboard

**Deliverables:**
- Working Next.js app
- Firebase integration
- Basic UI/UX

### Phase 2: AI Integration (1 week)
**AI Features:**
- Groq API integration
- Advanced assessment scoring
- Detailed feedback generation

### Phase 3: Production (1 week)
**Launch Features:**
- Email notifications
- Stripe subscription management
- Performance optimization
- Security hardening

### Phase 4: Growth Features
**Advanced Features:**
- Mobile app (React Native)
- Team collaboration
- Custom corporate scenarios
- Advanced analytics

## Technical Implementation

### File Structure
```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Login/signup
│   ├── dashboard/         # User dashboard
│   ├── crisis/           # Crisis scenarios
│   └── api/              # API routes
├── components/           # React components
├── lib/                  # Utilities
│   ├── firebase.ts      # Firebase config
│   ├── groq.ts          # AI API client
│   └── stripe.ts        # Payment processing
└── types/               # TypeScript definitions
```

### Key APIs
```typescript
// Crisis Generation
POST /api/crisis/generate
Body: { userId, difficulty, category }
Response: { scenarioId, content }

// Response Submission
POST /api/response/submit
Body: { scenarioId, response }
Response: { assessment, score }

// User Analytics
GET /api/user/stats
Response: { totalCrises, averageScore, streakDays }
```

## Quality Assurance

### Testing Strategy
- **Unit Tests:** Jest for utilities and components
- **Integration Tests:** Firebase emulator testing
- **E2E Tests:** Playwright for user journeys
- **Load Tests:** Artillery for performance

### Performance Monitoring
- Vercel Analytics for Core Web Vitals
- Firebase Performance Monitoring
- Sentry for error tracking
- Custom metrics for AI response times

## Deployment & DevOps

### CI/CD Pipeline
```
GitHub → Vercel (auto-deploy) → Production
│
├── Pull Request → Preview deployment
├── Main branch → Production deployment
└── Database migrations → Manual approval
```

### Environment Management
- Development: Local Firebase emulators
- Staging: Firebase staging project
- Production: Firebase production project

## Success Metrics

### Technical KPIs
- Page load time <2s (P95)
- AI response time <3s (P95)
- 99.9% uptime
- <1% error rate

### Business KPIs
- Monthly Active Users
- Conversion rate (free → paid)
- User retention (7-day, 30-day)
- Average session duration

### Quality KPIs
- User satisfaction score (NPS)
- Crisis completion rate
- Average assessment score improvement

---

## Implementation Priority

**Week 1-2:** Core platform (auth, crisis display, basic scoring)
**Week 3:** AI integration and advanced assessment
**Week 4:** Payment system and launch preparation
**Month 2+:** Growth features and optimization

**Total Development Time:** 4 weeks to MVP launch
**Team Required:** 1 full-stack developer (you) + AI integration
**Launch Target:** 100 beta users, 10 paying customers within 60 days