import api from './api'

// Configuration - Le frontend passe par le backend Express qui proxy vers le service IA

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export async function chatWithAI(messages: ChatMessage[], model?: string) {
  try {
    const response = await api.post('/ai/chat', {
      messages,
      model,
      temperature: 0.7,
      max_tokens: 1000,
    })
    return response.data
  } catch (error: any) {
    console.error('Erreur lors de la communication avec l\'IA:', error)
    throw new Error(error?.response?.data?.message || 'Erreur lors de la communication avec l\'IA')
  }
}

export async function extractTextFromFile(file: File) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/ai/extract-text', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error: any) {
    console.error('Erreur lors de l\'extraction du texte:', error)
    throw new Error(error?.response?.data?.message || 'Erreur lors de l\'extraction du texte')
  }
}

export async function analyzeCV(cvText: string, jobDescription?: string) {
  try {
    const response = await api.post('/ai/analyze-cv', {
      cv_text: cvText,
      job_description: jobDescription,
    })
    return response.data
  } catch (error: any) {
    console.error('Erreur lors de l\'analyse du CV:', error)
    throw new Error(error?.response?.data?.message || 'Erreur lors de l\'analyse du CV')
  }
}

export async function generateJobDescription(
  title: string,
  company: string,
  requirements: string[],
  skills: string[]
) {
  try {
    const response = await api.post('/ai/generate-job-description', {
      title,
      company,
      requirements,
      skills,
    })
    return response.data
  } catch (error: any) {
    console.error('Erreur lors de la génération de la description:', error)
    throw new Error(error?.response?.data?.message || 'Erreur lors de la génération de la description')
  }
}

