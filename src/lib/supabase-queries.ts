/**
 * SUPABASE DATABASE QUERIES
 * Database operations for crisis scenarios, user profiles, and responses
 * 
 * Provides type-safe database operations with error handling and optimization
 */

import { createClient } from '@supabase/supabase-js'
import type { Database, User, CrisisScenario, UserResponse, CrisisScenarioInsert, UserResponseInsert } from '../types/database'
import { CrisisGenerator } from './crisis-engine'

// Initialize Supabase client
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * USER PROFILE OPERATIONS
 */
export class UserProfileQueries {
  /**
   * Get user profile with full details
   */
  static async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  /**
   * Update user profile data
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user profile:', error)
      return false
    }

    return true
  }

  /**
   * Update user progress after completing a crisis
   */
  static async updateProgress(userId: string, score: number): Promise<boolean> {
    // Get current profile to calculate new averages
    const profile = await this.getProfile(userId)
    if (!profile) return false

    // Calculate new average score
    const totalCrises = profile.total_crises + 1
    const newAverageScore = ((profile.average_score * profile.total_crises) + score) / totalCrises

    // Update streak (simplified logic - could be enhanced with date checking)
    const newStreakDays = profile.streak_days + 1

    const updates = {
      total_crises: totalCrises,
      average_score: Math.round(newAverageScore * 100) / 100, // Round to 2 decimal places
      streak_days: newStreakDays,
      updated_at: new Date().toISOString()
    }

    return this.updateProfile(userId, updates)
  }

  /**
   * Get user's crisis history (IDs of completed scenarios)
   */
  static async getUserCrisisHistory(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_responses')
      .select('scenario_id')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching user crisis history:', error)
      return []
    }

    return data.map(response => response.scenario_id)
  }
}

/**
 * CRISIS SCENARIO OPERATIONS
 */
export class CrisisScenarioQueries {
  /**
   * Get random crisis scenario for user based on their preferences
   */
  static async getDailyScenario(userId: string): Promise<CrisisScenario | null> {
    try {
      // Get user profile for personalization
      const profile = await UserProfileQueries.getProfile(userId)
      if (!profile) return null

      // Get user's crisis history to avoid duplicates
      const usedScenarios = await UserProfileQueries.getUserCrisisHistory(userId)

      // Check if we have pre-generated scenarios in database
      const existingScenario = await this.getUnusedScenario(profile, usedScenarios)
      if (existingScenario) {
        return existingScenario
      }

      // Generate new scenario using crisis engine
      const generatedScenario = CrisisGenerator.generateDailyScenario({
        difficulty: profile.difficulty,
        categories: profile.categories,
        total_crises: profile.total_crises,
        average_score: profile.average_score,
        used_scenarios: usedScenarios
      })

      // Store generated scenario in database
      const storedScenario = await this.storeScenario(generatedScenario)
      return storedScenario
    } catch (error) {
      console.error('Error getting daily scenario:', error)
      return null
    }
  }

  /**
   * Get unused scenario from database based on user preferences
   */
  private static async getUnusedScenario(profile: User, usedScenarios: string[]): Promise<CrisisScenario | null> {
    let query = supabase
      .from('crisis_scenarios')
      .select('*')
      .eq('difficulty', profile.difficulty)

    // Filter out used scenarios
    if (usedScenarios.length > 0) {
      query = query.not('id', 'in', `(${usedScenarios.map(id => `'${id}'`).join(',')})`)
    }

    // Filter by user's preferred categories if specified
    if (profile.categories.length > 0) {
      query = query.in('category', profile.categories)
    }

    // Get random scenario
    const { data, error } = await query
      .limit(10) // Get multiple options
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) {
      return null
    }

