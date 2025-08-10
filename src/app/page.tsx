import Link from 'next/link'

/**
 * HOMEPAGE COMPONENT
 * Modern, elegant landing page inspired by top-tier SaaS platforms
 * Clean design with strong visual hierarchy and compelling value proposition
 */
export default function HomePage() {
  return (
    <main className="relative">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <span className="font-bold text-xl text-gray-900">CrisisPM</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign in
              </Link>
              <Link 
                href="/signup" 
                className="bg-gray-900 text-white px-4 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              🚀 44,928 Unique Crisis Scenarios Available
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Master Crisis
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Practice with algorithmic crisis scenarios. Build the skills that Fortune 500 companies 
              pay $2,000+ for in corporate training programs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/signup"
                className="bg-gray-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
              >
                Start practicing free
              </Link>
              <Link
                href="#features"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-gray-400 transition-all"
              >
                See how it works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">44,928</div>
                <div className="text-sm text-gray-600">Unique Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">123+</div>
                <div className="text-sm text-gray-600">Years of Content</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">$19</div>
                <div className="text-sm text-gray-600">vs $2,000+ Courses</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to master crisis management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The only platform that generates infinite unique scenarios with expert-level assessment
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: "🎯",
                title: "Algorithmic Scenarios",
                description: "Never repeat the same crisis. Our algorithm generates 44,928 unique combinations across 13 categories.",
                color: "from-blue-500 to-purple-600"
              },
              {
                icon: "🧠", 
                title: "Expert Assessment",
                description: "Get detailed feedback on Strategy, Communication, Leadership, and Execution from AI trained on MBA curricula.",
                color: "from-purple-500 to-pink-600"
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                description: "Track your improvement across categories. Build streaks, earn achievements, and measure your growth.",
                color: "from-green-500 to-teal-600"
              }
            ].map((feature) => (
              <div key={feature.title} className="group hover:scale-105 transition-all">
                <div className="bg-gray-50 rounded-2xl p-8 h-full hover:shadow-xl transition-all">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-12">
            Trusted by project managers at leading companies
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60">
            {["Microsoft", "Amazon", "Google", "Meta"].map((company) => (
              <div key={company} className="text-2xl font-bold text-gray-400">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Professional PM development at a fraction of corporate training costs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: ["1 crisis per week", "Basic progress tracking", "Community support"],
                cta: "Start free",
                popular: false
              },
              {
                name: "Pro",
                price: "$19",
                description: "For serious PM development", 
                features: ["Daily crisis scenarios", "Expert AI assessment", "Advanced analytics", "Priority support"],
                cta: "Start free trial",
                popular: true
              },
              {
                name: "Corporate", 
                price: "$99",
                description: "For teams and organizations",
                features: ["Everything in Pro", "Team dashboards", "Custom scenarios", "Admin controls"],
                cta: "Contact sales",
                popular: false
              }
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 ${plan.popular ? 'bg-gray-900 text-white scale-105' : 'bg-gray-50'}`}>
                {plan.popular && (
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
                    Most popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>/month</span>
                </div>
                <p className={`mb-6 ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className={`flex items-center ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                      <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block text-center py-3 px-6 rounded-full font-semibold transition-all ${
                    plan.popular 
                      ? 'bg-white text-gray-900 hover:bg-gray-100' 
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to become a crisis management expert?
          </h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Join thousands of PMs building the skills that matter. Start with our free tier today.
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg inline-block"
          >
            Start your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-bold text-xl">CrisisPM</span>
            </div>
            <div className="text-gray-400">
              © 2025 CrisisPM. Built for PM excellence.
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}