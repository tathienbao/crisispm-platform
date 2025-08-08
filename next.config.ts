import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * EXPERIMENTAL FEATURES
   * Enable Next.js experimental features for enhanced developer experience.
   * typedRoutes provides compile-time type safety for navigation and reduces runtime errors.
   */
  experimental: {
    typedRoutes: true,
  },

  /**
   * TYPESCRIPT CONFIGURATION
   * Enforce strict TypeScript compliance to maintain code quality and catch errors early.
   * Professional development standard: fail builds on TypeScript errors rather than warnings.
   */
  typescript: {
    ignoreBuildErrors: false,
  },

  /**
   * ESLINT CONFIGURATION  
   * Enforce code quality standards and consistent formatting across the codebase.
   * Prevents deployment of code that doesn't meet established quality guidelines.
   */
  eslint: {
    ignoreDuringBuilds: false,
  },

  /**
   * SECURITY & PERFORMANCE OPTIMIZATIONS
   * Remove unnecessary headers and optimize core performance metrics.
   * Critical for production deployment and user experience.
   */
  poweredByHeader: false,
  
  /**
   * IMAGE OPTIMIZATION SETTINGS
   * Configure modern image formats and security policies for crisis scenario assets.
   * Supports WebP/AVIF for better performance while maintaining security boundaries.
   */
  images: {
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
  },

  /**
   * PUBLIC ENVIRONMENT VARIABLES
   * Define application metadata available to the browser for branding and version tracking.
   * These values are embedded in the client bundle and publicly accessible.
   */
  env: {
    NEXT_PUBLIC_APP_NAME: 'CrisisPM Platform',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

export default nextConfig