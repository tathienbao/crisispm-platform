'use client'

import { useState } from 'react'

interface ProgressStats {
  totalCompleted: number
  currentStreak: number
  longestStreak: number
  totalCategories: number
  completedByCategory: Record<string, number>
  averageRating: number
  totalRatings: number
  difficultyProgression: {
    beginner: number
    intermediate: number
    advanced: number
  }
}

interface ProgressDashboardProps {
  stats: ProgressStats
  onCategorySelect?: (category: string) => void
  onDifficultySelect?: (difficulty: 'beginner' | 'intermediate' | 'advanced') => void
}

const CATEGORY_ICONS = {
  technical: '⚙️',
  business: '💼', 
  resource: '📊',
  team: '👥',
  market: '📈',
  regulatory: '⚖️',
  financial: '💰',
  strategic: '🎯',
  operational: '🔧',
  communication: '💬',
  quality: '✅',
  international: '🌍',
  innovation: '💡'
} as const

const STREAK_BADGES = [
  { days: 7, name: 'Week Warrior', icon: '🔥', color: 'bg-orange-100 text-orange-800' },
  { days: 14, name: 'Consistency Champion', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
  { days: 30, name: 'Monthly Master', icon: '🏆', color: 'bg-green-100 text-green-800' },
  { days: 60, name: 'Crisis Crusher', icon: '💎', color: 'bg-blue-100 text-blue-800' },
  { days: 100, name: 'PM Legend', icon: '👑', color: 'bg-purple-100 text-purple-800' }
]

export default function ProgressDashboard({ 
  stats, 
  onCategorySelect, 
  onDifficultySelect 
}: ProgressDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'achievements'>('overview')

  // Calculate completion percentage for each category
  const getCategoryProgress = (category: string, completed: number) => {
    const totalPossiblePerCategory = 8 * 432 // 8 templates × 432 variable combinations
    return Math.min((completed / totalPossiblePerCategory) * 100, 100)
  }

  // Get highest earned badge
  const getHighestBadge = (streak: number) => {
    return STREAK_BADGES.reduce((highest, badge) => 
      streak >= badge.days ? badge : highest
    , STREAK_BADGES[0])
  }

  // Calculate overall progress
  const overallProgress = stats.totalCompleted / (13 * 8) * 100 // At least 1 scenario per template

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your crisis management skill development</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-100">
        <nav className="flex">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'categories', label: 'Categories', icon: '📋' },
            { key: 'achievements', label: 'Achievements', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</div>
                <div className="text-sm text-blue-800">Scenarios Completed</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-orange-800">Current Streak</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
                </div>
                <div className="text-sm text-green-800">Avg Rating</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-purple-800">Overall Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-500">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(overallProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Difficulty Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(stats.difficultyProgression).map(([difficulty, count]) => (
                  <button
                    key={difficulty}
                    onClick={() => onDifficultySelect?.(difficulty as any)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                      difficulty === 'beginner' ? 'border-green-200 bg-green-50' :
                      difficulty === 'intermediate' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className={`text-lg font-bold ${
                      difficulty === 'beginner' ? 'text-green-600' :
                      difficulty === 'intermediate' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {count}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{difficulty}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Progress</h3>
            <div className="grid gap-3">
              {Object.entries(stats.completedByCategory).map(([category, completed]) => {
                const progress = getCategoryProgress(category, completed)
                const categoryIcon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || '📋'
                
                return (
                  <button
                    key={category}
                    onClick={() => onCategorySelect?.(category)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{categoryIcon}</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900 capitalize">{category}</div>
                        <div className="text-sm text-gray-600">{completed} scenarios completed</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Current Streak Badge */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Achievement</h3>
              {stats.currentStreak > 0 ? (
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <span className="text-3xl">{getHighestBadge(stats.currentStreak).icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900">{getHighestBadge(stats.currentStreak).name}</div>
                    <div className="text-sm text-gray-600">{stats.currentStreak} day streak</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-600">Complete your first scenario to start earning achievements!</div>
                </div>
              )}
            </div>

            {/* All Badges */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STREAK_BADGES.map((badge) => {
                  const earned = stats.longestStreak >= badge.days
                  return (
                    <div
                      key={badge.days}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        earned 
                          ? `${badge.color} border-current`
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl ${earned ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </span>
                        <div>
                          <div className="font-medium">{badge.name}</div>
                          <div className="text-sm">
                            {badge.days} day streak {earned ? '✓' : `(${badge.days - stats.longestStreak} more days)`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.longestStreak}</div>
                  <div className="text-sm text-gray-600">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalRatings}</div>
                  <div className="text-sm text-gray-600">Scenarios Rated</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}