/**
 * AI-POWERED CRISIS CONTENT GENERATOR
 * Generates dynamic crisis scenarios using AI based on algorithmic parameters
 * 
 * Maintains the mathematical uniqueness of the crisis-engine while providing
 * unlimited unique content through AI generation instead of static templates.
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
 * AI CONTENT GENERATOR CLASS
 * Uses Groq API to generate professional crisis scenarios
 */
export class AICrisisContentGenerator {
  private static readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
  
  /**
   * Generate complete crisis scenario content using AI
   */
  static async generateScenarioContent(params: {
    category: string
    variables: CrisisVariables
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }): Promise<GeneratedCrisisContent> {
    
    const prompt = this.buildPrompt(params.category, params.variables, params.difficulty)
    
    try {
      const response = await this.callGroqAPI(prompt)
      const content = this.parseAIResponse(response)
      
      // Validate and enhance the generated content
      return this.validateAndEnhanceContent(content, params)
      
    } catch (error) {
      console.error('AI content generation failed:', error)
      // Fallback to template-based generation if AI fails
      return this.generateFallbackContent(params)
    }
  }

  /**
   * Build comprehensive prompt for AI scenario generation
   */
  private static buildPrompt(category: string, variables: CrisisVariables, difficulty: string): string {
    const categoryDescriptions = {
      technical: 'system failures, security breaches, infrastructure issues, technical debt',
      business: 'competitor threats, partnerships, market changes, strategic challenges',
      resource: 'budget cuts, staff departures, vendor issues, capacity constraints',
      team: 'burnout, conflicts, performance issues, leadership challenges',
      market: 'customer complaints, regulatory changes, market disruption',
      regulatory: 'legal issues, compliance violations, audit findings',
      financial: 'cash flow problems, budget overruns, financial reporting issues',
      strategic: 'pivot decisions, positioning challenges, growth obstacles',
      operational: 'supply chain issues, process breakdowns, quality problems',
      communication: 'PR crises, stakeholder management, information flow issues',
      quality: 'product defects, service failures, reputation damage',
      international: 'cultural issues, global expansion challenges, cross-border problems',
      innovation: 'R&D failures, technology pivots, competitive disruption'
    }

    const difficultyGuidance = {
      beginner: 'Clear cause and solution path. Single stakeholder group. Limited scope.',
      intermediate: 'Multiple factors involved. Several stakeholder groups. Moderate complexity.',
      advanced: 'Complex interdependencies. Multiple competing priorities. High ambiguity.'
    }

    const companyContext = this.getCompanyContext(variables.company_size, variables.industry)
    
    return `You are an expert project management consultant creating realistic crisis scenarios for training purposes.

SCENARIO REQUIREMENTS:
- Category: ${category} (${categoryDescriptions[category as keyof typeof categoryDescriptions]})
- Industry: ${variables.industry}
- Company Size: ${variables.company_size}
- Severity: ${variables.severity}
- Timeline: ${variables.timeline}
- Stakeholder Type: ${variables.stakeholder_type}
- Difficulty: ${difficulty} (${difficultyGuidance[difficulty as keyof typeof difficultyGuidance]})

COMPANY CONTEXT: ${companyContext}

Generate a professional crisis scenario with these exact sections:

TITLE: [Compelling 8-12 word crisis title that captures urgency and scope]

DESCRIPTION: [2-3 sentences describing what happened, immediate impact, and why it's critical. Be specific about numbers, timeframes, and consequences.]

CONTEXT: [2-3 sentences providing background - what led to this situation, recent changes, or underlying factors that contributed.]

STAKEHOLDERS: [Comma-separated list of 4-6 specific stakeholder roles affected by this crisis]

TIME_PRESSURE: [1-2 sentences explaining why immediate action is needed and what happens if delayed]

EXPERT_SOLUTION: [3-4 sentences outlining a professional PM response with immediate, short-term, and long-term actions]

ASSESSMENT_CRITERIA: [JSON object with arrays of keywords for strategy, communication, leadership, execution, and category-specific skills]

Make it realistic, specific, and professionally challenging. Use actual business language and scenarios that real project managers face.`
  }

  /**
   * Call Groq API for content generation
   */
  private static async callGroqAPI(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY
    
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }

