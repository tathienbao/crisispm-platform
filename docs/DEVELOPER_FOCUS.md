# 🎯 Developer Focus Guide - CrisisPM Platform

## ⚡ **80-90% Time Investment Files**

### **🔥 TIER 1: Core Business Logic (80% of your time)**

#### **1. Crisis Generation Engine**
```
📁 src/lib/crisis-engine.ts
```
**Business Impact**: Our unique value proposition - 44,928 algorithmic crisis scenarios
**Why Critical**: This IS the product. Generates infinite unique PM crisis situations
**Key Responsibilities**:
- Template-based scenario generation with 5 variable dimensions
- Industry × Company Size × Severity × Timeline × Stakeholder combinations
- Business logic that differentiates us from competitors

#### **2. Database Types & Models**
```
📁 src/types/database.ts
📁 src/lib/validation.ts
```
**Business Impact**: Foundation for entire data architecture
**Why Critical**: Every feature depends on proper data modeling
**Key Responsibilities**:
- User, CrisisScenario, UserResponse TypeScript interfaces
- Zod validation schemas for all external data
- Type safety across the entire application

#### **3. AI Assessment System**
```
📁 src/lib/scoring-system.ts
📁 src/lib/groq-client.ts
```
**Business Impact**: Expert-level feedback that justifies $19-99/month pricing
**Why Critical**: Transforms raw responses into actionable professional development
**Key Responsibilities**:
- Hybrid scoring: 40% template matching + 60% AI semantic analysis
- Groq Llama-3.1-70b integration for advanced assessment
- Multi-dimensional scoring: Strategy/Communication/Leadership/Execution

#### **4. Database Client & Queries**
```
📁 src/lib/supabase.ts
```
**Business Impact**: All user data, scenarios, and responses flow through here
**Why Critical**: Performance and reliability directly impact user experience
**Key Responsibilities**:
- Supabase client configuration and connection management
- Optimized queries for crisis retrieval and user progress tracking
- Row Level Security (RLS) policy implementation

---

### **🟡 TIER 2: User Experience Logic (10% of your time)**

#### **5. Authentication Flow** ✅ **COMPLETED**
```
📁 src/app/(auth)/login/page.tsx
📁 src/app/(auth)/signup/page.tsx
📁 src/lib/supabase/middleware.ts
📁 middleware.ts
```
**Business Impact**: Gateway to our service - no auth, no users
**Why Important**: Conversion from visitor to paying customer
**Current Status**: 
- ✅ Email/password authentication implemented
- ✅ Session management middleware active
- ✅ Route protection and redirect handling
- ✅ Email confirmation flow configured
- ✅ Logout functionality complete

#### **6. Core User Interfaces**
```
📁 src/components/crisis/CrisisCard.tsx
📁 src/components/crisis/ResponseForm.tsx  
📁 src/app/dashboard/page.tsx
```
**Business Impact**: Direct user engagement and retention
**Why Important**: User experience determines subscription renewals
**Focus Areas**:
- Crisis scenario presentation and clarity
- Response submission with rich text support
- Progress tracking and motivation

---

## 🎯 **Daily Development Priority Matrix**

### **Monday - Data Foundation Day**
- **Primary Focus**: `src/types/database.ts` and `src/lib/validation.ts`
- **Goal**: Ensure rock-solid data architecture
- **Success Metric**: All TypeScript interfaces compile without errors

### **Tuesday-Thursday - Core Logic Days**
- **Primary Focus**: `src/lib/crisis-engine.ts` and `src/lib/scoring-system.ts`
- **Goal**: Build and refine business logic algorithms  
- **Success Metric**: Crisis generation and AI assessment work flawlessly

### **Friday - Integration Day**
- **Primary Focus**: `src/lib/supabase.ts` and API testing
- **Goal**: Ensure all systems work together seamlessly
- **Success Metric**: End-to-end user flows complete successfully

---

## 🚨 **Critical Success Rules**

### **The 3 Non-Negotiable Files**
1. **`crisis-engine.ts`** - If this breaks, we have no product
2. **`database.ts`** - If this breaks, nothing works
3. **`scoring-system.ts`** - If this breaks, we have no value

### **Time Allocation Guidelines**
- **80%**: Core business logic files (Tier 1)
- **10%**: User experience files (Tier 2) 
- **10%**: Configuration, testing, and optimization

### **When to Stop and Focus**
If you find yourself spending more than 20% of time on:
- Styling and CSS tweaks
- Configuration file adjustments
- Non-critical UI components

**STOP** and return to Tier 1 files. Visual polish comes after core functionality.

---

## 💡 **Developer Productivity Tips**

### **File Bookmarking Strategy**
Keep these files always open in separate editor tabs:
1. `database.ts` - Reference for all data structures
2. `crisis-engine.ts` - Core algorithm development
3. `scoring-system.ts` - AI integration work
4. `supabase.ts` - Database operations

### **Testing Priority**
Test these files FIRST and MOST FREQUENTLY:
- Crisis generation algorithm accuracy
- Database query performance  
- AI assessment consistency
- Data validation edge cases

### **Code Review Focus**
When reviewing code, spend 90% of attention on:
- Business logic correctness
- Data model consistency
- Performance implications
- Security considerations

---

## 📊 **Business Impact Reminder**

**Remember**: These files directly impact our key metrics:
- **User Retention**: Quality crisis scenarios and helpful feedback
- **Revenue Growth**: Reliable premium features justify pricing
- **Competitive Advantage**: Unique algorithms and AI integration
- **Scalability**: Efficient data models and query performance

**Focus on these files = Focus on business success** 🎯