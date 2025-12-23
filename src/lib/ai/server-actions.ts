'use server'

/**
 * Server Action wrapper for AI generation
 * Keeps supabaseAdmin server-side only
 */

import { generateWithFailover } from './failover'

export async function generateAIContent(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  try {
    const result = await generateWithFailover(prompt, options)
    return {
      success: true,
      content: result.content
    }
  } catch (error: any) {
    console.error('[AI Server Action] Generation failed:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate content'
    }
  }
}
