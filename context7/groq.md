# Groq TypeScript SDK Documentation for CrisisPM Platform

## Overview
The Groq TypeScript SDK provides convenient access to the Groq REST API for TypeScript/JavaScript applications. Groq offers high-performance AI model inference, particularly optimized for Llama models. This documentation focuses on integration patterns for the CrisisPM platform's AI assessment system.

## Installation

```bash
npm install groq-sdk
```

## Basic Setup for CrisisPM

### Environment Configuration
```typescript
// Environment variables needed
GROQ_API_KEY=your_groq_api_key_here

// .env.example (already configured in CrisisPM)
GROQ_API_KEY=[needed for AI assessment after validation complete]
```

### Client Initialization
```typescript
import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, // This is the default and can be omitted
});
```

### Next.js Integration (Recommended for CrisisPM)
```typescript
// lib/groq-client.ts
import Groq from 'groq-sdk';

// Singleton pattern for Next.js
let groqClient: Groq | null = null;

export function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
      timeout: 20 * 1000, // 20 seconds timeout
      maxRetries: 2,
    });
  }
  return groqClient;
}
```

## Core Features for CrisisPM

### Chat Completions (Primary Use Case)

#### Basic Chat Completion
```typescript
import { getGroqClient } from '@/lib/groq-client';

const client = getGroqClient();

const chatCompletion = await client.chat.completions.create({
  messages: [
    { role: 'user', content: 'Explain the importance of low latency LLMs' }
  ],
  model: 'llama3-8b-8192',
});

console.log(chatCompletion.choices[0].message.content);
```

#### Crisis Assessment Example
```typescript
interface CrisisAssessmentRequest {
  scenario: string;
  userResponse: string;
  assessmentCriteria: {
    strategy: boolean;
    communication: boolean;
    leadership: boolean;
    execution: boolean;
  };
}

async function assessCrisisResponse(request: CrisisAssessmentRequest) {
  const client = getGroqClient();
  
  const systemPrompt = `You are an expert project management consultant specializing in crisis assessment. 
  Evaluate the user's response to the crisis scenario using these four dimensions:
  1. Strategy (25%): Root cause analysis, solution quality
  2. Communication (25%): Stakeholder messaging, clarity
  3. Leadership (25%): Decision-making, team management
  4. Execution (25%): Timeline, resource allocation
  
  Provide scores from 1-10 for each dimension and specific feedback for improvement.`;

  const userPrompt = `
  Crisis Scenario: ${request.scenario}
  
  User Response: ${request.userResponse}
  
  Please assess this response and provide:
  1. Scores for each dimension (1-10)
  2. Overall score (1-10)
  3. Specific feedback for improvement
  4. What the user did well
  
  Format your response as JSON with this structure:
  {
    "scores": {
      "strategy": 8,
      "communication": 7,
      "leadership": 9,
      "execution": 6
    },
    "overall_score": 7.5,
    "feedback": "Detailed feedback here...",
    "strengths": ["What they did well..."],
    "improvements": ["Specific areas to improve..."]
  }`;

  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-70b-8192', // Use larger model for complex assessments
      temperature: 0.3, // Lower temperature for consistent scoring
      max_tokens: 2000,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Groq assessment error:', error);
    throw error;
  }
}
```

### TypeScript Types for CrisisPM

#### Typed Request Parameters
```typescript
import Groq from 'groq-sdk';

const params: Groq.Chat.CompletionCreateParams = {
  messages: [
    { role: 'system', content: 'You are a helpful PM crisis consultant.' },
    { role: 'user', content: 'Assess this crisis response...' },
  ],
  model: 'llama3-8b-8192',
  temperature: 0.3,
  max_tokens: 1500,
};

const chatCompletion: Groq.Chat.ChatCompletion = await client.chat.completions.create(params);
```

#### CrisisPM Assessment Types
```typescript
// Types for our assessment system
interface GroqAssessmentResponse {
  scores: {
    strategy: number;
    communication: number;
    leadership: number;
    execution: number;
  };
  overall_score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface GroqCrisisRequest {
  scenario: string;
  userResponse: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}
```

## Error Handling for Production

### Comprehensive Error Handling
```typescript
import Groq from 'groq-sdk';

async function robustCrisisAssessment(request: GroqCrisisRequest): Promise<GroqAssessmentResponse> {
  const client = getGroqClient();
  
  try {
    const completion = await client.chat.completions.create({
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: buildUserPrompt(request) }
      ],
      model: 'llama3-70b-8192',
    });

    return parseAssessmentResponse(completion.choices[0].message.content);
    
  } catch (error) {
    if (error instanceof Groq.APIError) {
      console.log('API Error:', {
        status: error.status,
        name: error.name,
        headers: error.headers
      });
      
      // Handle specific error types
      switch (error.status) {
        case 400:
          throw new Error('Invalid request parameters');
        case 401:
          throw new Error('Invalid API key');
        case 429:
          throw new Error('Rate limit exceeded - please try again later');
        case 500:
          throw new Error('Groq service error - please try again');
        default:
          throw new Error(`Groq API error: ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
      throw new Error('Assessment service unavailable');
    }
  }
}
```

## Advanced Configuration

### Retry and Timeout Configuration
```typescript
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  maxRetries: 3, // Retry failed requests 3 times
  timeout: 30 * 1000, // 30 second timeout
});

