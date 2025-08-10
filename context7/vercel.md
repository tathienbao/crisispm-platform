# Vercel Deployment Documentation for CrisisPM Platform

## Overview
Vercel is a cloud platform for frontend developers, providing infrastructure to build, deploy, and scale web applications and serverless functions. This documentation covers deploying the CrisisPM Next.js 15 application to Vercel's production environment.

## Project Configuration

### Environment Variables Setup
Based on the CrisisPM architecture, these environment variables are required:

```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://fgnosstvcukgdzztsnni.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Future Integration Variables (Phase 2-3)
GROQ_API_KEY=your_groq_api_key
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key  
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SENDGRID_API_KEY=your_sendgrid_key

# Vercel System Environment Variables (Automatically Available)
VERCEL_ENV=production
VERCEL_URL=crisispm-platform.vercel.app
VERCEL_PROJECT_PRODUCTION_URL=your-domain.com
```

### Next.js Configuration for Vercel
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features for Vercel optimization
  experimental: {
    // Optional: Enable Node.js middleware if needed
    // nodeMiddleware: true,
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all domains for user avatars, etc.
        port: '',
        pathname: '/**',
      }
    ],
    localPatterns: [
      {
        pathname: '/assets/**',
        search: '',
      }
    ]
  },

  // Headers for security and CORS
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
```

### Vercel Project Configuration (vercel.json)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 30
    },
    "app/api/webhooks/**/*.ts": {
      "memory": 512,
      "maxDuration": 10
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Deployment Methods

### Method 1: Git Integration (Recommended)
```bash
# 1. Connect your repository to Vercel
# Visit https://vercel.com/new and import your GitHub repository

# 2. Configure environment variables in Vercel Dashboard
# Settings → Environment Variables → Add each variable

# 3. Automatic deployment on push to main branch
git add .
git commit -m "deploy: production ready"
git push origin main
```

### Method 2: Vercel CLI Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# Deploy with specific regions
vercel --prod --regions iad1
```

### Method 3: GitHub Actions CI/CD
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install Dependencies
        run: npm ci
      
      - name: Build Project
        run: npm run build
      
      - name: Install Vercel CLI
        run: npm install -g vercel@latest
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Build with Vercel
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
        
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Serverless Functions Configuration

### API Routes Optimization
```typescript
// app/api/crises/daily/route.ts - Optimized for Vercel
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Configure function for Vercel
export const runtime = 'nodejs' // or 'edge' for better performance
export const preferredRegion = 'iad1' // East US
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Use environment variables properly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabase = createClient()
    
    // Implementation...
    
    return NextResponse.json({ crisis: dailyCrisis })
  } catch (error) {
    console.error('Vercel Function Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Edge Functions for Performance
```typescript
// app/api/health/route.ts - Edge function example
export const runtime = 'edge'

export function GET() {
  return new Response('CrisisPM API is healthy!', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  })
}
```

## Environment-Specific Configuration

### Using Vercel Environment Variables in Code
```typescript
// lib/config.ts
export const config = {
  env: process.env.VERCEL_ENV || 'development',
  url: process.env.VERCEL_URL || 'localhost:3000',
  productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || 'crisispm.com',
  
  // Environment-specific settings
  database: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  
  ai: {
    groqApiKey: process.env.GROQ_API_KEY,
    enabled: process.env.VERCEL_ENV === 'production',
  },
  
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  features: {
    enableAnalytics: process.env.VERCEL_ENV === 'production',
    enableToolbar: process.env.VERCEL_ENV !== 'production',
  }
}
```

### Conditional Logic Based on Environment
```typescript
// components/Analytics.tsx
'use client'

import { useEffect } from 'react'

export function Analytics() {
  useEffect(() => {
    // Only load analytics in production
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      // Load analytics script
      import('@vercel/analytics/react').then(({ Analytics }) => {
        // Analytics component will auto-initialize
      })
    }
  }, [])

  // Render analytics only in production
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
    return <div id="vercel-analytics" />
  }

  return null
}
```

## Domain Configuration

### Custom Domain Setup
```bash
# Add custom domain through Vercel Dashboard or CLI
vercel domains add crisispm.com
vercel domains add www.crisispm.com

