import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * NEXT.JS MIDDLEWARE ENTRY POINT
 * Processes all incoming requests to handle authentication session management.
 * This middleware runs before pages load to ensure proper authentication state.
 * 
 * Key responsibilities:
 * - Refresh expired authentication tokens automatically
 * - Protect routes that require user authentication  
 * - Redirect unauthenticated users to login page
 * - Maintain cookie synchronization for session persistence
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

/**
 * MIDDLEWARE CONFIGURATION
 * Defines which routes this middleware should process.
 * Excludes static assets and system files for performance optimization.
 */
export const config = {
  matcher: [
    /**
     * ROUTE MATCHING PATTERN
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - Common static file extensions (images, fonts, etc.)
     * 
     * This ensures middleware only runs on actual page routes and API endpoints,
     * not on static assets which don't need authentication processing.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)',
  ],
}