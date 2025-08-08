import type { Metadata } from 'next'
import './globals.css'

/**
 * METADATA CONFIGURATION
 * SEO and branding configuration for the CrisisPM platform.
 * These values appear in browser tabs, search results, and social media sharing.
 */
export const metadata: Metadata = {
  title: 'CrisisPM - AI-Powered Crisis Management Training',
  description: 'Master project management crisis scenarios with expert AI feedback. Daily practice for PM professionals.',
  keywords: ['project management', 'crisis management', 'AI training', 'PM skills', 'business scenarios'],
  authors: [{ name: 'CrisisPM Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

/**
 * ROOT LAYOUT COMPONENT
 * The top-level layout that wraps all pages in the application.
 * Required for Next.js App Router - must include <html> and <body> tags.
 * All global styles, providers, and shared components should be configured here.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}