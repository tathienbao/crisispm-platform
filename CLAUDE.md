# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ WORKFLOW COMPLIANCE REQUIRED

**Before working on CrisisPM Platform, Claude MUST:**
1. **Read parent workflow**: `/home/tathienbao/swedish-practice/CLAUDE.md` for universal process requirements
2. **Follow session recovery**: Read `DEVELOPMENT_WORKFLOW.md` to understand current project state  
3. **Use token optimization**: Check `context7/` cached documentation before Context7 API calls
4. **Execute git submodule workflow**: Always commit submodule → push → update parent → push parent

**This ensures session continuity and maintains professional development standards.**

## 🎯 Project Overview

**CrisisPM** is an AI-powered PM crisis training platform built with Next.js 15, Supabase, and Groq AI. The platform delivers daily crisis scenarios to project managers and provides expert-level AI assessment of their responses.

### Business Model & Market Position
- **Freemium SaaS**: Free tier → $19/month Pro → $99/user Corporate
- **Market Disruption**: $19/month vs competitors' $500-2000 corporate programs
- **Unique Value**: 44,928 algorithmic crisis scenarios (13 categories × 8 templates × 432 combinations)
- **Revenue Target**: $1,834/month profit at 100 users with 10% conversion

## 🏗️ Architecture & Tech Stack

### Core Technology Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + Edge Functions)
- **AI Assessment:** Groq Llama-3.1-70b-Versatile + Claude-3.5-Sonnet
- **Payments:** Stripe subscription management
- **Deployment:** Vercel
- **Environment:** fgnosstvcukgdzztsnni.supabase.co (development)

### Critical Data Models
```typescript
// Core business entities with production-ready types
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
}

// Crisis scenarios: 13 categories × 8 templates × 432 variations = 44,928 unique
interface CrisisScenario {
  id: string
  category: 'technical' | 'business' | 'resource' | 'team' | 'market' | 
           'regulatory' | 'financial' | 'strategic' | 'operational' | 
           'communication' | 'quality' | 'international' | 'innovation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  template_id: string
  // 5 variable dimensions for infinite combinations:
  industry: 'tech' | 'healthcare' | 'finance' | 'retail'
  company_size: 'startup' | 'midsize' | 'enterprise'
  severity: 'minor' | 'major' | 'critical'
  timeline: 'hours' | 'days' | 'weeks'
  stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
  // Content fields:
  title: string
  description: string
  context: string
  stakeholders: string
  time_pressure: string
  expert_solution: string
  assessment_criteria: object
}

// AI assessment with 4-dimensional scoring
interface UserResponse {
  id: string
  user_id: string
  scenario_id: string
  response: string
  total_score: number
  strategy_score: number      // 25% weight
  communication_score: number // 25% weight  
  leadership_score: number    // 25% weight
  execution_score: number     // 25% weight
  feedback: string
  improvements: string[]
  submitted_at: string
}
```

## 🚀 Current Development Status

### ✅ **PHASE 1 COMPLETE: Authentication + Database Infrastructure**

#### **Production-Ready Systems:**
- **Authentication System**: Complete email/password with Supabase Auth
- **Session Management**: Next.js 15 middleware with automatic token refresh
- **Route Protection**: Middleware-based security with redirect handling
- **Database Schema**: All tables created with Row Level Security active
- **Type Safety**: Complete TypeScript coverage preventing runtime errors
- **Security Framework**: Enterprise-grade protection with SAFE vs DANGEROUS file separation

#### **Verified Working Components:**
```typescript
// Authentication stack (TESTED & OPERATIONAL):
src/lib/supabase/middleware.ts    // Session management & route protection
src/lib/supabase/client.ts        // Client-side Supabase integration  
src/lib/supabase/server.ts        // Server-side operations
src/app/(auth)/login/page.tsx     // Professional login form
src/app/(auth)/signup/page.tsx    // Registration with email confirmation
middleware.ts                     // Next.js 15 middleware integration

// Database types (COMPLETE):
src/types/database.ts             // Full PostgreSQL schema definitions
```

