# Next.js 15 Documentation for CrisisPM Platform

## Overview
Next.js 15 is a React framework for building full-stack web applications. It provides additional features and optimizations like server-side rendering, static site generation, and API routes. This documentation focuses on Next.js 15 integration with React 18, TypeScript, and CrisisPM platform requirements.

## Core Next.js 15 Features

### App Router Architecture
Next.js 15 uses the App Router as the primary routing system, providing:
- File-system based routing
- Server and Client Components
- Nested layouts and templates
- Streaming and Suspense support
- Built-in SEO optimizations

### Key Changes in Next.js 15

#### Asynchronous Request APIs
In Next.js 15, `params` and `searchParams` are now Promises that must be awaited:

```typescript
// Before Next.js 15
export default function Page({ params, searchParams }) {
  const { slug } = params
  const { query } = searchParams
}

// Next.js 15 - Server Components
export default async function Page({ params, searchParams }) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const { slug } = resolvedParams
  const { query } = resolvedSearchParams
}

// Next.js 15 - Client Components with React `use`
'use client'
import { use } from 'react'

export default function Page(props) {
  const params = use(props.params)
  const searchParams = use(props.searchParams)
  const slug = params.slug
  const query = searchParams.query
}
```

## Suspense Boundaries (Critical for CrisisPM)

### useSearchParams with Suspense Boundary
**MANDATORY**: `useSearchParams()` must be wrapped in a Suspense boundary to prevent client-side rendering opt-out:

```typescript
'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Component using useSearchParams
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  // Component logic...
  return (
    <form>
      {/* Login form content */}
    </form>
  )
}

// MANDATORY: Wrap in Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
```

### Why Suspense Boundaries Matter
- **Prevents CSR opt-out**: Without Suspense, entire page renders client-side
- **Performance**: Maintains server-side rendering for better performance
- **User Experience**: Prevents blank page until JavaScript loads

### Streaming with Suspense
Enable granular streaming for better user experience:

```typescript
import { Suspense } from 'react'
import CrisisList from '@/components/CrisisList'
import CrisisListSkeleton from '@/components/CrisisListSkeleton'

export default function Dashboard() {
  return (
    <div>
      {/* Immediate content */}
      <header>
        <h1>Crisis Management Dashboard</h1>
      </header>
      
      {/* Streamed content */}
      <main>
        <Suspense fallback={<CrisisListSkeleton />}>
          <CrisisList />
        </Suspense>
      </main>
    </div>
  )
}
```

## Server vs Client Components

### Server Components (Default)
```typescript
// Server Component - runs on server, supports async/await
async function getCrises() {
  const res = await fetch('https://api.example.com/crises', { cache: 'no-store' })
  return res.json()
}

export default async function CrisesPage() {
  const crises = await getCrises()
  
  return (
    <div>
      {crises.map(crisis => (
        <div key={crisis.id}>{crisis.title}</div>
      ))}
    </div>
  )
}
```

### Client Components
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CrisisForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (data) => {
    setLoading(true)
    // Handle form submission
    router.push('/dashboard')
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  )
}
```

## Navigation and Routing

### App Router File Structure
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── dashboard/
│   ├── layout.tsx     # Dashboard layout
│   ├── page.tsx       # Dashboard page
│   └── crises/
│       ├── page.tsx   # Crises list
│       └── [id]/
│           └── page.tsx # Crisis detail
└── (auth)/
    ├── login/
    │   └── page.tsx   # Login page
    └── signup/
        └── page.tsx   # Signup page
```

### Navigation Hooks
```typescript
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function NavigationComponent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Navigate programmatically
  const handleNavigation = () => {
    router.push('/dashboard')
    router.refresh() // Refresh current route
  }
  
  // Access current path
  console.log('Current path:', pathname)
  
  // Access search parameters (must be wrapped in Suspense)
  const query = searchParams.get('q')
  
  return (
    <div>
      <button onClick={handleNavigation}>Go to Dashboard</button>
    </div>
  )
}
```

## Data Fetching Patterns

### Static Data Fetching (ISG)
```typescript
async function getStaticCrises() {
  const res = await fetch('https://api.example.com/crises', {
    next: { revalidate: 3600 } // Revalidate every hour
  })
  return res.json()
}

export default async function StaticCrisesPage() {
  const crises = await getStaticCrises()
  
  return (
    <div>
      {crises.map(crisis => (
        <article key={crisis.id}>
          <h2>{crisis.title}</h2>
          <p>{crisis.description}</p>
        </article>
      ))}
    </div>
  )
}
```

### Dynamic Data Fetching (SSR)
```typescript
async function getDynamicData() {
  const res = await fetch('https://api.example.com/user-data', { 
    cache: 'no-store' // Ensures fresh data on every request
  })
  return res.json()
}

export default async function DynamicPage() {
  const data = await getDynamicData()
  
  return <div>{data.content}</div>
}
```

### Client-Side Data Fetching
```typescript
'use client'

import { useState, useEffect } from 'react'

export default function ClientDataComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/crises')
      const crises = await res.json()
      setData(crises)
      setLoading(false)
    }
    
    fetchData()
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  )
}
```

## Layouts and Templates

