/**
 * AUTHENTICATION LAYOUT
 * Shared layout for login and signup pages with centered form design.
 * Provides consistent branding and responsive layout for auth flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      {/* HEADER SECTION */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            CrisisPM
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-Powered Project Management Crisis Training
          </p>
        </div>
      </div>

      {/* AUTH FORM CONTAINER */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Join thousands of PMs mastering crisis management through realistic scenarios
        </p>
      </div>
    </div>
  )
}