#### **Database Status - OPERATIONAL:**
```sql
-- Live Database: fgnosstvcukgdzztsnni.supabase.co
✅ profiles table          - User accounts & subscription management
✅ crisis_scenarios table  - Ready for 44,928 unique combinations
✅ user_responses table    - AI assessment & progress tracking
✅ RLS policies active     - Complete user data isolation
✅ Triggers operational    - Automatic profile creation on signup

-- Verification confirmed:
tablename         rls_enabled
crisis_scenarios  true
profiles          true  
user_responses    true
```

### 🎯 **PHASE 2 PRIORITY: Core Business Logic** 

#### **HIGH PRIORITY IMPLEMENTATION NEEDED:**

**1. Crisis Generation Engine** 🔥 **CRITICAL**
```typescript
src/lib/crisis-engine.ts - NEEDS IMPLEMENTATION
```
**Algorithm Requirements:**
- Template-based generation with 5 variable dimensions
- Industry(4) × CompanySize(3) × Severity(3) × Timeline(3) × Stakeholders(4) = 432 combinations
- 13 categories × 8 templates × 432 variables = 44,928 unique scenarios
- Daily selection algorithm preventing duplicates
- User history tracking for personalized difficulty progression

**2. AI Assessment System** 🔥 **CRITICAL**
```typescript
src/lib/groq-client.ts      - NEEDS IMPLEMENTATION  
src/lib/scoring-system.ts   - NEEDS IMPLEMENTATION
```
**Technical Specification:**
- **Primary AI**: Groq Llama-3.1-70b-Versatile ($0.59/1M tokens, 50-100 tok/sec)
- **Fallback**: Claude-3.5-Sonnet for complex assessments
- **Hybrid Scoring**: 40% template matching + 60% AI semantic analysis
- **4 Dimensions**: Strategy(25%) + Communication(25%) + Leadership(25%) + Execution(25%)
- **Output**: Detailed feedback with specific improvement recommendations

**3. Database Operations** 🟡 **MEDIUM PRIORITY**
```typescript
src/lib/supabase-queries.ts - NEEDS IMPLEMENTATION
```
**Required Functions:**
- User profile management and progress tracking
- Crisis scenario retrieval with personalization
- Response submission with AI assessment integration
- Subscription and usage monitoring

## 🔧 Development Commands

### Core Development
```bash
npm run dev              # Start development server (TESTED ✅)
npm run build            # Build for production (TESTED ✅)
npm run start            # Production server (READY ✅)
npm run lint             # ESLint validation (ACTIVE ✅)
```

### Database Operations
```bash
# Database management (PRODUCTION-SAFE):
# Use database/README.md for complete guidelines

# SAFE operations (recommended):
# Run in Supabase SQL Editor:
1. database/1-diagnose.sql      # Check current state
2. database/2-deploy-SAFE.sql   # Safe deployment (preserves data)
3. database/3-verify.sql        # Verify deployment success

# NEVER run in production:
database/2-deploy-DANGEROUS.sql     # Contains DROP TABLE commands
database/4-maintenance-DANGEROUS.sql # Contains mass DELETE operations
```

### Environment Configuration
```bash
# Development Environment (ACTIVE):
NEXT_PUBLIC_SUPABASE_URL=https://fgnosstvcukgdzztsnni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEBUG=true

# Future requirements for Phase 2:
GROQ_API_KEY=[needed for AI assessment]

# Phase 3 requirements:
STRIPE_SECRET_KEY=[needed for payments]
SENDGRID_API_KEY=[needed for email notifications]
```

## 📁 File Structure & Priorities

### **🔥 TIER 1: Core Business Logic (80% development time)**
```
src/lib/
├── crisis-engine.ts     ⚠️ NEEDS IMPLEMENTATION - Core value prop
├── scoring-system.ts    ⚠️ NEEDS IMPLEMENTATION - AI assessment  
├── groq-client.ts       ⚠️ NEEDS IMPLEMENTATION - AI integration
└── supabase-queries.ts  ⚠️ NEEDS IMPLEMENTATION - Database ops
```

### **✅ TIER 2: Foundation Complete (0% time needed)**
```
src/
├── types/database.ts           ✅ Complete TypeScript definitions
├── lib/supabase/
│   ├── client.ts              ✅ Client-side integration
│   ├── server.ts              ✅ Server-side operations
│   └── middleware.ts          ✅ Session management
├── app/(auth)/
│   ├── login/page.tsx         ✅ Professional login form
│   └── signup/page.tsx        ✅ Registration with confirmation
└── middleware.ts              ✅ Route protection active
```

