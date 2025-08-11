'use client'

import { useState, useEffect } from 'react'
import CrisisCard from '../../components/crisis/CrisisCard'
import ProgressDashboard from '../../components/progress/ProgressDashboard'
import { CrisisGenerator } from '../../lib/crisis-engine'
import { UserProgressManager, GamificationHelpers } from '../../lib/user-progress'
import type { CrisisScenario } from '../../types/database'
import type { ProgressStats } from '../../lib/user-progress'

interface CrisisScenarioPlatformProps {
  userId: string
  userEmail: string
}

export default function CrisisScenarioPlatform({ userId, userEmail }: CrisisScenarioPlatformProps) {
  const [currentScenario, setCurrentScenario] = useState<CrisisScenario | null>(null)
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'scenario' | 'progress'>('scenario')
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '' as '' | 'beginner' | 'intermediate' | 'advanced'
  })

  // Load user progress and generate initial scenario
  useEffect(() => {
    initializePlatform()
  }, [userId])

  const initializePlatform = async () => {
    try {
      setIsLoading(true)
      
      // Load user progress stats
      const stats = await UserProgressManager.getProgressStats(userId)
      setProgressStats(stats)

      // Generate initial scenario
      generateNewScenario(stats)
    } catch (error) {
      console.error('Error initializing platform:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Redirect to home page after successful logout
        window.location.href = '/'
      } else {
        console.error('Logout failed')
        alert('Failed to logout. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('An error occurred during logout. Please try again.')
    }
  }

  const generateNewScenario = (stats?: ProgressStats) => {
    try {
      const currentStats = stats || progressStats
      
      // Create mock user profile for scenario generation
      const userProfile = {
        difficulty: (filters.difficulty || (currentStats?.totalCompleted || 0) < 5 ? 'beginner' : 'intermediate') as 'beginner' | 'intermediate' | 'advanced',
        categories: filters.category ? [filters.category] : [],
        total_crises: currentStats?.totalCompleted || 0,
        average_score: currentStats?.averageRating || 0,
        used_scenarios: [] // In real implementation, load from database
      }

      const scenario = filters.category || filters.difficulty 
        ? CrisisGenerator.generateScenario({
            category: filters.category as any,
            difficulty: filters.difficulty || undefined
          })
        : CrisisGenerator.generateDailyScenario(userProfile)

      // Add required fields for display
      const displayScenario: CrisisScenario = {
        id: `scenario_${Date.now()}`,
        created_at: new Date().toISOString(),
        ...scenario
      }

      setCurrentScenario(displayScenario)
    } catch (error) {
      console.error('Error generating scenario:', error)
    }
  }

  const handleScenarioComplete = async (scenarioId: string) => {
    if (!currentScenario || !progressStats) return

    try {
      const result = await UserProgressManager.completeScenario(
        userId, 
        currentScenario
      )

      if (result.success && result.updatedStats) {
        setProgressStats(result.updatedStats)
      }
    } catch (error) {
      console.error('Error completing scenario:', error)
    }
  }

  const handleScenarioRate = async (scenarioId: string, rating: number) => {
    if (!currentScenario) return

    try {
      await UserProgressManager.completeScenario(
        userId, 
        currentScenario, 
        rating
      )

      // Refresh progress stats
      const updatedStats = await UserProgressManager.getProgressStats(userId)
      setProgressStats(updatedStats)
    } catch (error) {
      console.error('Error rating scenario:', error)
    }
  }

  const handleCategorySelect = (category: string) => {
    setFilters({ ...filters, category })
    generateNewScenario()
  }

  const handleDifficultySelect = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    setFilters({ ...filters, difficulty })
    generateNewScenario()
  }

  const clearFilters = () => {
    setFilters({ category: '', difficulty: '' })
    generateNewScenario()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your crisis scenarios...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">CM</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">CrisisPM</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{userEmail}</span>
                    <span>•</span>
                    <span className="font-medium">{progressStats?.totalCompleted || 0} scenarios</span>
                  </div>
                </div>
              </div>
              
              {progressStats && progressStats.currentStreak > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-full border border-orange-200">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600 font-semibold">🔥 {progressStats.currentStreak} day streak</span>
                    {progressStats.currentStreak >= 7 && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-medium">
                        {GamificationHelpers.getStreakBadge(progressStats.currentStreak)?.name}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveView('scenario')}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeView === 'scenario'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Practice
                </button>
                <button
                  onClick={() => setActiveView('progress')}
                  className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                    activeView === 'progress'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Progress
                </button>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'scenario' && (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Scenario Section */}
            <div className="lg:col-span-3">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Scenario Filters</h3>
                  {(filters.category || filters.difficulty) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="technical">Technical</option>
                      <option value="business">Business</option>
                      <option value="resource">Resource</option>
                      <option value="team">Team</option>
                      <option value="market">Market</option>
                      <option value="regulatory">Regulatory</option>
                      <option value="financial">Financial</option>
                      <option value="strategic">Strategic</option>
                      <option value="operational">Operational</option>
                      <option value="communication">Communication</option>
                      <option value="quality">Quality</option>
                      <option value="international">International</option>
                      <option value="innovation">Innovation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Auto-Select</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => generateNewScenario()}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Generate New Scenario
                </button>
              </div>

              {/* Current Scenario */}
              {currentScenario && (
                <CrisisCard
                  scenario={currentScenario}
                  onComplete={handleScenarioComplete}
                  onRate={handleScenarioRate}
                  showCompleteButton={true}
                />
              )}
            </div>

            {/* Quick Progress Sidebar */}
            <div className="lg:col-span-1">
              {progressStats && (
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progressStats.totalCompleted}</div>
                      <div className="text-sm text-blue-800">Completed</div>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{progressStats.currentStreak}</div>
                      <div className="text-sm text-orange-800">Day Streak</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {progressStats.averageRating > 0 ? progressStats.averageRating.toFixed(1) : '—'}
                      </div>
                      <div className="text-sm text-green-800">Avg Rating</div>
                    </div>
                  </div>

                  {progressStats.currentStreak === 0 && progressStats.totalCompleted > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 text-center">
                        💡 Complete a scenario today to restart your streak!
                      </p>
                    </div>
                  )}
                  
                  {progressStats.totalCompleted > 0 && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">
                        {GamificationHelpers.getMotivationalMessage(progressStats)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'progress' && progressStats && (
          <ProgressDashboard
            stats={progressStats}
            onCategorySelect={handleCategorySelect}
            onDifficultySelect={handleDifficultySelect}
          />
        )}
      </div>
    </main>
  )
}