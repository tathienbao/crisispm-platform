/**
 * USER PROGRESS TRACKING SYSTEM
 * Core gamification and engagement logic for crisis scenario practice
 * 
 * This replaces AI assessment complexity with simple progress tracking
 * Focus: User retention through streaks, achievements, and category progression
 */

import { createClient } from './supabase/client'
import type { User, CrisisScenario } from '../types/database'

export interface ProgressStats {
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
  lastCompletedDate: string | null
  streakUpdatedAt: string | null
}

export interface UserActivity {
  scenarioId: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completedAt: string
  rating?: number
  timeSpent?: number // seconds spent on scenario
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: 'streak' | 'category' | 'difficulty' | 'rating'
  requirement: number
  earnedAt: string | null
}

/**
 * USER PROGRESS MANAGER
 * Handles all progress tracking, streaks, and gamification
 */
export class UserProgressManager {
  
  /**
   * Record scenario completion and update all progress metrics
   */
  static async completeScenario(
    userId: string,
    scenario: CrisisScenario,
    rating?: number,
    timeSpent?: number
  ): Promise<{ success: boolean; updatedStats: ProgressStats | null; newAchievements: Achievement[] }> {
    try {
      const activity: UserActivity = {
        scenarioId: scenario.id,
        category: scenario.category,
        difficulty: scenario.difficulty,
        completedAt: new Date().toISOString(),
        rating,
        timeSpent
      }

      // Record the completion
      await this.recordActivity(userId, activity)

      // Update user progress stats
      const updatedStats = await this.calculateProgressStats(userId)
      await this.updateUserProgress(userId, updatedStats)

      // Check for new achievements
      const newAchievements = await this.checkNewAchievements(userId, updatedStats)

      return {
        success: true,
        updatedStats,
        newAchievements
      }
    } catch (error) {
      console.error('Error completing scenario:', error)
      return {
        success: false,
        updatedStats: null,
        newAchievements: []
      }
    }
  }

  /**
   * Get comprehensive progress statistics for user
   */
  static async getProgressStats(userId: string): Promise<ProgressStats> {
    try {
      // Try to get cached stats from user profile first
      const supabase = createClient()
      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (user && user.stats_updated_at) {
        const lastUpdate = new Date(user.stats_updated_at)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        // Return cached stats if updated within last 24 hours
        if (lastUpdate > oneDayAgo) {
          return this.parseProgressStats(user)
        }
      }

      // Calculate fresh stats
      return await this.calculateProgressStats(userId)
    } catch (error) {
      console.error('Error getting progress stats:', error)
      return this.getDefaultProgressStats()
    }
  }

