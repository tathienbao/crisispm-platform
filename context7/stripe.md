# Stripe Integration Documentation for CrisisPM Platform

## Overview
Stripe is a complete payment processing platform that enables businesses to accept online payments, manage subscriptions, and handle billing operations. This documentation focuses on implementing Stripe subscriptions for the CrisisPM platform's freemium SaaS model.

## CrisisPM Subscription Model

Based on CLAUDE.md, CrisisPM uses a freemium model:
- **Free Tier**: 1 crisis/week + basic assessment = $0/month (acquisition)
- **Pro Tier**: Daily crises + AI feedback = $19/month (conversion)  
- **Corporate**: Team features + custom scenarios = $99/user/month (expansion)

## Installation and Setup

### Environment Configuration
```bash
# .env file
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

### Next.js Integration
```typescript
// lib/stripe.ts - Server-side Stripe client
import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})
```

```typescript
// lib/stripe-client.ts - Client-side Stripe
import { loadStripe } from '@stripe/stripe-js'

let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}
```

## Product and Pricing Setup

### Creating Products and Prices
```typescript
// scripts/setup-stripe-products.ts
import { stripe } from '@/lib/stripe'

async function setupProducts() {
  // Pro Tier Product
  const proProduct = await stripe.products.create({
    name: 'CrisisPM Pro',
    description: 'Daily crisis scenarios with AI assessment feedback',
    metadata: {
      tier: 'pro',
      features: JSON.stringify([
        'Daily crisis scenarios',
        'AI-powered feedback',
        'Progress tracking',
        'All 13 categories',
        'Beginner to Advanced difficulty'
      ])
    }
  })

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: 1900, // $19.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'month'
    },
    metadata: {
      tier: 'pro'
    }
  })

  // Corporate Tier Product  
  const corporateProduct = await stripe.products.create({
    name: 'CrisisPM Corporate',
    description: 'Team features with custom crisis scenarios',
    metadata: {
      tier: 'corporate',
      features: JSON.stringify([
        'Everything in Pro',
        'Team management',
        'Custom scenarios',
        'Analytics dashboard',
        'Priority support'
      ])
    }
  })

  const corporatePrice = await stripe.prices.create({
    product: corporateProduct.id,
    unit_amount: 9900, // $99.00 in cents
    currency: 'usd',
    recurring: {
      interval: 'month'
    },
    metadata: {
      tier: 'corporate'
    }
  })

  console.log('Products created:', {
    pro: { product: proProduct.id, price: proPrice.id },
    corporate: { product: corporateProduct.id, price: corporatePrice.id }
  })
}

setupProducts().catch(console.error)
```

## Checkout Session Creation

### API Route for Checkout Sessions
```typescript
// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

interface CheckoutRequest {
  priceId: string
  tier: 'pro' | 'corporate'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, tier }: CheckoutRequest = await request.json()

    // Get or create Stripe customer
    let stripeCustomerId: string | null = null
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id
        }
      })
      
      stripeCustomerId = customer.id
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?subscription=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        tier: tier
      }
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
    
  } catch (error) {
    console.error('Checkout session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
```

### Frontend Checkout Integration
```typescript
// components/SubscriptionButton.tsx
'use client'

import { useState } from 'react'
import { getStripe } from '@/lib/stripe-client'

interface SubscriptionButtonProps {
  priceId: string
  tier: 'pro' | 'corporate'
  children: React.ReactNode
}

export function SubscriptionButton({ priceId, tier, children }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priceId, tier })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await getStripe()
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
    >
      {loading ? 'Processing...' : children}
    </button>
  )
}
```

## Webhook Handling

### Webhook Endpoint
```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session, supabase)
        break
      }
      
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription, supabase)
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription, supabase)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription, supabase)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice, supabase)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice, supabase)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const userId = session.metadata?.supabase_user_id
  const tier = session.metadata?.tier
  
  if (!userId) return

  await supabase
    .from('profiles')
    .update({
      subscription: tier,
      subscription_end: null, // Active subscription
      stripe_customer_id: session.customer
    })
    .eq('id', userId)
}

async function handleSubscriptionCreated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  const tier = subscription.items.data[0]?.price.metadata?.tier || 'pro'
  
  // Find user by Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        subscription: tier,
        subscription_end: null,
        stripe_subscription_id: subscription.id
      })
      .eq('id', profile.id)
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  const status = subscription.status
  const tier = subscription.items.data[0]?.price.metadata?.tier || 'pro'
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    let updates: any = {
      stripe_subscription_id: subscription.id,
      subscription: status === 'active' ? tier : 'free'
    }
    
    if (status === 'canceled') {
      updates.subscription_end = new Date(subscription.canceled_at! * 1000).toISOString()
    }

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
  }
}

async function handleSubscriptionCancelled(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const customerId = subscription.customer as string
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        subscription: 'free',
        subscription_end: new Date().toISOString()
      })
      .eq('id', profile.id)
  }
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Log successful payments, update billing history
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  // Handle failed payments, send notifications
  console.log('Payment failed for invoice:', invoice.id)
}
```

## Customer Portal Integration

### API Route for Customer Portal
```typescript
// app/api/create-portal-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Portal session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
```

### Customer Portal Button Component
```typescript
// components/CustomerPortalButton.tsx
'use client'

