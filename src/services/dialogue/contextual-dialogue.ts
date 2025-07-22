import { FeedItem } from '../../types'
import { openaiService } from '../openai'

export interface MapContext {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  } | null
  center: { lat: number; lng: number } | null
  zoom: number
  visibleProperties: any[]
  activeFilters: {
    zoning: string[]
    economic: string[]
    propertyTypes: string[]
    economicIndicator: string
  }
  currentLocation?: string
}

export interface DialogueContext {
  conversationHistory: ChatMessage[]
  currentMapContext: MapContext
  activeFeedItems: FeedItem[]
  currentAnalysisSession?: string
  userIntent?: 'search' | 'analyze' | 'compare' | 'report'
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  mapActions?: MapAction[]
  feedItems?: FeedItem[]
}

export interface MapAction {
  type: 'flyTo' | 'applyFilters' | 'highlightArea' | 'addProperty' | 'showOverlay'
  payload: any
}

export interface DialogueResponse {
  message: string
  mapActions?: MapAction[]
  feedItems?: FeedItem[]
  suggestions?: string[]
  analysisType?: 'property' | 'market' | 'comparative' | 'investment'
}

export class ContextualDialogueService {
  private conversationHistory: ChatMessage[] = []
  private currentContext: DialogueContext | null = null

  async processDialogue(
    userMessage: string,
    mapContext: MapContext,
    feedItems: FeedItem[]
  ): Promise<DialogueResponse> {
    // Update context
    this.currentContext = {
      conversationHistory: this.conversationHistory,
      currentMapContext: mapContext,
      activeFeedItems: feedItems,
      userIntent: this.detectUserIntent(userMessage)
    }

    // Build rich context prompt
    const contextPrompt = this.buildContextPrompt(userMessage, mapContext, feedItems)
    
    try {
      const response = await openaiService.chat(contextPrompt)
      
      // Parse response and extract actions
      const dialogueResponse = this.parseDialogueResponse(response, mapContext)
      
      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      })
      
      this.conversationHistory.push({
        role: 'assistant',
        content: dialogueResponse.message,
        timestamp: new Date(),
        mapActions: dialogueResponse.mapActions,
        feedItems: dialogueResponse.feedItems
      })
      
      return dialogueResponse
    } catch (error) {
      console.error('Error processing dialogue:', error)
      return {
        message: 'I apologize, but I encountered an error processing your request. Please try again.',
        suggestions: ['Try a different search term', 'Check your internet connection']
      }
    }
  }

  private detectUserIntent(message: string): 'search' | 'analyze' | 'compare' | 'report' {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('look for')) {
      return 'search'
    }
    if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis') || lowerMessage.includes('evaluate')) {
      return 'analyze'
    }
    if (lowerMessage.includes('compare') || lowerMessage.includes('versus') || lowerMessage.includes('vs')) {
      return 'compare'
    }
    if (lowerMessage.includes('report') || lowerMessage.includes('summary') || lowerMessage.includes('generate')) {
      return 'report'
    }
    
    return 'search' // default
  }

  private buildContextPrompt(
    userMessage: string,
    mapContext: MapContext,
    feedItems: FeedItem[]
  ): string {
    const contextInfo = {
      location: mapContext.currentLocation || 'Unknown',
      bounds: mapContext.bounds,
      zoom: mapContext.zoom,
      activeFilters: mapContext.activeFilters,
      visibleProperties: mapContext.visibleProperties.length,
      feedItems: feedItems.length,
      recentSearches: feedItems.filter(item => item.type === 'address').slice(0, 3)
    }

    return `You are a commercial real estate AI assistant for RealGlobal, a professional dialogue-based platform.

CURRENT CONTEXT:
- Location: ${contextInfo.location}
- Map Zoom: ${contextInfo.zoom}
- Visible Properties: ${contextInfo.visibleProperties}
- Active Filters: ${JSON.stringify(contextInfo.activeFilters)}
- Feed Items: ${contextInfo.feedItems}
- Recent Searches: ${contextInfo.recentSearches.map(item => item.title).join(', ')}

CONVERSATION HISTORY:
${this.conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CAPABILITIES:
- Search for commercial and multifamily properties
- Analyze market conditions and investment opportunities
- Compare properties and market areas
- Generate professional reports and insights
- Navigate the map to specific locations
- Apply filters for property types and zoning

RESPONSE FORMAT:
Provide conversational, professional responses focused on commercial real estate. If the user asks for:
- SEARCH: Help find properties or locations
- ANALYSIS: Provide market insights and investment metrics
- COMPARISON: Compare properties or areas
- REPORTS: Offer to generate professional analysis

USER MESSAGE: "${userMessage}"

Respond naturally and professionally, offering specific actions when appropriate.`
  }

  private parseDialogueResponse(
    response: string,
    mapContext: MapContext
  ): DialogueResponse {
    const dialogueResponse: DialogueResponse = {
      message: response,
      mapActions: [],
      feedItems: [],
      suggestions: []
    }

    // Extract location mentions and create flyTo actions
    const locationRegex = /(?:go to|navigate to|show me|fly to)\s+([^.!?]+)/gi
    const locationMatches = response.matchAll(locationRegex)
    
    for (const match of locationMatches) {
      const location = match[1].trim()
      dialogueResponse.mapActions?.push({
        type: 'flyTo',
        payload: { location }
      })
    }

    // Extract filter suggestions
    const filterRegex = /(?:filter|show|display)\s+(commercial|multifamily|industrial|office|retail)/gi
    const filterMatches = response.matchAll(filterRegex)
    
    for (const match of filterMatches) {
      const propertyType = match[1].toLowerCase()
      dialogueResponse.mapActions?.push({
        type: 'applyFilters',
        payload: { propertyTypes: [propertyType] }
      })
    }

    // Extract zone overlay suggestions
    const zoneRegex = /(?:show|display|enable)\s+(commercial zones|multifamily zones|opportunity zones)/gi
    const zoneMatches = response.matchAll(zoneRegex)
    
    for (const match of zoneMatches) {
      const zoneType = match[1].toLowerCase().replace(' ', '-')
      dialogueResponse.mapActions?.push({
        type: 'showOverlay',
        payload: { overlayType: zoneType }
      })
    }

    // Generate suggestions based on context
    if (mapContext.visibleProperties.length > 0) {
      dialogueResponse.suggestions = [
        'Analyze visible properties',
        'Compare market areas',
        'Generate investment report'
      ]
    } else {
      dialogueResponse.suggestions = [
        'Search for properties',
        'Explore market areas',
        'Apply property filters'
      ]
    }

    return dialogueResponse
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory
  }

  clearConversation(): void {
    this.conversationHistory = []
    this.currentContext = null
  }
}

export const contextualDialogueService = new ContextualDialogueService()