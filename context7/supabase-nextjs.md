# Supabase + Next.js Integration Documentation Cache
*Last Updated: 2025-01-08*
*Source: Supabase Official Repository*

## Project Setup

### Quick Start with Template
```bash
npx create-next-app -e with-supabase
```
**Pre-configured**: Cookie-based auth, TypeScript, Tailwind CSS

### Manual Setup Dependencies
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-nextjs": "^0.x",
    "@supabase/ssr": "^0.x"
  }
}
```

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Client Configuration

### Server-Side Client (App Router)
```typescript
// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### Client-Side Client (Browser)
```typescript
// utils/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### API Route Client
```typescript
// utils/supabase/api.ts
import { createServerClient, serializeCookieHeader } from '@supabase/ssr'
import { NextApiRequest, NextApiResponse } from 'next'

export function createClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || '',
          }))
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          )
        },
      },
    }
  )
}
```

## Authentication

### Server Actions (App Router)
```typescript
// app/auth/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

### Login Form Component
```typescript
// app/auth/login/page.tsx
import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}
```

### Protected Server Component
```typescript
// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return <h1>Hello {data.user.email}</h1>
}
```

## Middleware for Session Management

### middleware.ts
```typescript
// middleware.ts
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Middleware Session Update
```typescript
// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // CRITICAL: Don't remove auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // MUST return supabaseResponse as-is
  return supabaseResponse
}
```

## Database Schema & RLS Policies

### User Profiles Table Setup
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone." 
ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
ON profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile." 
ON profiles FOR UPDATE USING ((SELECT auth.uid()) = id);

-- Auto-create profile trigger
CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### Storage Bucket Setup
```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars');

-- Storage RLS policies
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar." 
ON storage.objects FOR UPDATE 
USING (auth.uid() = owner) WITH CHECK (bucket_id = 'avatars');
```

## API Routes

### Protected Route Handler
```typescript
// app/api/protected/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Query with RLS enabled
  const { data: userData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)

  return NextResponse.json({ user: data.user, profile: userData })
}
```

### Data Mutation Route
```typescript
// app/api/todos/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { title } = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('todos')
    .insert({ title })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
```

## TypeScript Integration

### Database Types Generation
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Generate types
supabase gen types typescript --project-id your-project-id > database.types.ts
```

### Type Usage Example
```typescript
// types/database.ts
import { Database } from './database.types'

export type User = Database['public']['Tables']['profiles']['Row']
export type UserInsert = Database['public']['Tables']['profiles']['Insert']
export type UserUpdate = Database['public']['Tables']['profiles']['Update']

// Typed client usage
const supabase = createClient<Database>()
const { data } = await supabase.from('profiles').select('*') // Fully typed
```

## Best Practices

### Authentication Flow
1. **Always use `auth.getUser()`** - Validates JWT tokens server-side
2. **Middleware is critical** - Refreshes expired sessions automatically
3. **Protect server components** - Check auth before rendering protected content
4. **Handle redirects properly** - Use Next.js redirect() for auth failures

### Row Level Security
1. **Enable RLS on all tables** - Default deny, explicit allow
2. **Use auth.uid()** - Reference current authenticated user
3. **Test policies thoroughly** - Ensure proper access control
4. **Granular permissions** - Separate policies for SELECT, INSERT, UPDATE, DELETE

### Performance Optimization
1. **Use server components** - Reduce client-side JavaScript
2. **Cache static data** - Use Next.js caching for public content
3. **Optimize queries** - Select only needed columns
4. **Connection pooling** - Supabase handles this automatically

### Security Considerations
1. **Environment variables** - Keep secrets secure
2. **Input validation** - Validate all user inputs
3. **Rate limiting** - Implement on sensitive endpoints
4. **HTTPS only** - Never transmit credentials over HTTP

## Common Patterns

### Real-time Subscriptions
```typescript
useEffect(() => {
  const supabase = createClient()
  
  const channel = supabase
    .channel('todos')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'todos' },
      (payload) => {
        console.log('Change received!', payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### File Upload
```typescript
const uploadAvatar = async (file: File) => {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${user.id}/${file.name}`, file)
    
  if (error) throw error
  return data
}
```

### Pagination
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 9) // First 10 items
```

## Troubleshooting

### Common Issues
1. **Random logouts** - Usually middleware configuration
2. **RLS blocking queries** - Check policy conditions
3. **CORS errors** - Configure Supabase domain settings
4. **Type errors** - Regenerate database types

### Debug Tips
1. **Check browser network tab** - See actual requests
2. **Use Supabase Dashboard** - Monitor logs and queries
3. **Test RLS policies** - Use SQL editor to verify
4. **Validate environment variables** - Ensure correct values