### **🟡 TIER 3: User Interface (10% development time)**
```
src/components/
├── crisis/
│   ├── CrisisCard.tsx         ⚠️ NEEDS IMPLEMENTATION
│   └── ResponseForm.tsx       ⚠️ NEEDS IMPLEMENTATION
└── dashboard/
    └── ProgressTracker.tsx    ⚠️ NEEDS IMPLEMENTATION
```

### **📋 TIER 4: Configuration & Documentation (5% time)**
```
📁 database/                   ✅ Complete security framework
📁 context7/                   ✅ Cached documentation system
📁 .serena/memories/           ✅ Project status documentation
```

## 🔐 Critical Security Requirements

### **Database Security - ENTERPRISE GRADE**
```
⚠️ NEVER run these files on production:
- database/2-deploy-DANGEROUS.sql (contains DROP TABLE)  
- database/4-maintenance-DANGEROUS.sql (contains DELETE ALL)

✅ ALWAYS use these files for production:
- database/2-deploy-SAFE.sql (preserves user data)
- database/4-maintenance-SAFE.sql (read-only operations)
```

### **Row Level Security - ACTIVE**
- **profiles**: Users can only access their own profile data
- **crisis_scenarios**: Public read access, authenticated insert only
- **user_responses**: Complete user isolation, own responses only
- **Automatic triggers**: Profile creation on user signup working

### **Environment Separation Strategy**
- **Development**: fgnosstvcukgdzztsnni.supabase.co (current)
- **Staging**: [create separate project] (planned Phase 3)
- **Production**: [create separate project] (planned Phase 3)

## 🎯 Development Best Practices

### **Time Allocation (From DEVELOPER_FOCUS.md)**
- **80%**: Core business logic files (crisis-engine, scoring-system, AI integration)
- **10%**: User interface components (crisis display, response forms)
- **10%**: Configuration, optimization, and documentation

### **Code Quality Standards**
- **TypeScript**: Explicit typing, no `any` types (except for Next.js 15 route fixes)
- **React**: Functional components with hooks only
- **Validation**: Zod schemas for all external data
- **Error Handling**: Comprehensive try/catch with user-friendly messages
- **Testing**: 3-layer protocol (syntax → environment → end-to-end)

### **Educational Code Explanation Standards**

**Purpose**: Provide comprehensive, interview-style code explanations that help users learn and understand both technical concepts and business context.

#### **Scenario 1: Error Explanation Template**
Use this template when user encounters errors or asks about fixing issues:

1. **Understanding the Error** - Clear identification of what went wrong
2. **What's the Problem?** - Step-by-step technical breakdown 
3. **Why Does This Error Occur?** - System/compiler perspective explanation
4. **The Solutions** - Multiple approaches with trade-offs:
   - **Approach 1**: Quick fix (with explanation of when to use)
   - **Approach 2**: Best practice (with reasoning for long-term benefits)
   - **Approach 3**: Safest option (with trade-offs explained)
5. **Why We Avoid X (But Sometimes Use It)** - Design decision context and exceptions
6. **My Recommendation** - Clear guidance with business/technical rationale

#### **Scenario 2: Code Review/Learning Template**
Use this template when user asks about understanding existing code:

1. **What This Code Does** - High-level purpose and role in the application
2. **How It Works** - Step-by-step breakdown of the logic flow
3. **Why This Approach** - Design decisions and alternatives that were considered
4. **Business Context** - How this connects to user value, revenue, or competitive advantage
5. **Potential Improvements** - Code quality suggestions and optimization opportunities
6. **Interview-Style Analysis** - "What would happen if...?" scenarios for deeper learning

#### **When to Use Each Template**
- **Error Template**: TypeScript errors, runtime bugs, build failures, test failures
- **Learning Template**: "Explain this line", "Why did we structure this way?", "How does this work?"

