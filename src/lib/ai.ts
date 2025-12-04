import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

// Configuration pour OpenRouter (via proxy ou directement)
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithAI(messages: ChatMessage[], model?: string) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la communication avec l\'IA:', error)
    throw error
  }
}

export async function analyzeCV(cvText: string, jobDescription?: string) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/analyze-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_text: cvText,
        job_description: jobDescription,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de l\'analyse du CV:', error)
    throw error
  }
}

export async function generateJobDescription(
  title: string,
  company: string,
  requirements: string[],
  skills: string[]
) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/generate-job-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        company,
        requirements,
        skills,
      }),
    })

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erreur lors de la génération de la description:', error)
    throw error
  }
}