    // Return random scenario from results
    return data[Math.floor(Math.random() * data.length)]
  }

  /**
   * Store generated scenario in database
   */
  static async storeScenario(scenario: CrisisScenarioInsert): Promise<CrisisScenario | null> {
    const { data, error } = await supabase
      .from('crisis_scenarios')
      .insert(scenario)
      .select()
      .single()

    if (error) {
      console.error('Error storing crisis scenario:', error)
      return null
    }

    return data
  }

  /**
   * Get scenario by ID
   */
  static async getScenarioById(scenarioId: string): Promise<CrisisScenario | null> {
    const { data, error } = await supabase
      .from('crisis_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single()

    if (error) {
      console.error('Error fetching scenario:', error)
      return null
    }

    return data
  }

  /**
   * Search scenarios by category and difficulty
   */
  static async searchScenarios(filters: {
    category?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    industry?: string
    company_size?: string
    limit?: number
  }): Promise<CrisisScenario[]> {
    let query = supabase.from('crisis_scenarios').select('*')

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }
    if (filters.industry) {
      query = query.eq('industry', filters.industry)
    }
    if (filters.company_size) {
      query = query.eq('company_size', filters.company_size)
    }

    const { data, error } = await query
      .limit(filters.limit || 20)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching scenarios:', error)
      return []
    }

    return data || []
  }
}

/**
 * USER RESPONSE OPERATIONS
 */
