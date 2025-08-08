# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**CrisisPM** is an AI-powered PM crisis training platform built with Next.js 15, Supabase, and Groq AI. The platform delivers daily crisis scenarios to project managers and provides expert-level AI assessment of their responses.

## Architecture & Tech Stack

### Core Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth + PostgreSQL + Edge Functions)
- **AI Assessment:** Groq Llama-3.1-70b-Versatile + Claude-3.5-Sonnet
- **Payments:** Stripe
- **Deployment:** Vercel

### Key Data Models
```typescript
// Users: subscription tiers and learning progress
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

// Crisis Scenarios: 13 categories × 8 templates × 432 variations = 44,928 unique scenarios
interface CrisisScenario {
  id: string
  category: 'technical' | 'business' | 'resource' | 'team' | 'market' | 
           'regulatory' | 'financial' | 'strategic' | 'operational' | 
           'communication' | 'quality' | 'international' | 'innovation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  template_id: string
  industry: 'tech' | 'healthcare' | 'finance' | 'retail'
  company_size: 'startup' | 'midsize' | 'enterprise'
  severity: 'minor' | 'major' | 'critical'
  timeline: 'hours' | 'days' | 'weeks'
  stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
  title: string
  description: string
  context: string
  stakeholders: string
  time_pressure: string
  expert_solution: string
  assessment_criteria: object
}
```

## Development Commands

### Core Development
```bash
# Project setup
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run build                 # Build for production
npm run lint                  # Run linting

# Testing
npm run test                  # Run all tests
npm run test:unit            # Unit tests only
npm run test:e2e             # End-to-end tests
npm run test:supabase        # Supabase local testing

# Supabase
npx supabase start           # Start local Supabase stack
npx supabase stop            # Stop local Supabase
npx supabase db reset        # Reset local database
npx supabase login           # Authenticate with Supabase
npx supabase db push         # Push schema changes
```

### AI Integration Testing
```bash
# Test AI assessment pipeline
npm run test:ai              # Test Groq API integration
npm run test:scenarios       # Test scenario generation
npm run benchmark:ai         # Performance benchmarks for AI responses
npm run test:supabase:ai     # Test Supabase Edge Functions with AI
```

## Code Architecture

### File Structure
```
src/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Main user dashboard
│   ├── crisis/           # Crisis scenario pages
│   └── api/              # API routes
├── components/           # Reusable React components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── crisis/          # Crisis-specific components
│   └── auth/            # Authentication components
├── lib/                 # Core utilities and configurations
│   ├── supabase.ts     # Supabase configuration
│   ├── groq.ts         # Groq AI client
│   ├── stripe.ts       # Payment processing
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
```

### Key Architectural Patterns

1. **Scenario Generation System**: Template-based with 5 variable dimensions creating 44,928 unique combinations
2. **AI Assessment Pipeline**: Hybrid scoring (template keywords + AI semantic analysis)
3. **Subscription Management**: Freemium model with Stripe integration
4. **Real-time Progress**: Supabase real-time subscriptions for live updates

### Critical Integration Points

- **Groq API**: Primary AI assessment engine, handles 60% of scoring weight
- **Supabase Edge Functions**: Serverless backend for AI processing and webhook handling
- **Stripe Webhooks**: Payment event processing for subscription management
- **Email Notifications**: SendGrid integration for daily crisis delivery

## Development Phases

### Phase 1: MVP Core (Current Priority)
- User authentication and profiles
- Crisis scenario display and response submission
- Basic template-based scoring
- Supabase integration

### Phase 2: AI Integration
- Groq API integration for advanced assessment
- Detailed feedback generation
- Performance optimization

### Phase 3: Production Launch
- Stripe payment integration
- Email notification system
- Security hardening and monitoring

## Performance Requirements

- **Crisis Generation:** <2s response time
- **AI Assessment:** <3s response time
- **Page Load:** <2s (P95)
- **Uptime:** 99.9% availability target

## Security Considerations

- PostgreSQL Row Level Security (RLS) enforces user data isolation
- Input validation using Zod schemas
- Rate limiting on AI API calls via Supabase Edge Functions
- GDPR compliance for user data

## Testing Strategy

- **Unit Tests:** Jest for utilities and business logic
- **Integration Tests:** Supabase local development testing
- **E2E Tests:** Playwright for complete user journeys
- **AI Testing:** Validate assessment accuracy and consistency
- **Database Tests:** SQL schema validation and RLS policy testing

## Business Model Context

- **Free Tier:** 1 crisis/week, basic assessment
- **Pro Tier:** $19/month - daily crises, full AI feedback
- **Corporate Tier:** $99/user/month - team features, custom scenarios

Understanding the subscription tiers is crucial for implementing feature gates and usage tracking throughout the application.