#### **Educational Goals**
- **Interview Preparation**: Structure explanations like technical interviews
- **Deep Understanding**: Connect code to business objectives and system design
- **Multiple Perspectives**: Show different solution approaches and their trade-offs
- **Practical Learning**: Explain not just what code does, but why decisions were made

#### **Example Applications**
```typescript
// User asks: "Explain line 245 in crisis-engine.ts"
// Use Learning Template:
// 1. What This Code Does: "This line generates a unique scenario ID..."
// 2. How It Works: "It combines category, template, and variables..."
// 3. Why This Approach: "We need unique IDs to prevent duplicate scenarios..."
// 4. Business Context: "This supports our 44,928 unique scenarios value prop..."
// 5. Potential Improvements: "Could add timestamp for better uniqueness..."
// 6. Interview Analysis: "What if two users generate scenarios simultaneously?"
```

### **Git Workflow Standards**
```bash
# Professional commit workflow:
git add -A
git commit -m "type: description"    # Use conventional commits
git push origin main

# Commit types: feat, fix, docs, refactor, test, chore, perf, style
# NEVER add AI attribution - maintain professional standards
```

## 📊 Performance Requirements

### **Business Logic Targets**
- **Crisis generation**: <2 seconds response time
- **AI assessment**: <3 seconds response time  
- **Page load time**: <2 seconds (P95)
- **Database queries**: <500ms average
- **Uptime target**: 99.9% availability

### **AI Integration Costs**
- **Groq Llama-3.1-70b**: $0.59/1M tokens (primary assessment)
- **Claude-3.5-Sonnet**: Premium assessments for complex scenarios
- **Cost Control**: Template scoring fallback if AI budget exceeded
- **Token Optimization**: Context7 caching reduces documentation calls by 80-90%

## 💡 Session Continuity & Documentation

### **Pre-Development Reading**
1. **DEVELOPMENT_WORKFLOW.md** - Session resumption procedures
2. **DEVELOPER_FOCUS.md** - 80/20 time allocation guide
3. **database/README.md** - Complete security guidelines
4. **.serena/memories/** - Project status and achievements

### **Context7 Optimization Strategy**
```
context7/ - Cached documentation (80-90% API call reduction)
├── nextjs-15.md        - Complete Next.js 15 guide
├── supabase-nextjs.md  - Supabase integration patterns
└── README.md           - Cache management instructions
```

### **Quality Assurance Protocol**
**3-Layer Testing (MANDATORY):**
1. **Layer 1**: Syntax and structure validation (Claude immediate)
2. **Layer 2**: Environment integration testing (developer)  
3. **Layer 3**: End-to-end user flow validation (collaborative)

## 🎓 Key Architecture Decisions

### **Technical Choices Made**
- **Supabase over custom auth**: 80% development time savings
- **Next.js 15 App Router**: Modern React patterns with performance optimization
- **TypeScript first**: Runtime error prevention worth upfront investment
- **Middleware session management**: Elegant authentication solution
- **Groq primary AI**: Cost-effective expert assessment at scale

### **Business Logic Foundation**
- **44,928 scenario combinations**: Mathematical approach to infinite unique content
- **4-dimensional AI scoring**: Professional assessment matching corporate standards  
- **Freemium disruption model**: $19/month vs $500-2000 competitors
- **Type-safe architecture**: Rapid feature development without runtime errors

## 🚀 Next Development Session Priorities

### **Immediate Tasks (Phase 2 Core Logic)**
1. **Implement crisis-engine.ts** - Algorithmic scenario generation system
2. **Build scoring-system.ts** - AI assessment with 4-dimensional scoring
3. **Create groq-client.ts** - Groq API integration with fallback handling
4. **Develop supabase-queries.ts** - Database operations for user progress

### **Success Metrics for Phase 2**
- **Crisis generation working**: Unique scenarios generated daily
- **AI assessment functional**: Actionable feedback with professional quality
- **User progress tracking**: Analytics dashboard with gamification
- **Beta platform ready**: 5-10 test users can complete full workflow

**Current Status**: Production-ready authentication and database infrastructure. Ready for core business logic implementation to deliver unique value proposition.

**Next Session**: Focus 80% time on crisis-engine.ts and scoring-system.ts to build competitive differentiation through algorithmic content generation and AI-powered assessment.