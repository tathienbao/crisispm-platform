/**
 * CLIENT-SIDE AI CRISIS GENERATOR
 * Calls server-side API to generate AI crisis scenarios
 * Keeps API keys secure on server side
 */

interface CrisisVariables {
  industry: 'tech' | 'healthcare' | 'finance' | 'retail'
  company_size: 'startup' | 'midsize' | 'enterprise'
  severity: 'minor' | 'major' | 'critical'
  timeline: 'hours' | 'days' | 'weeks'
  stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
}

interface GeneratedCrisisContent {
  title: string
  description: string
  context: string
  stakeholders: string
  time_pressure: string
  expert_solution: string
  assessment_criteria: {
    strategy_keywords: string[]
    communication_keywords: string[]
    leadership_keywords: string[]
    execution_keywords: string[]
    category_specific: string[]
  }
}

/**
 * CLIENT-SIDE AI CRISIS GENERATOR
 * Calls server API instead of directly accessing Groq
 */
export class AIClientCrisisGenerator {
  
  /**
   * Generate AI crisis scenario content via server API
   */
  static async generateScenarioContent(params: {
    category: string
    variables: CrisisVariables
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<GeneratedCrisisContent> {
    
    try {
      const response = await fetch('/api/generate-crisis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: params.category,
          difficulty: params.difficulty,
          variables: params.variables
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const aiContent = await response.json()
      return aiContent
      
    } catch (error) {
      console.error('Client AI generation failed:', error)
      
      // Return fallback content if API fails
      return this.generateFallbackContent(params)
    }
  }

  /**
   * Generate fallback content if AI API fails
   */
  private static generateFallbackContent(params: {
    category: string
    variables: CrisisVariables
    difficulty: string
  }): GeneratedCrisisContent {
    
    const companyDesc = this.getCompanyContext(params.variables.company_size, params.variables.industry)
    
    return {
      title: `${params.variables.severity.charAt(0).toUpperCase() + params.variables.severity.slice(1)} ${params.category} Crisis at ${companyDesc}`,
      description: `A ${params.variables.severity} ${params.category} crisis has emerged at ${companyDesc} requiring immediate project management intervention within ${params.variables.timeline}. The situation involves ${params.variables.stakeholder_type} stakeholders and poses significant operational risks.`,
      context: `The ${companyDesc} has been experiencing rapid growth, leading to increased operational complexity. Recent infrastructure changes and team scaling have created potential vulnerabilities that contributed to this crisis.`,
      stakeholders: this.getStakeholdersByType(params.variables.stakeholder_type),
      time_pressure: this.getTimePressureByTimeline(params.variables.timeline),
      expert_solution: `Immediate assessment and crisis command center establishment required. Short-term: Implement containment measures and stakeholder communication plan. Long-term: Root cause analysis and preventive system improvements for ${params.category} challenges.`,
      assessment_criteria: {
        strategy_keywords: ['analysis', 'planning', 'solution', 'prevention', 'root cause'],
        communication_keywords: ['stakeholders', 'transparency', 'updates', 'messaging', 'coordination'],
        leadership_keywords: ['decision making', 'team management', 'accountability', 'vision', 'execution'],
        execution_keywords: ['immediate action', 'timeline', 'resources', 'monitoring', 'follow-up'],
        category_specific: this.getCategorySpecificKeywords(params.category)
      }
    }
  }

  /**
   * Helper methods
   */
  private static getCompanyContext(companySize: string, industry: string): string {
    const sizeDescriptors = {
      startup: 'rapidly growing startup',
      midsize: 'established mid-size company',
      enterprise: 'large enterprise organization'
    }
    
    return `${sizeDescriptors[companySize as keyof typeof sizeDescriptors]} in the ${industry} industry`
  }

  private static getStakeholdersByType(type: string): string {
    const stakeholderMaps = {
      internal: 'Engineering team, Product Manager, DevOps, Executive leadership',
      external: 'Key customers, Partners, Vendors, Industry analysts',
      regulatory: 'Compliance team, Legal counsel, Regulatory bodies, Auditors',
      mixed: 'Internal teams, Key customers, Regulatory bodies, Media contacts'
    }
    
    return stakeholderMaps[type as keyof typeof stakeholderMaps] || stakeholderMaps.mixed
  }

  private static getTimePressureByTimeline(timeline: string): string {
    const pressureMap = {
      hours: 'Immediate action required - every hour of delay increases impact exponentially',
      days: 'Resolution needed within 2-3 days to prevent escalation to crisis level',
      weeks: 'Strategic response required within 1-2 weeks to maintain competitive position'
    }

    return pressureMap[timeline as keyof typeof pressureMap] || pressureMap.days
  }

  private static getCategorySpecificKeywords(category: string): string[] {
    const keywordMap: Record<string, string[]> = {
      technical: ['system recovery', 'technical debt', 'infrastructure', 'monitoring', 'scalability'],
      business: ['market analysis', 'competitive advantage', 'revenue impact', 'partnerships', 'strategy'],
      resource: ['budget management', 'resource allocation', 'vendor management', 'capacity planning'],
      team: ['team dynamics', 'performance management', 'motivation', 'conflict resolution'],
      market: ['customer relations', 'market positioning', 'brand reputation', 'competitive response'],
      regulatory: ['compliance', 'legal requirements', 'audit preparation', 'risk management'],
      financial: ['financial planning', 'cost control', 'budget tracking', 'financial reporting'],
      strategic: ['strategic planning', 'vision alignment', 'change management', 'transformation'],
      operational: ['process optimization', 'operational efficiency', 'supply chain', 'quality control'],
      communication: ['stakeholder engagement', 'crisis communication', 'change communication'],
      quality: ['quality assurance', 'defect management', 'customer satisfaction', 'process improvement'],
      international: ['cultural awareness', 'global coordination', 'localization', 'cross-border'],
      innovation: ['innovation management', 'technology adoption', 'R&D coordination', 'disruption response']
    }
    
    return keywordMap[category] || keywordMap.business
  }
}

export default AIClientCrisisGenerator