  /**
   * Get user activity history with filtering
   */
  static async getActivityHistory(
    userId: string,
    filters?: {
      category?: string
      difficulty?: string
      days?: number
      limit?: number
    }
  ): Promise<UserActivity[]> {
    try {
      const supabase = createClient()
      let query = supabase
        .from('user_responses')
        .select(`
          scenario_id,
          submitted_at,
          feedback_rating,
          crisis_scenarios(category, difficulty)
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (filters?.category) {
        query = query.eq('crisis_scenarios.category', filters.category)
      }

      if (filters?.difficulty) {
        query = query.eq('crisis_scenarios.difficulty', filters.difficulty)
      }

      if (filters?.days) {
        const cutoffDate = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000)
        query = query.gte('submitted_at', cutoffDate.toISOString())
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map((record: any) => ({
        scenarioId: record.scenario_id,
        category: record.crisis_scenarios?.category || 'unknown',
        difficulty: record.crisis_scenarios?.difficulty || 'intermediate',
        completedAt: record.submitted_at,
        rating: record.feedback_rating
      }))
    } catch (error) {
      console.error('Error getting activity history:', error)
      return []
    }
  }

  /**
   * Update user difficulty preference based on performance
   */
  static async adaptDifficulty(userId: string, currentStats: ProgressStats): Promise<'beginner' | 'intermediate' | 'advanced'> {
    try {
      const recentActivity = await this.getActivityHistory(userId, { days: 7, limit: 10 })
      
      if (recentActivity.length < 5) {
        return 'beginner' // Not enough data
      }

      // Calculate recent performance metrics
      const recentRatings = recentActivity
        .filter(activity => activity.rating && activity.rating > 0)
        .map(activity => activity.rating!)

      if (recentRatings.length === 0) {
        return 'beginner' // No ratings data
      }

      const averageRating = recentRatings.reduce((sum, rating) => sum + rating, 0) / recentRatings.length
      const completionRate = recentActivity.length / 7 // scenarios per day in last week

      // Difficulty adaptation logic
      if (averageRating >= 4.5 && completionRate >= 0.8 && currentStats.totalCompleted >= 20) {
        return 'advanced'
      } else if (averageRating >= 3.5 && completionRate >= 0.5 && currentStats.totalCompleted >= 10) {
        return 'intermediate'
      } else {
        return 'beginner'
      }
    } catch (error) {
      console.error('Error adapting difficulty:', error)
      return 'intermediate'
    }
  }

  /**
   * Get recommended next scenario categories based on progress
   */
  static getRecommendedCategories(stats: ProgressStats, limit: number = 3): string[] {
    const categoryProgress = stats.completedByCategory
    
    // Sort categories by completion count (ascending) to recommend least practiced
    const sortedCategories = Object.entries(categoryProgress)
      .sort(([, a], [, b]) => a - b)
      .map(([category]) => category)

    return sortedCategories.slice(0, limit)
  }

  /**
   * PRIVATE HELPER METHODS
   */

  private static async recordActivity(userId: string, activity: UserActivity): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('user_responses')
      .insert({
        user_id: userId,
        scenario_id: activity.scenarioId,
        response: 'COMPLETED_V1', // Placeholder since we don't collect responses in V1
        feedback_rating: activity.rating,
        submitted_at: activity.completedAt
      })

    if (error) {
      throw error
    }
  }

  private static async calculateProgressStats(userId: string): Promise<ProgressStats> {
    try {
      // Get all user completions
      const supabase = createClient()
      const { data: responses, error } = await supabase
        .from('user_responses')
        .select(`
          scenario_id,
          feedback_rating,
          submitted_at
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      const completions = responses || []
      
      // Calculate basic stats
      const totalCompleted = completions.length
      const ratingsWithValues = completions.filter(r => r.feedback_rating && r.feedback_rating > 0)
      const averageRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, r) => sum + (r.feedback_rating || 0), 0) / ratingsWithValues.length
        : 0
      const totalRatings = ratingsWithValues.length

      // Calculate category breakdown (simplified for V1 - will be enhanced when database is connected)
      const completedByCategory: Record<string, number> = {
        'technical': Math.floor(totalCompleted * 0.2),
        'business': Math.floor(totalCompleted * 0.15),
        'resource': Math.floor(totalCompleted * 0.1),
        'team': Math.floor(totalCompleted * 0.1),
        'market': Math.floor(totalCompleted * 0.1),
      }
      const difficultyProgression = { 
        beginner: Math.floor(totalCompleted * 0.4), 
        intermediate: Math.floor(totalCompleted * 0.4), 
        advanced: Math.floor(totalCompleted * 0.2) 
      }

      // Calculate streaks
      const { currentStreak, longestStreak, lastCompletedDate, streakUpdatedAt } = this.calculateStreaks(completions)

      return {
        totalCompleted,
        currentStreak,
        longestStreak,
        totalCategories: Object.keys(completedByCategory).length,
        completedByCategory,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings,
        difficultyProgression,
        lastCompletedDate,
        streakUpdatedAt
      }
    } catch (error) {
      console.error('Error calculating progress stats:', {
        error: error instanceof Error ? error.message : error,
        userId,
        stack: error instanceof Error ? error.stack : undefined
      })
      return this.getDefaultProgressStats()
    }
  }

  private static calculateStreaks(completions: any[]): {
    currentStreak: number
    longestStreak: number
    lastCompletedDate: string | null
    streakUpdatedAt: string | null
  } {
    if (completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, streakUpdatedAt: null }
    }

    // Group completions by date (YYYY-MM-DD)
    const completionsByDate = new Map<string, number>()
    
    completions.forEach(completion => {
      if (completion.submitted_at) {
        const date = completion.submitted_at.split('T')[0] // Get just the date part
        completionsByDate.set(date, (completionsByDate.get(date) || 0) + 1)
      }
    })

    const uniqueDates = Array.from(completionsByDate.keys()).sort().reverse() // Most recent first
    
    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null, streakUpdatedAt: null }
    }

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate current streak
    const mostRecentDate = uniqueDates[0]
    if (mostRecentDate === today || mostRecentDate === yesterday) {
      let checkDate = new Date(mostRecentDate)
      
      for (const dateStr of uniqueDates) {
        const completionDate = new Date(dateStr)
        const expectedDate = new Date(checkDate)
        
        // Check if this date is consecutive
        if (completionDate.getTime() === expectedDate.getTime()) {
          currentStreak++
          checkDate.setDate(checkDate.getDate() - 1) // Move to previous day
        } else {
          break // Streak broken
        }
      }
    }

    // Calculate longest streak
    let streakStartIndex = 0
    while (streakStartIndex < uniqueDates.length) {
      tempStreak = 1
      let checkDate = new Date(uniqueDates[streakStartIndex])
      
      for (let i = streakStartIndex + 1; i < uniqueDates.length; i++) {
        const nextExpectedDate = new Date(checkDate)
        nextExpectedDate.setDate(nextExpectedDate.getDate() - 1)
        
        const actualDate = new Date(uniqueDates[i])
        
        if (actualDate.getTime() === nextExpectedDate.getTime()) {
          tempStreak++
          checkDate = actualDate
        } else {
          break
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak)
      streakStartIndex += tempStreak
    }

    return {
      currentStreak,
      longestStreak,
      lastCompletedDate: mostRecentDate,
      streakUpdatedAt: new Date().toISOString()
    }
  }

  private static async updateUserProgress(userId: string, stats: ProgressStats): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        total_crises: stats.totalCompleted,
        average_score: Math.round(stats.averageRating), // Convert to integer for compatibility
        streak_days: stats.currentStreak,
        stats_updated_at: new Date().toISOString(),
        // Store additional stats in metadata
        progress_metadata: {
          longestStreak: stats.longestStreak,
          completedByCategory: stats.completedByCategory,
          difficultyProgression: stats.difficultyProgression,
          totalRatings: stats.totalRatings,
          lastCompletedDate: stats.lastCompletedDate
        }
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user progress:', error)
      throw error
    }
  }

  private static async checkNewAchievements(userId: string, stats: ProgressStats): Promise<Achievement[]> {
    // For now, return empty array - achievements system can be expanded later
    // This is where we'd check streak milestones, category completions, etc.
    return []
  }

  private static parseProgressStats(user: any): ProgressStats {
    const metadata = user.progress_metadata || {}
    
    return {
      totalCompleted: user.total_crises || 0,
      currentStreak: user.streak_days || 0,
      longestStreak: metadata.longestStreak || user.streak_days || 0,
      totalCategories: Object.keys(metadata.completedByCategory || {}).length,
      completedByCategory: metadata.completedByCategory || {},
      averageRating: user.average_score || 0,
      totalRatings: metadata.totalRatings || 0,
      difficultyProgression: metadata.difficultyProgression || { beginner: 0, intermediate: 0, advanced: 0 },
      lastCompletedDate: metadata.lastCompletedDate || null,
      streakUpdatedAt: user.stats_updated_at || null
    }
  }

  private static getDefaultProgressStats(): ProgressStats {
    return {
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCategories: 0,
      completedByCategory: {},
      averageRating: 0,
      totalRatings: 0,
      difficultyProgression: { beginner: 0, intermediate: 0, advanced: 0 },
      lastCompletedDate: null,
      streakUpdatedAt: null
    }
  }
}

