/**
 * API ROUTE: Generate AI Crisis Scenario
 * Server-side endpoint to generate crisis scenarios using Groq API
 * Keeps API key secure on server side
 */

import { NextRequest, NextResponse } from 'next/server'
import { AICrisisContentGenerator } from '@/lib/ai-content-generator'

interface GenerateRequestBody {
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  variables: {
    industry: 'tech' | 'healthcare' | 'finance' | 'retail'
    company_size: 'startup' | 'midsize' | 'enterprise'
    severity: 'minor' | 'major' | 'critical'
    timeline: 'hours' | 'days' | 'weeks'
    stakeholder_type: 'internal' | 'external' | 'regulatory' | 'mixed'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequestBody = await request.json()
    
    // Validate request body
    if (!body.category || !body.difficulty || !body.variables) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Generate AI content using server-side API key
    const aiContent = await AICrisisContentGenerator.generateScenarioContent({
      category: body.category,
      variables: body.variables,
      difficulty: body.difficulty
    })

    return NextResponse.json(aiContent)
    
  } catch (error) {
    console.error('Error generating AI crisis scenario:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}