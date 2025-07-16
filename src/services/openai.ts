import OpenAI from 'openai'
import { Coordinates, FilterState } from '../types'

const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY

// Create OpenAI client with fallback
const createOpenAIClient = () => {
  if (!openaiApiKey) {
    console.warn('Missing OpenAI API key. AI features will be disabled.')
    return null
  }
  
  return new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
  })
}

const openai = createOpenAIClient()

export interface AIReportRequest {
  coordinates: Coordinates[]
  filters: FilterState
  regionName?: string
}

export interface AIReportResponse {
  id: string
  region: string
  coordinates: Coordinates[]
  summary: string
  developmentOpportunities: string[]
  permitRequirements: string[]
  governingBodies: string[]
  estimatedCost: number
  estimatedROI: number
  risks: string[]
  recommendations: string[]
  generatedAt: string
}

export interface ChatRequest {
  message: string
  context?: string
  address?: string
  conversationHistory?: Array<{ text: string; sender: 'user' | 'assistant' }>
}

export interface ChatResponse {
  response: string
  detectedLocation?: {
    address: string
    coordinates: { lat: number; lng: number }
  }
}

export const generateChatResponse = async (request: ChatRequest): Promise<ChatResponse> => {
  if (!openai) {
    // Return intelligent fallback responses without API
    return generateFallbackResponse(request)
  }

  try {
    const { message, context, address, conversationHistory } = request
    
    // Build context from conversation history
    const contextMessages = conversationHistory?.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.text
    })) || []
    
    const systemPrompt = `You are a real estate AI assistant specializing in property research, market analysis, and location intelligence. You help users:

1. Research properties and markets
2. Analyze investment opportunities
3. Understand zoning and development potential
4. Find addresses and navigate locations
5. Explain real estate concepts and trends

Key capabilities:
- Property valuation and market analysis
- Opportunity zone identification and benefits
- Zoning and development guidance
- Location-based insights
- Investment strategy recommendations

Be conversational, helpful, and always relate responses back to real estate and property investment. Keep responses concise but informative.

${address ? `The user mentioned this address: ${address}` : ''}
${context ? `Context: ${context}` : ''}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use faster, cheaper model for chat
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages.slice(-6), // Last 6 messages for context
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500 // Keep responses concise
    })

    const response = completion.choices[0]?.message?.content || 'I apologize, but I could not process your request at this time.'
    
    return {
      response,
      detectedLocation: address ? {
        address,
        coordinates: { lat: 40.7128, lng: -74.0060 } // Mock coordinates
      } : undefined
    }

  } catch (error) {
    console.error('Error generating chat response:', error)
    return generateFallbackResponse(request)
  }
}

const generateFallbackResponse = (request: ChatRequest): ChatResponse => {
  const { message, address } = request
  const lowerMessage = message.toLowerCase()
  
  if (address) {
    return {
      response: `I found the address "${address}". Let me show you that location on the globe. This area might have interesting real estate opportunities - would you like me to analyze the market conditions, zoning information, or investment potential for this location?`,
      detectedLocation: {
        address,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      }
    }
  }
  
  if (lowerMessage.includes('market') || lowerMessage.includes('price') || lowerMessage.includes('value')) {
    return {
      response: `I can help you analyze real estate markets and property values. Try asking about specific locations like "What's the market like in Austin, Texas?" or "Show me property values in Manhattan". I can also help you understand investment opportunities and market trends.`
    }
  }
  
  if (lowerMessage.includes('opportunity zone') || lowerMessage.includes('tax incentive')) {
    return {
      response: `Opportunity Zones offer significant tax benefits for real estate investments. I can help you identify zones on the map and explain the investment advantages. Would you like me to show you opportunity zones in a specific area?`
    }
  }
  
  if (lowerMessage.includes('zoning') || lowerMessage.includes('development')) {
    return {
      response: `I can help you understand zoning regulations and development potential. Try asking about specific areas like "What are the zoning rules in downtown Denver?" or "Can I build commercial property in this area?"`
    }
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return {
      response: `Hello! I'm your real estate AI assistant. I can help you research properties, analyze markets, find investment opportunities, and explore locations on the globe. What would you like to know about real estate today?`
    }
  }
  
  return {
    response: `I'm here to help you research real estate markets, analyze properties, and explore investment opportunities. Try asking about specific locations, market conditions, or property types. You can also search for any address to view it on the globe.`
  }
}

export const generateAIReport = async (request: AIReportRequest): Promise<AIReportResponse> => {
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.')
  }

  try {
    const { coordinates, filters, regionName } = request
    
    // Create a comprehensive prompt for the AI
    const prompt = `
You are a real estate development expert analyzing a geographic region for development opportunities.

Region: ${regionName || 'Selected Area'}
Coordinates: ${JSON.stringify(coordinates)}
Active Filters: ${JSON.stringify(filters)}

Please provide a comprehensive development analysis including:

1. Executive Summary (2-3 sentences)
2. Development Opportunities (3-5 bullet points)
3. Permit Requirements (3-5 bullet points)
4. Governing Bodies to contact (3-5 entities)
5. Estimated Development Cost (number only, in USD)
6. Estimated ROI percentage (number only)
7. Key Risks (3-5 bullet points)
8. Strategic Recommendations (3-5 bullet points)

Format your response as a JSON object with these exact keys:
{
  "summary": "string",
  "developmentOpportunities": ["string"],
  "permitRequirements": ["string"],
  "governingBodies": ["string"],
  "estimatedCost": number,
  "estimatedROI": number,
  "risks": ["string"],
  "recommendations": ["string"]
}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional real estate development consultant with expertise in zoning, permitting, and market analysis. Provide practical, actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText)

    return {
      id: `report-${Date.now()}`,
      region: regionName || 'Selected Area',
      coordinates,
      summary: parsedResponse.summary,
      developmentOpportunities: parsedResponse.developmentOpportunities,
      permitRequirements: parsedResponse.permitRequirements,
      governingBodies: parsedResponse.governingBodies,
      estimatedCost: parsedResponse.estimatedCost,
      estimatedROI: parsedResponse.estimatedROI,
      risks: parsedResponse.risks,
      recommendations: parsedResponse.recommendations,
      generatedAt: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error generating AI report:', error)
    throw new Error('Failed to generate AI report. Please try again.')
  }
}

// Export service object for use in other modules
export const openaiService = {
  chat: async (prompt: string): Promise<string> => {
    if (!openai) {
      return 'AI features are currently unavailable. Please configure your OpenAI API key.'
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional commercial real estate assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      return completion.choices[0]?.message?.content || 'I apologize, but I could not process your request.'
    } catch (error) {
      console.error('OpenAI API error:', error)
      return 'I apologize, but I encountered an error processing your request.'
    }
  },

  generateChatResponse,
  generateAIReport
} 