export class UserResponseQueries {
  /**
   * Submit user response to a crisis scenario
   */
  static async submitResponse(response: {
    userId: string
    scenarioId: string
    response: string
  }): Promise<UserResponse | null> {
    const responseData: UserResponseInsert = {
      user_id: response.userId,
      scenario_id: response.scenarioId,
      response: response.response,
      submitted_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_responses')
      .insert(responseData)
      .select()
      .single()

    if (error) {
      console.error('Error submitting response:', error)
      return null
    }

    return data
  }

  /**
   * Update response with AI assessment scores
   */
  static async updateResponseWithAssessment(responseId: string, assessment: {
    total_score: number
    strategy_score: number
    communication_score: number
    leadership_score: number
    execution_score: number
    feedback: string
    improvements: string[]
  }): Promise<boolean> {
    const { error } = await supabase
      .from('user_responses')
      .update(assessment)
      .eq('id', responseId)

    if (error) {
      console.error('Error updating response with assessment:', error)
      return false
    }

    return true
  }

  /**
   * Get user's response history with scenarios
   */
  static async getUserResponses(userId: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_responses')
      .select(`
        *,
        crisis_scenarios (
          title,
          category,
          difficulty,
          industry,
          company_size
        )
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user responses:', error)
      return []
    }

    return data || []
  }

  /**
   * Get response by ID with scenario details
   */
  static async getResponseById(responseId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('user_responses')
      .select(`
        *,
        crisis_scenarios (*)
      `)
      .eq('id', responseId)
      .single()

    if (error) {
      console.error('Error fetching response:', error)
      return null
    }

    return data
  }

  /**
   * Get user's performance analytics
   */
  static async getUserAnalytics(userId: string): Promise<{
    total_responses: number
    average_score: number
    category_performance: Record<string, number>
    recent_trend: number[]
  } | null> {
    const { data, error } = await supabase
      .from('user_responses')
      .select(`
        total_score,
        submitted_at,
        crisis_scenarios (category)
      `)
      .eq('user_id', userId)
      .not('total_score', 'is', null)
      .order('submitted_at', { ascending: true })

    if (error) {
      console.error('Error fetching user analytics:', error)
      return null
    }

    if (!data || data.length === 0) {
      return {
        total_responses: 0,
        average_score: 0,
        category_performance: {},
        recent_trend: []
      }
    }

    // Calculate analytics
    const totalResponses = data.length
    const averageScore = data.reduce((sum, resp) => sum + (resp.total_score || 0), 0) / totalResponses
    
    /**
     * CATEGORY PERFORMANCE ANALYTICS
     * Business Purpose: Track user performance across different crisis types
     * to enable personalized difficulty progression and targeted learning
     */
    const categoryScores: Record<string, number[]> = {}
    data.forEach(resp => {
      // Handle Supabase relation data structure - crisis_scenarios can be object or null
      const scenario = resp.crisis_scenarios as any
      if (scenario?.category && resp.total_score) {
        const category = scenario.category
        if (!categoryScores[category]) {
          categoryScores[category] = []
        }
        categoryScores[category].push(resp.total_score)
      }
    })

    // Calculate average scores per category for progress tracking
    const categoryPerformance: Record<string, number> = {}
    Object.keys(categoryScores).forEach(category => {
      const scores = categoryScores[category]
      categoryPerformance[category] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    })

    // Recent trend (last 10 responses)
    const recentTrend = data.slice(-10).map(resp => resp.total_score || 0)

    return {
      total_responses: totalResponses,
      average_score: Math.round(averageScore * 100) / 100,
      category_performance: categoryPerformance,
      recent_trend: recentTrend
    }
  }
}

/**
 * BULK OPERATIONS FOR ADMIN/SEEDING
 */
export class BulkOperations {
  /**
   * Generate and store multiple scenarios for database seeding
   */
  static async seedScenarios(count: number = 100): Promise<number> {
    console.log(`Generating ${count} crisis scenarios...`)
    
    let stored = 0
    const categories = ['technical', 'business', 'resource', 'team'] // Start with core categories
    const difficulties = ['beginner', 'intermediate', 'advanced']

    for (let i = 0; i < count; i++) {
      try {
        const scenario = CrisisGenerator.generateScenario({
          category: categories[i % categories.length] as any,
          difficulty: difficulties[i % difficulties.length] as any
        })

        const result = await CrisisScenarioQueries.storeScenario(scenario)
        if (result) {
          stored++
        }

        // Progress indicator
        if (stored % 10 === 0) {
          console.log(`Generated ${stored} scenarios...`)
        }
      } catch (error) {
        console.error('Error generating scenario:', error)
      }
    }

    console.log(`✅ Successfully generated ${stored} crisis scenarios`)
    return stored
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    total_scenarios: number
    scenarios_by_category: Record<string, number>
    scenarios_by_difficulty: Record<string, number>
    total_responses: number
    active_users: number
  }> {
    // Get scenario counts
    const { data: scenarios, error: scenarioError } = await supabase
      .from('crisis_scenarios')
      .select('category, difficulty')

    const { data: responses, error: responseError } = await supabase
      .from('user_responses')
      .select('user_id', { count: 'exact' })

    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })

    if (scenarioError || responseError || userError) {
      console.error('Error fetching database stats')
      return {
        total_scenarios: 0,
        scenarios_by_category: {},
        scenarios_by_difficulty: {},
        total_responses: 0,
        active_users: 0
      }
    }

    // Process statistics
    const scenariosByCategory: Record<string, number> = {}
    const scenariosByDifficulty: Record<string, number> = {}

    scenarios?.forEach(scenario => {
      scenariosByCategory[scenario.category] = (scenariosByCategory[scenario.category] || 0) + 1
      scenariosByDifficulty[scenario.difficulty] = (scenariosByDifficulty[scenario.difficulty] || 0) + 1
    })

    return {
      total_scenarios: scenarios?.length || 0,
      scenarios_by_category: scenariosByCategory,
      scenarios_by_difficulty: scenariosByDifficulty,
      total_responses: responses?.length || 0,
      active_users: users?.length || 0
    }
  }
}

/**
 * REAL-TIME SUBSCRIPTIONS
 */
export class RealtimeSubscriptions {
  /**
   * Subscribe to user's response updates
   */
  static subscribeToUserResponses(userId: string, callback: (response: UserResponse) => void) {
    return supabase
      .channel(`user_responses_${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'user_responses',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => callback(payload.new as UserResponse)
      )
      .subscribe()
  }

  /**
   * Subscribe to new crisis scenarios
   */
  static subscribeToNewScenarios(callback: (scenario: CrisisScenario) => void) {
    return supabase
      .channel('new_scenarios')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public', 
          table: 'crisis_scenarios'
        },
        (payload) => callback(payload.new as CrisisScenario)
      )
      .subscribe()
  }
}

/**
 * EXPORTS
 */
export default {
  UserProfileQueries,
  CrisisScenarioQueries, 
  UserResponseQueries,
  BulkOperations,
  RealtimeSubscriptions
}