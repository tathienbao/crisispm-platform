# TypeScript 5 Documentation for CrisisPM Platform

## Overview
TypeScript is a language for application-scale JavaScript that adds optional types to JavaScript, supporting tools for large-scale JavaScript applications. This documentation focuses on TypeScript 5 integration with React and Next.js.

## Core TypeScript 5 Features for React Development

### React Component Types
```typescript
// Basic functional component typing
interface ComponentProps {
  name: string;
  optional?: boolean;
}

function MyComponent(props: ComponentProps) {
  return <div>Hello, {props.name}</div>;
}

// Class component typing
class MyClassComponent extends React.Component<ComponentProps> {
  render() {
    return <div>Hello, {this.props.name}</div>;
  }
}
```

### Common TypeScript React Patterns

#### Props Interface Definition
```typescript
interface UserProps {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'corporate';
  onEdit?: (user: UserProps) => void;
}

// Discriminated union for conditional props
type TextProps = {
  editable: false
} | {
  editable: true,
  onEdit: (newText: string) => void
};
```

#### Generic Components
```typescript
interface BaseProps<T> {
  initialValues: T;
  nextValues: (cur: T) => T;
}

declare class GenericComponent<Props = {}, Values = object> 
  extends React.Component<Props & BaseProps<Values>, {}> {
  iv: Values;
}

// Usage
let example = <GenericComponent 
  initialValues={{ x: "y" }} 
  nextValues={a => ({ x: a.x })} 
/>;
```

### Next.js 15 + TypeScript Integration

#### useSearchParams with Suspense (Required for Next.js 15)
```typescript
'use client'

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';
  
  // Component logic...
}

// MANDATORY: Wrap in Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
```

#### TypeScript Config for Next.js 15
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Error Handling Patterns

#### Common TypeScript React Errors
1. **TS2874: JSX requires React in scope**
```typescript
// Fix: Import React
import React from 'react';
// Or use JSX transform in tsconfig
```

2. **TS2322: Type assignment errors**
```typescript
// Problem: Wrong prop type
<MyComponent isActive="true" /> // string instead of boolean

// Solution: Correct typing
<MyComponent isActive={true} />
```

3. **Missing Suspense boundary (Next.js 15)**
```typescript
// Problem: useSearchParams without Suspense
function Component() {
  const searchParams = useSearchParams(); // Error!
}

// Solution: Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

### Advanced Patterns for CrisisPM

#### API Response Types
```typescript
// Database types
interface User {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'corporate';
  subscription_end: string | null;
  total_crises: number;
  average_score: number;
  streak_days: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  categories: string[];
  email_notifications: boolean;
}

interface CrisisScenario {
  id: string;
  category: 'technical' | 'business' | 'resource' | 'team' | 'market' | 
           'regulatory' | 'financial' | 'strategic' | 'operational' | 
           'communication' | 'quality' | 'international' | 'innovation';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  template_id: string;
  industry: 'tech' | 'healthcare' | 'finance' | 'retail';
  company_size: 'startup' | 'midsize' | 'enterprise';
  severity: 'minor' | 'major' | 'critical';
  timeline: 'hours' | 'days' | 'weeks';
  stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed';
  title: string;
  description: string;
  context: string;
  stakeholders: string;
  time_pressure: string;
  expert_solution: string;
  assessment_criteria: object;
}
```

#### Form Handling with TypeScript
```typescript
// Form state management
interface LoginFormData {
  email: string;
  password: string;
}

function useLoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Type-safe form submission
  };
  
  return { formData, setFormData, errors, handleSubmit };
}
```

### TypeScript Build Configuration

#### Strict Mode Settings
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Performance Considerations

#### Type-only Imports
```typescript
// Type-only imports for better performance
import type { User, CrisisScenario } from '@/types/database';
import type { ComponentProps } from 'react';

// Regular imports for runtime
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
```

### Best Practices for CrisisPM Platform

1. **Interface over Type**: Use interfaces for object shapes
2. **Strict Typing**: No `any` types in production code
3. **Discriminated Unions**: For conditional props and state
4. **Generic Constraints**: For reusable components
5. **Type Guards**: For runtime type checking
6. **Zod Integration**: For runtime validation with TypeScript

### Common TypeScript + React Gotchas

1. **Event Handlers**: Use proper event types
```typescript
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};
```

2. **Refs**: Type refs properly
```typescript
const inputRef = useRef<HTMLInputElement>(null);
```

3. **Children Props**: Handle children correctly
```typescript
interface Props {
  children: React.ReactNode;
}
```

This TypeScript documentation provides comprehensive coverage for React and Next.js 15 integration, focusing on the patterns and requirements specific to the CrisisPM platform.