# Configure DNS
# Add CNAME record: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.19.19
```

### Domain Environment Variables
```typescript
// lib/domains.ts
export const getDomainConfig = () => {
  const env = process.env.NEXT_PUBLIC_VERCEL_ENV
  const url = process.env.NEXT_PUBLIC_VERCEL_URL
  const productionUrl = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL
  
  switch (env) {
    case 'production':
      return {
        baseUrl: `https://${productionUrl}`,
        apiUrl: `https://${productionUrl}/api`,
        allowedOrigins: [`https://${productionUrl}`, 'https://www.crisispm.com']
      }
    case 'preview':
      return {
        baseUrl: `https://${url}`,
        apiUrl: `https://${url}/api`,
        allowedOrigins: [`https://${url}`]
      }
    default:
      return {
        baseUrl: 'http://localhost:3000',
        apiUrl: 'http://localhost:3000/api',
        allowedOrigins: ['http://localhost:3000']
      }
  }
}
```

## Performance Optimization

### Build Optimization
```typescript
// next.config.ts - Performance optimizations
const nextConfig: NextConfig = {
  // Bundle analyzer (optional)
  ...(process.env.ANALYZE === 'true' && {
    plugins: [require('@next/bundle-analyzer')({ enabled: true })]
  }),
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Output optimization for Vercel
  output: 'standalone',
  
  // Minimize serverless function size
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
}
```

### Caching Strategy
```typescript
// app/api/crises/[id]/route.ts - With caching
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    // Cache for 5 minutes in production, no cache in development
    const cacheControl = process.env.VERCEL_ENV === 'production' 
      ? 'public, s-maxage=300, stale-while-revalidate=600'
      : 'no-cache'
    
    const crisis = await getCrisisById(id)
    
    return NextResponse.json(crisis, {
      headers: {
        'Cache-Control': cacheControl,
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
```

## Monitoring and Analytics

### Vercel Analytics Integration
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Speed Insights
```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Custom Logging
```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.VERCEL_ENV) {
      console.log(`[${process.env.VERCEL_ENV}] ${message}`, data)
    }
  },
  error: (message: string, error?: any) => {
    console.error(`[${process.env.VERCEL_ENV}] ERROR: ${message}`, error)
    
    // In production, send to external monitoring service
    if (process.env.VERCEL_ENV === 'production') {
      // Send to monitoring service like Sentry, LogRocket, etc.
    }
  }
}
```

## Security Configuration

### Environment Variables Security
```typescript
// lib/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
})

export const env = envSchema.parse(process.env)
```

### Headers and CORS
```typescript
// next.config.ts - Security headers
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://fgnosstvcukgdzztsnni.supabase.co https://api.groq.com https://api.stripe.com;",
          },
        ],
      },
    ]
  },
}
```

## Webhook Configuration for Stripe

### Webhook Endpoint Setup
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!
  
  // Get webhook secret from environment
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  // Webhook processing logic...
  
  return new Response('OK')
}
```

### Vercel Webhook URL Configuration
```bash
# Production webhook URLs for Stripe Dashboard
https://crisispm.com/api/webhooks/stripe

# Preview webhook URLs (for testing)
https://crisispm-platform-git-main.vercel.app/api/webhooks/stripe
```

## Deployment Checklist

### Pre-Deployment Checklist
- [ ] Environment variables configured in Vercel Dashboard
- [ ] Custom domain added and DNS configured
- [ ] SSL certificate verified
- [ ] Database connection tested with production credentials
- [ ] Stripe webhook endpoints updated with production URLs
- [ ] Analytics and monitoring configured
- [ ] Error tracking setup (optional: Sentry integration)

### Post-Deployment Verification
```bash
# Test production deployment
curl https://crisispm.com/api/health
curl https://crisispm.com/api/crises/daily

# Check environment variables
vercel env ls

# View deployment logs
vercel logs https://crisispm.com

# Test webhook endpoints
stripe listen --forward-to https://crisispm.com/api/webhooks/stripe
```

## Troubleshooting Common Issues

### Build Errors
```typescript
// Common Next.js 15 build issues and fixes

// 1. useSearchParams Suspense boundary
// PROBLEM: useSearchParams() should be wrapped in a suspense boundary
// SOLUTION: Already implemented in login/page.tsx

// 2. Environment variable access
// PROBLEM: process.env variables undefined in client components
// SOLUTION: Use NEXT_PUBLIC_ prefix for client-side variables

// 3. API route errors
// PROBLEM: Cannot read property of undefined
// SOLUTION: Proper error handling and null checks
```

### Runtime Errors
```typescript
// lib/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log to external service in production
    if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production') {
      // Send error to monitoring service
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong.</h2>
          <p>The CrisisPM team has been notified.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Cost Optimization

### Function Configuration for Cost
```json
{
  "functions": {
    "app/api/health/route.ts": {
      "memory": 128,
      "maxDuration": 5
    },
    "app/api/crises/**/*.ts": {
      "memory": 512,
      "maxDuration": 10
    },
    "app/api/ai/assess/route.ts": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Edge Functions for Performance
```typescript
// Use Edge runtime for simple operations
export const runtime = 'edge'  // Faster cold starts, lower cost

// Use Node.js runtime for complex operations
export const runtime = 'nodejs'  // Full Node.js API access
```

This Vercel configuration will ensure the CrisisPM platform deploys efficiently with optimal performance, security, and cost management on Vercel's infrastructure.