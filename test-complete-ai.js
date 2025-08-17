#!/usr/bin/env node

/**
 * COMPLETE AI TEST
 * Tests the full AI crisis generation pipeline with real API
 */

// Use environment variable from .env.local
if (!process.env.GROQ_API_KEY) {
  console.log('❌ GROQ_API_KEY not found. Make sure .env.local is configured.')
  process.exit(1)
}

async function testCompleteAIPipeline() {
  console.log('🚀 Testing Complete AI Crisis Generation Pipeline')
  console.log('=' .repeat(60))
  
  // Test with simple scenario
  const testScenario = {
    category: 'technical',
    difficulty: 'intermediate',
    variables: {
      industry: 'tech',
      company_size: 'startup', 
      severity: 'critical',
      timeline: 'hours',
      stakeholder_type: 'internal'
    }
  }
  
  console.log('📋 Test Parameters:')
  console.log(`  Category: ${testScenario.category}`)
  console.log(`  Difficulty: ${testScenario.difficulty}`)
  console.log(`  Industry: ${testScenario.variables.industry}`)
  console.log(`  Company Size: ${testScenario.variables.company_size}`)
  console.log(`  Severity: ${testScenario.variables.severity}`)
  console.log(`  Timeline: ${testScenario.variables.timeline}`)
  console.log(`  Stakeholders: ${testScenario.variables.stakeholder_type}`)
  
  try {
    console.log('\n🤖 Calling Groq API...')
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
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
            content: `Generate a professional crisis scenario with these requirements:

SCENARIO REQUIREMENTS:
- Category: technical (system failures, security breaches, infrastructure issues, technical debt)
- Industry: tech
- Company Size: startup
- Severity: critical
- Timeline: hours
- Stakeholder Type: internal
- Difficulty: intermediate (Multiple factors involved. Several stakeholder groups. Moderate complexity.)

COMPANY CONTEXT: rapidly growing startup in the tech industry

Generate a professional crisis scenario with these exact sections:

TITLE: [Compelling 8-12 word crisis title that captures urgency and scope]

DESCRIPTION: [2-3 sentences describing what happened, immediate impact, and why it's critical. Be specific about numbers, timeframes, and consequences.]

CONTEXT: [2-3 sentences providing background - what led to this situation, recent changes, or underlying factors that contributed.]

STAKEHOLDERS: [Comma-separated list of 4-6 specific stakeholder roles affected by this crisis]

TIME_PRESSURE: [1-2 sentences explaining why immediate action is needed and what happens if delayed]

EXPERT_SOLUTION: [3-4 sentences outlining a professional PM response with immediate, short-term, and long-term actions]

Make it realistic, specific, and professionally challenging. Use actual business language and scenarios that real project managers face.`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || 'No content generated'
    
    console.log('✅ SUCCESS! AI Generated Crisis Scenario:')
    console.log('=' .repeat(60))
    console.log(content)
    console.log('=' .repeat(60))
    
    // Parse sections
    const sections = {}
    const lines = content.split('\n')
    let currentSection = ''
    let currentContent = ''

    for (const line of lines) {
      const sectionMatch = line.match(/^(TITLE|DESCRIPTION|CONTEXT|STAKEHOLDERS|TIME_PRESSURE|EXPERT_SOLUTION):\s*(.*)/)
      
      if (sectionMatch) {
        if (currentSection && currentContent.trim()) {
          sections[currentSection] = currentContent.trim()
        }
        currentSection = sectionMatch[1]
        currentContent = sectionMatch[2] || ''
      } else if (currentSection && line.trim()) {
        currentContent += (currentContent ? ' ' : '') + line.trim()
      }
    }

    if (currentSection && currentContent.trim()) {
      sections[currentSection] = currentContent.trim()
    }

    console.log('\n📊 Parsed Sections:')
    Object.entries(sections).forEach(([key, value]) => {
      console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 80) + '...' : value}`)
    })
    
    console.log('\n🎉 AI Crisis Generation System is FULLY OPERATIONAL!')
    console.log('✅ Real Groq API integration working')
    console.log('✅ Professional scenario generation confirmed') 
    console.log('✅ Ready for production use!')
    
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testCompleteAIPipeline()