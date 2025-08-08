/**
 * HOME PAGE COMPONENT
 * Landing page for the CrisisPM platform showcasing the value proposition.
 * This is the main entry point where users learn about AI-powered crisis training
 * and can sign up for the freemium service.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* HERO SECTION */}
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            CrisisPM Platform
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-Powered Project Management Crisis Training
          </p>
          
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Master crisis management with daily scenarios and expert AI feedback. 
            Join thousands of PMs building confidence through realistic business challenges.
          </p>
        </div>

        {/* STATUS INDICATOR */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-900 mb-2">
            🚀 MVP Development in Progress
          </h2>
          <p className="text-blue-700">
            Next.js 15 + TypeScript foundation complete. 
            Supabase integration and authentication system coming next.
          </p>
        </div>
      </div>
    </main>
  )
}