### Root Layout
```typescript
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CrisisPM - Crisis Management Training',
  description: 'AI-powered crisis management training platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">{children}</div>
      </body>
    </html>
  )
}
```

### Nested Layouts
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        {/* Navigation */}
      </nav>
      <main className="content">
        {children}
      </main>
    </div>
  )
}
```

### Dynamic Layouts with Params
```typescript
// app/dashboard/[team]/layout.tsx
export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ team: string }>
}) {
  const { team } = await params
  
  return (
    <section>
      <header>
        <h1>Welcome to {team}'s Dashboard</h1>
      </header>
      <main>{children}</main>
    </section>
  )
}
```

## API Routes (Route Handlers)

### Basic API Route
```typescript
// app/api/crises/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  
  // Fetch data based on category
  const crises = await getCrisesByCategory(category)
  
  return NextResponse.json(crises)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Process the crisis response
  const result = await processCrisisResponse(body)
  
  return NextResponse.json(result)
}
```

### Dynamic API Routes
```typescript
// app/api/crises/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const crisis = await getCrisisById(id)
  
  if (!crisis) {
    return NextResponse.json({ error: 'Crisis not found' }, { status: 404 })
  }
  
  return NextResponse.json(crisis)
}
```

## Middleware

### Authentication Middleware
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Error Handling

### Error Pages
```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>
        Try again
      </button>
    </div>
  )
}
```

### Not Found Pages
```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="not-found">
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  )
}
```

## Loading States

### Loading Pages
```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  )
}
```

### Granular Loading with Suspense
```typescript
import { Suspense } from 'react'
import CrisisCard from '@/components/CrisisCard'

function CrisisCardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>
  )
}

export default function Dashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Suspense fallback={<CrisisCardSkeleton />}>
        <CrisisCard id="1" />
      </Suspense>
      <Suspense fallback={<CrisisCardSkeleton />}>
        <CrisisCard id="2" />
      </Suspense>
    </div>
  )
}
```

## Performance Optimization

### Image Optimization
```typescript
import Image from 'next/image'

export default function CrisisCard({ crisis }) {
  return (
    <div className="crisis-card">
      <Image
        src={crisis.imageUrl}
        alt={crisis.title}
        width={300}
        height={200}
        priority={false}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
      <h3>{crisis.title}</h3>
    </div>
  )
}
```

### Dynamic Imports
```typescript
import dynamic from 'next/dynamic'

// Lazy load heavy components
const CrisisEditor = dynamic(() => import('@/components/CrisisEditor'), {
  loading: () => <p>Loading editor...</p>,
  ssr: false
})

export default function CrisisPage() {
  return (
    <div>
      <h1>Crisis Details</h1>
      <CrisisEditor />
    </div>
  )
}
```

## TypeScript Integration

### Page Props Types
```typescript
interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CrisisPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams.category as string
  
  return <div>Crisis {id} in {category}</div>
}
```

### API Route Types
```typescript
import { NextRequest, NextResponse } from 'next/server'

interface CrisisResponse {
  user_id: string
  scenario_id: string
  response: string
}

export async function POST(request: NextRequest) {
  const body: CrisisResponse = await request.json()
  
  // Type-safe processing
  const result = await processResponse(body)
  
  return NextResponse.json(result)
}
```

## Best Practices for CrisisPM Platform

1. **Suspense Boundaries**: Always wrap `useSearchParams` in Suspense
2. **Server Components**: Use for data fetching and static content
3. **Client Components**: Use for interactivity and state management
4. **Type Safety**: Leverage TypeScript for all components and APIs
5. **Performance**: Implement proper loading states and streaming
6. **Error Handling**: Provide comprehensive error boundaries
7. **SEO**: Use metadata API for search optimization

## CrisisPM-Specific Examples

### Crisis Scenario Page
```typescript
// app/crises/[id]/page.tsx
import { Suspense } from 'react'
import CrisisDetails from '@/components/CrisisDetails'
import ResponseForm from '@/components/ResponseForm'

interface CrisisPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ difficulty?: string }>
}

export default async function CrisisPage({ params, searchParams }: CrisisPageProps) {
  const { id } = await params
  const { difficulty } = await searchParams
  
  return (
    <div className="crisis-container">
      <Suspense fallback={<div>Loading crisis...</div>}>
        <CrisisDetails id={id} difficulty={difficulty} />
      </Suspense>
      
      <Suspense fallback={<div>Loading response form...</div>}>
        <ResponseForm crisisId={id} />
      </Suspense>
    </div>
  )
}
```

### Dashboard with Streaming
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import UserStats from '@/components/UserStats'
import RecentCrises from '@/components/RecentCrises'
import ProgressChart from '@/components/ProgressChart'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Crisis Management Dashboard</h1>
      
      <div className="dashboard-grid">
        <Suspense fallback={<div>Loading stats...</div>}>
          <UserStats />
        </Suspense>
        
        <Suspense fallback={<div>Loading recent crises...</div>}>
          <RecentCrises />
        </Suspense>
        
        <Suspense fallback={<div>Loading progress...</div>}>
          <ProgressChart />
        </Suspense>
      </div>
    </div>
  )
}
```

This Next.js 15 documentation provides comprehensive coverage of the framework's features and patterns specifically tailored for the CrisisPM platform's React 18 and TypeScript integration requirements.