import { useState } from 'react'

export function CustomerPortalButton() {
  const [loading, setLoading] = useState(false)

  const handlePortalAccess = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal access error:', error)
      alert('Failed to access billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePortalAccess}
      disabled={loading}
      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400"
    >
      {loading ? 'Loading...' : 'Manage Billing'}
    </button>
  )
}
```

## Subscription Status Checking

### Middleware for Subscription Check
```typescript
// lib/subscription.ts
import { createClient } from '@/lib/supabase/server'

export type SubscriptionTier = 'free' | 'pro' | 'corporate'

export interface UserSubscription {
  tier: SubscriptionTier
  isActive: boolean
  endDate?: string
}

export async function getUserSubscription(): Promise<UserSubscription | null> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription, subscription_end')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const tier = profile.subscription as SubscriptionTier
  const isActive = tier !== 'free' && (
    !profile.subscription_end || 
    new Date(profile.subscription_end) > new Date()
  )

  return {
    tier,
    isActive,
    endDate: profile.subscription_end
  }
}

export async function requireSubscription(minTier: SubscriptionTier = 'pro') {
  const subscription = await getUserSubscription()
  
  if (!subscription?.isActive) {
    throw new Error('Active subscription required')
  }
  
  const tierHierarchy = { free: 0, pro: 1, corporate: 2 }
  
  if (tierHierarchy[subscription.tier] < tierHierarchy[minTier]) {
    throw new Error(`${minTier} subscription required`)
  }
  
  return subscription
}
```

### Usage in API Routes
```typescript
// app/api/crises/daily/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireSubscription } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    // Require Pro subscription for daily crises
    await requireSubscription('pro')
    
    // Proceed with crisis generation
    // ... crisis generation logic
    
    return NextResponse.json({ crisis: dailyCrisis })
  } catch (error) {
    if (error instanceof Error && error.message.includes('subscription')) {
      return NextResponse.json(
        { error: 'Pro subscription required for daily crises' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch daily crisis' },
      { status: 500 }
    )
  }
}
```

## Testing

### Test Cards for Different Scenarios
```typescript
// Test card numbers for different scenarios
const TEST_CARDS = {
  success: '4242424242424242',
  decline: '4000000000000002',
  insufficient_funds: '4000000000009995',
  authentication_required: '4000002500003155'
}
```

### Webhook Testing with Stripe CLI
```bash
# Install Stripe CLI
npm install -g stripe

# Login to your account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test specific webhook events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
```

## Database Schema Updates

### Profiles Table Updates
```sql
-- Add Stripe-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription subscription_tier DEFAULT 'free',
ADD COLUMN subscription_end TIMESTAMPTZ;

-- Create subscription tier enum
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'corporate');

-- Create index for Stripe customer lookups
CREATE INDEX idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
```

## Rate Limiting Based on Subscription

### Crisis Access Control
```typescript
// lib/usage-limits.ts
export const USAGE_LIMITS = {
  free: {
    crises_per_week: 1,
    ai_assessments: false,
    categories_access: ['technical', 'business', 'resource'] // Limited categories
  },
  pro: {
    crises_per_day: 1,
    ai_assessments: true,
    categories_access: 'all' // All 13 categories
  },
  corporate: {
    crises_per_day: 'unlimited',
    ai_assessments: true,
    categories_access: 'all',
    team_features: true,
    custom_scenarios: true
  }
} as const

export async function checkUsageLimit(userId: string, action: 'crisis' | 'assessment') {
  const subscription = await getUserSubscription()
  
  if (!subscription) {
    throw new Error('Unable to determine subscription status')
  }
  
  const limits = USAGE_LIMITS[subscription.tier]
  
  // Implement usage checking logic based on subscription tier
  // This would integrate with your existing crisis generation and assessment systems
  
  return true // or false if limit exceeded
}
```

## Error Handling and Security

### Webhook Security
```typescript
// Always verify webhook signatures
try {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
} catch (error) {
  console.error('Webhook signature verification failed')
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

### Customer Data Protection
```typescript
// Always validate user ownership before subscription operations
const { data: profile } = await supabase
  .from('profiles')
  .select('stripe_customer_id')
  .eq('id', user.id) // User from authenticated session
  .single()

if (!profile?.stripe_customer_id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

## Best Practices for CrisisPM

1. **Idempotency**: Handle webhook events that may be sent multiple times
2. **Graceful Degradation**: Fall back to free tier features on payment failures
3. **Clear Messaging**: Communicate subscription benefits clearly to users
4. **Security**: Always verify webhook signatures and user authorization
5. **Testing**: Use Stripe's test mode extensively before going live
6. **Monitoring**: Log all subscription events for debugging and analytics
7. **Customer Experience**: Make upgrading and managing subscriptions seamless

This Stripe integration will enable CrisisPM to implement its freemium SaaS model with secure payment processing, subscription management, and feature gating based on subscription tiers.