// Per-request override
await client.chat.completions.create({
  messages: [...],
  model: 'llama3-8b-8192',
}, {
  maxRetries: 5, // Override default retries
  timeout: 15 * 1000, // Override default timeout
});
```

### Custom Fetch for Logging
```typescript
import Groq from 'groq-sdk';

const client = new Groq({
  fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    console.log('Making Groq API request:', url);
    const start = Date.now();
    
    const response = await fetch(url, init);
    
    console.log(`Groq API response: ${response.status} (${Date.now() - start}ms)`);
    return response;
  },
});
```

### Proxy Configuration (Production)
```typescript
import { HttpsProxyAgent } from 'https-proxy-agent';

const client = new Groq({
  httpAgent: new HttpsProxyAgent(process.env.PROXY_URL),
});
```

## Streaming Responses (Future Enhancement)

```typescript
// For real-time feedback in CrisisPM
async function streamAssessment(request: GroqCrisisRequest) {
  const client = getGroqClient();
  
  const stream = await client.chat.completions.create({
    messages: [
      { role: 'system', content: getSystemPrompt() },
      { role: 'user', content: buildUserPrompt(request) }
    ],
    model: 'llama3-8b-8192',
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      // Stream content to frontend
      yield content;
    }
  }
}
```

## Model Selection for CrisisPM

### Available Models and Use Cases
```typescript
const GROQ_MODELS = {
  // Fast, cost-effective for basic assessments
  'llama3-8b-8192': {
    useCase: 'Basic crisis assessments',
    costPerToken: 0.05,
    maxTokens: 8192,
  },
  
  // More sophisticated for complex scenarios
  'llama3-70b-8192': {
    useCase: 'Advanced crisis assessments',
    costPerToken: 0.59,
    maxTokens: 8192,
  },
  
  // Ultra-fast for simple tasks
  'llama3-groq-8b-8192-tool-use-preview': {
    useCase: 'Tool-assisted assessments',
    costPerToken: 0.19,
    maxTokens: 8192,
  }
} as const;

function selectModel(difficulty: string, complexity: 'simple' | 'complex'): string {
  if (difficulty === 'advanced' || complexity === 'complex') {
    return 'llama3-70b-8192';
  }
  return 'llama3-8b-8192';
}
```

## Cost Management

### Token Usage Tracking
```typescript
interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

async function assessWithCostTracking(request: GroqCrisisRequest) {
  const completion = await client.chat.completions.create({
    messages: [...],
    model: 'llama3-8b-8192',
  });
  
  const usage: TokenUsage = completion.usage!;
  const cost = calculateCost(usage, 'llama3-8b-8192');
  
  // Log for cost monitoring
  console.log(`Assessment cost: $${cost.toFixed(4)} (${usage.total_tokens} tokens)`);
  
  return {
    assessment: parseAssessmentResponse(completion.choices[0].message.content),
    cost,
    usage,
  };
}

function calculateCost(usage: TokenUsage, model: string): number {
  const pricePerToken = model === 'llama3-70b-8192' ? 0.59 / 1_000_000 : 0.05 / 1_000_000;
  return usage.total_tokens * pricePerToken;
}
```

## Integration with CrisisPM Database

### Complete Assessment Flow
```typescript
import { createClient } from '@/lib/supabase/client';
import { getGroqClient } from '@/lib/groq-client';

async function processUserResponse(
  userId: string, 
  scenarioId: string, 
  userResponse: string
) {
  const supabase = createClient();
  const groq = getGroqClient();
  
  // 1. Get scenario from database
  const { data: scenario } = await supabase
    .from('crisis_scenarios')
    .select('*')
    .eq('id', scenarioId)
    .single();

  // 2. Assess with Groq
  const assessment = await assessCrisisResponse({
    scenario: scenario.description,
    userResponse,
    assessmentCriteria: {
      strategy: true,
      communication: true,
      leadership: true,
      execution: true,
    }
  });

  // 3. Save to database
  const { data, error } = await supabase
    .from('user_responses')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      response: userResponse,
      total_score: assessment.overall_score,
      strategy_score: assessment.scores.strategy,
      communication_score: assessment.scores.communication,
      leadership_score: assessment.scores.leadership,
      execution_score: assessment.scores.execution,
      feedback: assessment.feedback,
      improvements: assessment.improvements,
      submitted_at: new Date().toISOString(),
    });

  return { assessment, data, error };
}
```

## Best Practices for CrisisPM

1. **Model Selection**: Use `llama3-8b-8192` for most assessments, `llama3-70b-8192` for complex scenarios
2. **Temperature**: Use 0.3-0.5 for consistent scoring, avoid 0.0 for creativity
3. **Token Management**: Monitor usage to stay within budget constraints
4. **Error Handling**: Always implement comprehensive error handling with fallbacks
5. **Caching**: Consider caching assessments for identical responses
6. **Rate Limiting**: Implement client-side rate limiting to avoid API limits
7. **Validation**: Always validate and sanitize Groq responses before saving to database

## Future Enhancements

1. **Function Calling**: Use Groq's tool capabilities for structured assessments
2. **Streaming**: Implement real-time assessment feedback
3. **Fine-tuning**: Custom models trained on PM crisis scenarios
4. **Multi-modal**: Support for audio/visual crisis scenarios
5. **A/B Testing**: Compare different assessment prompts and models

This Groq integration will enable the CrisisPM platform to deliver expert-level AI assessments while maintaining cost efficiency and scalability.