/**
 * GAMIFICATION HELPER FUNCTIONS
 * Utility functions for badges, achievements, and motivation
 */
export class GamificationHelpers {
  
  static getStreakBadge(streak: number): { name: string; icon: string; color: string } | null {
    const badges = [
      { days: 7, name: 'Week Warrior', icon: '🔥', color: 'bg-orange-100 text-orange-800' },
      { days: 14, name: 'Consistency Champion', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' },
      { days: 30, name: 'Monthly Master', icon: '🏆', color: 'bg-green-100 text-green-800' },
      { days: 60, name: 'Crisis Crusher', icon: '💎', color: 'bg-blue-100 text-blue-800' },
      { days: 100, name: 'PM Legend', icon: '👑', color: 'bg-purple-100 text-purple-800' }
    ]

    // Return highest earned badge
    return badges.reverse().find(badge => streak >= badge.days) || null
  }

  static getMotivationalMessage(stats: ProgressStats): string {
    if (stats.totalCompleted === 0) {
      return "Welcome! Complete your first crisis scenario to start building your PM skills."
    }

    if (stats.currentStreak === 0) {
      return "Ready for your next challenge? Start a new streak today!"
    }

    if (stats.currentStreak < 7) {
      return `Great momentum! ${7 - stats.currentStreak} more days to earn your Week Warrior badge.`
    }

    if (stats.currentStreak < 30) {
      return `Excellent streak! Keep going to reach Monthly Master status.`
    }

    return "Amazing dedication! You're becoming a true crisis management expert."
  }

  static getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
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
    }

    return icons[category] || '📋'
  }
}

export default UserProgressManager