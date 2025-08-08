# CrisisPM Platform - Development Workflow

## 🔄 Standard Workflow (Session-Persistent)

### **Every Development Session Protocol:**

#### 1. **Role Assignment & Context Loading**
```bash
# Claude should always ask: "Which role should I assume?"
# Roles: Product Architect | Full-Stack Developer | Platform Engineer

# Always read these files first:
- ROADMAP.md                    # Current development phase
- TECHNICAL_SPEC.md             # System architecture  
- context7/nextjs-15.md         # Cached Next.js documentation
- DEVELOPMENT_WORKFLOW.md       # This file
```

#### 2. **Git Workflow (MANDATORY for all changes)**
```bash
# Submodule workflow (NEVER skip this):
1. cd docs/pm-practice/crisispm-platform  # Work in submodule
2. git add .                               # Stage changes
3. git commit -m "descriptive message"     # Commit submodule
4. git push origin main                    # Push submodule

# Parent module update (ALWAYS follow submodule push):
5. cd /home/tathienbao/swedish-practice    # Go to parent
6. git add docs/pm-practice/crisispm-platform  # Stage submodule update
7. git commit -m "update submodule: brief description"  # Commit parent
8. git push origin main                    # Push parent
```

#### 3. **Context7 Token Optimization Strategy**
```bash
# ALWAYS check local docs first:
1. Read context7/[technology].md files BEFORE using Context7 API
2. Only use Context7 when local docs insufficient  
3. Cache new documentation immediately after Context7 calls
4. Update context7/README.md with new cached content

# Current cached documentation:
- context7/nextjs-15.md        # Next.js 15 complete setup guide
- context7/README.md           # Cache management instructions
# TODO: Add Supabase, TypeScript, Tailwind docs
```

## 📋 Project Status Tracking

### **Current Phase: MVP Foundation (Week 1)**
- ✅ Project analysis and documentation review
- ✅ Context7 documentation caching system
- ✅ Package.json with core dependencies  
- ✅ TypeScript configuration (tsconfig.json)
- ⏳ Next.js configuration (next.config.ts)
- ⏳ Project directory structure (src/ folders)
- ⏳ Tailwind CSS setup
- ❌ Supabase integration
- ❌ Authentication system

### **Next Immediate Tasks:**
1. Complete Next.js project structure setup
2. Cache Supabase documentation from Context7
3. Set up database schema and RLS policies  
4. Implement authentication system

## 🛠️ Development Commands Reference

### **Project Setup (Current Phase)**
```bash
cd docs/pm-practice/crisispm-platform

# Install dependencies
npm install

# Development server (when ready)
npm run dev

# Type checking
npx tsc --noEmit

# Linting (when configured)  
npm run lint
```

### **Supabase Commands (Next Phase)**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase
supabase init

# Start local development
supabase start

# Apply database migrations
supabase db push
```

## 📁 Expected Final Project Structure
```
crisispm-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── crisis/           # Crisis scenarios
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── crisis/          # Crisis-specific
│   │   └── auth/            # Auth components
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts     # Supabase config
│   │   ├── groq.ts         # Groq AI client
│   │   └── utils.ts        # General utilities
│   └── types/              # TypeScript definitions
├── context7/               # Cached documentation
├── supabase/              # Supabase configuration
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── DEVELOPMENT_WORKFLOW.md
```

## 🎯 Quality Gates (Definition of Done)

### **Every Feature Must Pass:**
1. ✅ **Layer 1**: Immediate validation (syntax, structure)
2. ✅ **Layer 2**: Environment integration (auth, database)  
3. ✅ **Layer 3**: End-to-end functionality (complete user flows)

### **Code Quality Standards:**
- TypeScript strict mode (no `any` types)
- Zod validation for all external data
- Comprehensive error handling
- Security-first approach (RLS policies)
- Performance optimized (caching, lazy loading)

## 🚨 Critical Reminders

### **Session Recovery Protocol:**
1. Read this file first to understand current state
2. Check git log for recent commits: `git log --oneline -10`
3. Review ROADMAP.md for current phase priorities
4. Use context7/ cached docs instead of API calls
5. Follow git submodule workflow for all changes

### **Token Optimization Rules:**
- ❌ Never use Context7 without checking local cache first
- ✅ Always cache new documentation after Context7 calls
- ✅ Reference local files in explanations: "As per cached Next.js docs..."
- ✅ Update cache when technologies get major updates

### **Professional Standards:**
- All commits use conventional commit format
- No AI co-author credits (keep professional)
- Security-first development (validate all inputs)
- Performance-conscious (optimize bundle size)
- Mobile-first responsive design

## 📚 Knowledge Base

### **Technology Stack:**
- **Frontend**: Next.js 15 + React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + Edge Functions)
- **AI**: Groq Llama-3.1-70b-Versatile + Claude-3.5-Sonnet
- **Payments**: Stripe subscription management
- **Deployment**: Vercel

### **Key Business Context:**
- **Product**: AI-powered PM crisis training platform
- **Business Model**: Freemium SaaS ($0 → $19 → $99/user/month)
- **Unique Value**: 44,928 algorithmic crisis scenarios + expert AI feedback
- **Target**: Individual PMs, Corporate Teams, MBA Students
- **Revenue Goal**: 100 users → 10 paying → $1,834/month profit

---

**🎯 Remember: This file is your source of truth for maintaining development continuity across sessions. Always read it first, update it with new learnings, and commit changes to preserve knowledge for future sessions.**