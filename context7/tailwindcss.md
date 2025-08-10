# Tailwind CSS 3.4 Documentation for CrisisPM Platform

## Overview
Tailwind CSS is a utility-first CSS framework for rapidly building custom user interfaces. This documentation focuses on Tailwind CSS 3.4 integration with React and Next.js, specifically for the CrisisPM platform.

## Installation and Setup

### Install Tailwind CSS 3.4
```bash
npm install tailwindcss@latest
```

### Next.js 15 Integration
Tailwind CSS 3.4 works seamlessly with Next.js 15. The configuration is already set up in the CrisisPM platform.

#### Tailwind Config (tailwind.config.ts)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for CrisisPM platform
        'crisis': {
          50: '#fef2f2',
          100: '#fee2e2', 
          500: '#ef4444',
          900: '#7f1d1d'
        }
      },
    },
  },
  plugins: [],
}
export default config
```

#### PostCSS Config (postcss.config.mjs)
```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

#### CSS Import (globals.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## React + Tailwind CSS Patterns

### Component Styling
```typescript
// Basic functional component with Tailwind
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Conditional Classes
```typescript
// Using template literals for conditional styling
function CrisisCard({ crisis, isUrgent }: { crisis: Crisis, isUrgent: boolean }) {
  return (
    <div className={`
      p-6 rounded-lg border transition-all
      ${isUrgent 
        ? 'border-red-500 bg-red-50 shadow-lg' 
        : 'border-gray-200 bg-white hover:shadow-md'
      }
    `}>
      <h3 className={`text-lg font-semibold ${isUrgent ? 'text-red-900' : 'text-gray-900'}`}>
        {crisis.title}
      </h3>
      <p className="mt-2 text-gray-600">{crisis.description}</p>
    </div>
  );
}
```

### Dynamic Styles with CSS Variables
```typescript
// Dynamic styling using CSS variables
export function BrandedButton({ 
  buttonColor, 
  textColor, 
  children 
}: {
  buttonColor: string;
  textColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      style={{
        '--bg-color': buttonColor,
        '--text-color': textColor,
      } as React.CSSProperties}
      className="bg-[var(--bg-color)] text-[var(--text-color)] px-4 py-2 rounded-md"
    >
      {children}
    </button>
  );
}
```

## Responsive Design Patterns

### Breakpoint System
```css
/* Tailwind CSS 3.4 breakpoints */
sm: 640px   /* @media (min-width: 640px) */
md: 768px   /* @media (min-width: 768px) */
lg: 1024px  /* @media (min-width: 1024px) */
xl: 1280px  /* @media (min-width: 1280px) */
2xl: 1536px /* @media (min-width: 1536px) */
```

### Responsive Component Example
```typescript
function ResponsiveDashboard() {
  return (
    <div className="
      grid 
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
      gap-4 lg:gap-6 
      p-4 md:p-6 lg:p-8
    ">
      {/* Crisis cards */}
      <div className="
        bg-white rounded-lg shadow-sm 
        p-4 md:p-6 
        hover:shadow-md transition-shadow
      ">
        <h3 className="text-base md:text-lg font-semibold">Crisis Title</h3>
        <p className="text-sm md:text-base text-gray-600 mt-2">Description</p>
      </div>
    </div>
  );
}
```

## Form Styling Patterns

### Professional Form Components
```typescript
// Input component with Tailwind styling
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          placeholder-gray-400 
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${error 
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300'
          }
          ${className || ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

### Form Layout Example (CrisisPM Login)
```typescript
function LoginForm() {
  return (
    <form className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          className="
            mt-1 block w-full px-3 py-2 border border-gray-300 
            rounded-md shadow-sm placeholder-gray-400 
            focus:outline-none focus:ring-blue-500 focus:border-blue-500
          "
          placeholder="Enter your email"
        />
      </div>
      
      <button
        type="submit"
        className="
          w-full flex justify-center py-2 px-4 border border-transparent 
          rounded-md shadow-sm text-sm font-medium text-white 
          bg-blue-600 hover:bg-blue-700 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-400
        "
      >
        Sign in
      </button>
    </form>
  );
}
```

## Layout Patterns

### Grid Layouts
```typescript
// Dashboard grid layout
function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Stat cards */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Crises</p>
            <p className="text-2xl font-semibold text-gray-900">24</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Flexbox Navigation
```typescript
// Navigation component
function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">CrisisPM</h1>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/dashboard" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Dashboard
              </a>
              <a href="/crises" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Crises
              </a>
            </div>
          </div>
          
          {/* Profile */}
          <div className="flex items-center space-x-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
              Account
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

## Advanced Patterns

### Dark Mode Support
```typescript
// Component with dark mode support
function ThemeToggle() {
  return (
    <div className="
      bg-white dark:bg-gray-800 
      text-gray-900 dark:text-gray-100
      border border-gray-200 dark:border-gray-700
      rounded-lg p-4
    ">
      <h3 className="text-lg font-semibold">Theme Settings</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        Choose your preferred theme
      </p>
    </div>
  );
}
```

### Animation and Transitions
```typescript
// Animated components
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="
        animate-spin rounded-full h-8 w-8 
        border-b-2 border-blue-600
      "></div>
    </div>
  );
}

function FadeInCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      opacity-0 translate-y-4 
      animate-in fade-in-0 slide-in-from-bottom-4 
      duration-500
    ">
      {children}
    </div>
  );
}
```

### Custom Utilities
```css
/* Add to globals.css for project-specific utilities */
@layer components {
  .crisis-card {
    @apply bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow;
  }
  
  .crisis-card-urgent {
    @apply border-red-300 bg-red-50;
  }
  
  .btn-crisis {
    @apply px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-crisis-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500;
  }
  
  .btn-crisis-danger {
    @apply bg-red-600 text-white hover:bg-red-700 focus:ring-red-500;
  }
}
```

## Performance Optimization

### Purging Unused CSS
Tailwind CSS 3.4 automatically removes unused styles in production builds. Ensure your `content` configuration in `tailwind.config.ts` includes all files that use Tailwind classes:

```typescript
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
}
```

### JIT (Just-In-Time) Compilation
Tailwind CSS 3.4 includes JIT compilation by default, which:
- Generates styles on-demand
- Supports arbitrary values like `w-[500px]`
- Faster build times
- Smaller CSS bundles

```typescript
// Arbitrary values work out of the box
<div className="w-[500px] h-[300px] bg-[#1da1f2]">
  Custom dimensions and colors
</div>
```

## CrisisPM-Specific Examples

### Crisis Scenario Card
```typescript
interface CrisisScenarioProps {
  scenario: {
    id: string;
    title: string;
    description: string;
    severity: 'minor' | 'major' | 'critical';
    category: string;
  };
}

export function CrisisScenarioCard({ scenario }: CrisisScenarioProps) {
  const severityStyles = {
    minor: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    major: 'border-orange-200 bg-orange-50 text-orange-800', 
    critical: 'border-red-200 bg-red-50 text-red-800'
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{scenario.title}</h3>
        <span className={`
          px-2 py-1 text-xs font-medium rounded-full
          ${severityStyles[scenario.severity]}
        `}>
          {scenario.severity}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{scenario.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {scenario.category}
        </span>
        <button className="
          text-blue-600 hover:text-blue-800 
          font-medium text-sm 
          transition-colors
        ">
          Start Crisis →
        </button>
      </div>
    </div>
  );
}
```

### Dashboard Stats
```typescript
function DashboardStats() {
  const stats = [
    { name: 'Total Crises Completed', value: '24', change: '+12%', changeType: 'positive' },
    { name: 'Average Score', value: '87%', change: '+5%', changeType: 'positive' },
    { name: 'Current Streak', value: '7 days', change: '+2 days', changeType: 'positive' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
            <div className={`
              flex items-center text-sm font-medium
              ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}
            `}>
              <span>{stat.change}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Best Practices for CrisisPM

1. **Consistent Design System**: Use consistent spacing, colors, and typography
2. **Mobile-First**: Design for mobile first, then scale up
3. **Accessible Colors**: Ensure sufficient contrast for accessibility
4. **Performance**: Use JIT compilation and purging for optimal bundle size
5. **Component-Based**: Create reusable components with Tailwind utilities
6. **Semantic HTML**: Use proper HTML elements with Tailwind styling

This documentation provides comprehensive coverage of Tailwind CSS 3.4 patterns specifically tailored for the CrisisPM platform's React and Next.js implementation.