    const response = await fetch(this.GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert project management consultant with 20+ years of experience in crisis management across various industries.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8, // Good balance of creativity and consistency
        max_tokens: 1500,
        top_p: 0.9
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  /**
   * Parse AI response into structured content
   */
  private static parseAIResponse(response: string): GeneratedCrisisContent {
    const sections = this.extractSections(response)
    
    return {
      title: sections.TITLE || 'Crisis Management Challenge',
      description: sections.DESCRIPTION || 'A critical situation requiring immediate project management intervention.',
      context: sections.CONTEXT || 'Background information not available.',
      stakeholders: sections.STAKEHOLDERS || 'Project team, management, customers',
      time_pressure: sections.TIME_PRESSURE || 'Immediate action required to prevent escalation.',
      expert_solution: sections.EXPERT_SOLUTION || 'Assess situation, communicate with stakeholders, implement corrective measures.',
      assessment_criteria: this.parseAssessmentCriteria(sections.ASSESSMENT_CRITERIA)
    }
  }

  /**
   * Extract sections from AI response
   */
  private static extractSections(response: string): Record<string, string> {
    const sections: Record<string, string> = {}
    const lines = response.split('\n')
    let currentSection = ''
    let currentContent = ''

    for (const line of lines) {
      const sectionMatch = line.match(/^(TITLE|DESCRIPTION|CONTEXT|STAKEHOLDERS|TIME_PRESSURE|EXPERT_SOLUTION|ASSESSMENT_CRITERIA):\s*(.*)/)
      
      if (sectionMatch) {
        // Save previous section
        if (currentSection && currentContent.trim()) {
          sections[currentSection] = currentContent.trim()
        }
        
        // Start new section
        currentSection = sectionMatch[1]
        currentContent = sectionMatch[2] || ''
      } else if (currentSection && line.trim()) {
        currentContent += (currentContent ? ' ' : '') + line.trim()
      }
    }

    // Save last section
    if (currentSection && currentContent.trim()) {
      sections[currentSection] = currentContent.trim()
    }

    return sections
  }

  /**
   * Parse assessment criteria from AI response
   */
  private static parseAssessmentCriteria(criteriaText: string): GeneratedCrisisContent['assessment_criteria'] {
    const defaultCriteria = {
      strategy_keywords: ['analysis', 'planning', 'solution', 'prevention', 'root cause'],
      communication_keywords: ['stakeholders', 'transparency', 'updates', 'messaging', 'coordination'],
      leadership_keywords: ['decision making', 'team management', 'accountability', 'vision', 'execution'],
      execution_keywords: ['immediate action', 'timeline', 'resources', 'monitoring', 'follow-up'],
      category_specific: ['crisis management', 'problem solving', 'risk assessment']
    }

    try {
      // Try to parse as JSON if provided
      if (criteriaText?.includes('{')) {
        const parsed = JSON.parse(criteriaText)
        return { ...defaultCriteria, ...parsed }
      }
    } catch (error) {
      console.warn('Could not parse assessment criteria, using defaults')
    }

    return defaultCriteria
  }

  /**
   * Validate and enhance generated content
   */
  private static validateAndEnhanceContent(
    content: GeneratedCrisisContent, 
    params: { category: string; variables: CrisisVariables; difficulty: string }
  ): GeneratedCrisisContent {
    
    // Ensure minimum content quality
    if (content.title.length < 10) {
      content.title = `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Crisis at ${params.variables.company_size} ${params.variables.industry} Company`
    }

    if (content.description.length < 50) {
      content.description = `A ${params.variables.severity} ${params.category} crisis has emerged affecting operations. Immediate intervention required within ${params.variables.timeline}.`
    }

    // Add category-specific keywords
    const categoryKeywords = this.getCategorySpecificKeywords(params.category)
    content.assessment_criteria.category_specific = [
      ...content.assessment_criteria.category_specific,
      ...categoryKeywords
    ].slice(0, 8) // Limit to 8 keywords

    return content
  }

  /**
   * Generate fallback content if AI fails
   */
  private static generateFallbackContent(params: {
    category: string
    variables: CrisisVariables
    difficulty: string
  }): GeneratedCrisisContent {
    
    const companyDesc = this.getCompanyContext(params.variables.company_size, params.variables.industry)
    
    return {
      title: `${params.variables.severity.charAt(0).toUpperCase() + params.variables.severity.slice(1)} ${params.category} Crisis`,
      description: `A ${params.variables.severity} ${params.category} issue has emerged at ${companyDesc} requiring immediate attention within ${params.variables.timeline}.`,
      context: `The situation developed due to various operational factors and requires systematic project management intervention.`,
      stakeholders: this.getStakeholdersByType(params.variables.stakeholder_type),
      time_pressure: `Resolution needed within ${params.variables.timeline} to prevent escalation and minimize business impact.`,
      expert_solution: `Immediate assessment and communication with stakeholders, followed by systematic problem resolution and preventive measures.`,
      assessment_criteria: {
        strategy_keywords: ['analysis', 'planning', 'solution', 'prevention'],
        communication_keywords: ['stakeholders', 'transparency', 'updates', 'messaging'],
        leadership_keywords: ['decision making', 'team management', 'accountability'],
        execution_keywords: ['immediate action', 'timeline', 'resources', 'monitoring'],
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

/**
 * EXPORT FOR CRISIS ENGINE INTEGRATION
 */
export default AICrisisContentGenerator