'use client'

import { useState } from 'react'
import type { CrisisScenario } from '../../types/database'

interface CrisisCardProps {
  scenario: CrisisScenario
  onComplete?: (scenarioId: string) => void
  onRate?: (scenarioId: string, rating: number) => void
  showCompleteButton?: boolean
}

const CATEGORY_COLORS = {
  technical: 'bg-red-100 text-red-800',
  business: 'bg-blue-100 text-blue-800', 
  resource: 'bg-yellow-100 text-yellow-800',
  team: 'bg-green-100 text-green-800',
  market: 'bg-purple-100 text-purple-800',
  regulatory: 'bg-gray-100 text-gray-800',
  financial: 'bg-orange-100 text-orange-800',
  strategic: 'bg-indigo-100 text-indigo-800',
  operational: 'bg-cyan-100 text-cyan-800',
  communication: 'bg-pink-100 text-pink-800',
  quality: 'bg-emerald-100 text-emerald-800',
  international: 'bg-violet-100 text-violet-800',
  innovation: 'bg-teal-100 text-teal-800'
} as const

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-50 text-green-700 ring-green-600/20',
  intermediate: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', 
  advanced: 'bg-red-50 text-red-700 ring-red-600/20'
} as const

const SEVERITY_ICONS = {
  minor: '⚠️',
  major: '🔥',
  critical: '🚨'
} as const

const TIMELINE_ICONS = {
  hours: '⏰',
  days: '📅',
  weeks: '🗓️'
} as const

export default function CrisisCard({ 
  scenario, 
  onComplete, 
  onRate, 
  showCompleteButton = true 
}: CrisisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleComplete = () => {
    setIsCompleted(true)
    onComplete?.(scenario.id)
  }

  const handleRating = (newRating: number) => {
    setRating(newRating)
    onRate?.(scenario.id, newRating)
  }

  const categoryColor = CATEGORY_COLORS[scenario.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.business
  const difficultyColor = DIFFICULTY_COLORS[scenario.difficulty]
  const severityIcon = SEVERITY_ICONS[scenario.severity as keyof typeof SEVERITY_ICONS]
  const timelineIcon = TIMELINE_ICONS[scenario.timeline as keyof typeof TIMELINE_ICONS]

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
              {scenario.category.toUpperCase()}
            </span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${difficultyColor}`}>
              {scenario.difficulty.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {severityIcon} {scenario.severity}
            </span>
            <span className="flex items-center gap-1">
              {timelineIcon} {scenario.timeline}
            </span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-3">
          {scenario.title}
        </h2>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="capitalize">{scenario.industry} Industry</span>
          <span>•</span>
          <span className="capitalize">{scenario.company_size} Company</span>
          <span>•</span>
          <span className="capitalize">{scenario.stakeholder_type} Stakeholders</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Crisis Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Crisis Situation</h3>
          <p className="text-gray-700 leading-relaxed">
            {scenario.description}
          </p>
        </div>

        {/* Context (Expandable) */}
        <div className="mb-6">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2 hover:text-gray-700 transition-colors"
          >
            Background Context 
            <span className="transform transition-transform duration-200" 
                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              ▼
            </span>
          </button>
          
          {isExpanded && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <p className="text-gray-700 leading-relaxed mb-3">
                  {scenario.context}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Stakeholders</h4>
                  <p className="text-sm text-gray-600">{scenario.stakeholders}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Time Pressure</h4>
                  <p className="text-sm text-gray-600">{scenario.time_pressure}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How would you handle this crisis?</h4>
              <p className="text-sm text-gray-600">
                Think through your approach considering strategy, communication, leadership, and execution.
              </p>
            </div>
            
            {showCompleteButton && !isCompleted && (
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Mark Complete
              </button>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Completed
              </div>
            )}
          </div>

          {/* Rating System */}
          {isCompleted && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Rate this scenario</h5>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`text-2xl transition-colors duration-150 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {rating > 0 ? `${rating}/5 stars` : 'Click to rate'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}