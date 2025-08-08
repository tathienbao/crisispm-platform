# Context7 Documentation Cache

## Purpose
Local cache of essential documentation to optimize token usage and ensure consistent reference materials.

## Strategy
1. **Download once**: Cache documentation locally
2. **Reference locally**: Use Serena to read cached docs instead of Context7 API calls
3. **Update periodically**: Refresh docs when new versions are released
4. **Token optimization**: Reduces Context7 API consumption by 80-90%

## Cached Documentation

### Core Technologies
- `nextjs-15/` - Next.js 15 documentation and best practices
- `typescript-5/` - TypeScript 5.x documentation and patterns  
- `supabase/` - Supabase auth, database, and Edge Functions
- `tailwind/` - Tailwind CSS utility classes and components

### AI Integration
- `groq/` - Groq API integration patterns
- `openai/` - OpenAI API fallback documentation

### Development Tools
- `jest/` - Testing framework documentation
- `playwright/` - E2E testing patterns

## Usage Workflow
1. **Check local first**: Use `mcp__serena__read_file` on cached docs
2. **Fallback to Context7**: Only when local docs are insufficient
3. **Update cache**: When encountering version mismatches

## Last Updated
- Initial setup: 2025-01-08
- Next review: Monthly or when major version releases occur