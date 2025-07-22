import React, { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Send, Search, Building, Mic, MicOff, Command, Sparkles, 
  TrendingUp, BarChart3, MapPin, Filter, Star, Settings,
  ArrowRight, Lightbulb, Zap, Target, Brain, MessageSquare
} from 'lucide-react'
import { useAnimations, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'
import { usePortfolio } from './PortfolioSystem'
import { freePropertyDataService, FreePropertyListing } from '../services/freePropertyData'
import { financialMarketDataService } from '../services/financialMarketData'

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  actions?: ChatAction[]
  data?: any
}

interface ChatAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
}

interface EnhancedAIChatInterfaceProps {
  onSearch?: (query: string) => void
  onAddressDetected: (address: string, coordinates: { lat: number; lng: number }) => void
  onFeedToggle?: () => void
  isFeedVisible?: boolean
  onPropertyFound?: (properties: FreePropertyListing[]) => void
  onFiltersChange?: (filters: any) => void
  onPortfolioAction?: (action: string, data?: any) => void
  workspaceItemCount?: number
  selectedItemCount?: number
}

// Natural language command patterns
const COMMAND_PATTERNS = {
  // Property Search
  search: [
    /find (.*) properties? in (.*)/i,
    /search for (.*) near (.*)/i,
    /show me (.*) properties/i,
    /look for (.*) in (.*)/i
  ],
  
  // Portfolio Management
  portfolio: [
    /add (.*) to portfolio/i,
    /analyze (my )?portfolio/i,
    /show portfolio performance/i,
    /portfolio report/i,
    /calculate portfolio risk/i,
    /rebalance portfolio/i
  ],
  
  // Filtering
  filter: [
    /filter by (.*)/i,
    /show only (.*)/i,
    /properties with (.*)/i,
    /cap rate above (.*)/i,
    /price under (.*)/i,
    /cash flow over (.*)/i
  ],
  
  // Market Analysis
  market: [
    /market trends in (.*)/i,
    /what's the market like in (.*)/i,
    /interest rates/i,
    /reit performance/i,
    /economic indicators/i,
    /market sentiment/i
  ],
  
  // Comparison
  compare: [
    /compare (.*)/i,
    /which is better/i,
    /difference between (.*) and (.*)/i
  ],
  
  // Analytics
  analytics: [
    /calculate (.*)/i,
    /what's the (.*) of (.*)/i,
    /roi on (.*)/i,
    /cap rate for (.*)/i,
    /cash flow from (.*)/i
  ]
}

const EnhancedAIChatInterface: React.FC<EnhancedAIChatInterfaceProps> = ({
  onSearch,
  onAddressDetected,
  onFeedToggle,
  isFeedVisible = true,
  onPropertyFound,
  onFiltersChange,
  onPortfolioAction,
  workspaceItemCount = 0,
  selectedItemCount = 0
}) => {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [lastCommand, setLastCommand] = useState<string>('')
  
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const recognition = useRef<any>(null)
  
  const { portfolioStats, addToPortfolio, getRecommendations } = usePortfolio()
  
  useAnimations()
  useGlassEffects()

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = false
      recognition.current.interimResults = false
      recognition.current.lang = 'en-US'
      
      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
        // Auto-submit voice commands
        setTimeout(() => handleSubmit(new Event('submit') as any), 500)
      }
      
      recognition.current.onerror = () => {
        setIsListening(false)
      }
      
      recognition.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  // Add welcome message
  useEffect(() => {
    if (messages.length === 0) {
      addMessage('ai', 'Hi! I\'m your AI real estate assistant. I can help you search properties, analyze your portfolio, find market trends, and much more. Try saying something like "Find commercial properties in Austin" or "Analyze my portfolio performance".')
    }
  }, [])

  const addMessage = (type: 'user' | 'ai' | 'system', content: string, actions?: ChatAction[], data?: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      actions,
      data
    }
    setMessages(prev => [...prev, message])
  }

  // Smart contextual suggestions based on current state
  const getSmartSuggestions = () => {
    const suggestions = []
    
    if (workspaceItemCount === 0) {
      suggestions.push(
        { text: "Find commercial properties in Austin", category: "search" },
        { text: "Show opportunity zones in Denver", category: "search" },
        { text: "What are current interest rates?", category: "market" },
        { text: "Search multifamily properties near downtown", category: "search" }
      )
    } else if (selectedItemCount >= 2) {
      suggestions.push(
        { text: "Compare selected properties", category: "analytics" },
        { text: "Which property has better cash flow?", category: "analytics" },
        { text: "Add best property to portfolio", category: "portfolio" },
        { text: "Generate investment analysis", category: "analytics" }
      )
    } else if (workspaceItemCount > 0) {
      suggestions.push(
        { text: "Find similar properties", category: "search" },
        { text: "Analyze market trends for this area", category: "market" },
        { text: "Add to portfolio", category: "portfolio" },
        { text: "Calculate ROI for this property", category: "analytics" }
      )
    }

    if (portfolioStats.propertyCount > 0) {
      suggestions.push(
        { text: "Show portfolio performance", category: "portfolio" },
        { text: "What's my portfolio risk level?", category: "analytics" },
        { text: "Get rebalancing recommendations", category: "portfolio" }
      )
    }
    
    return suggestions
  }

  // Enhanced command parsing with natural language understanding
  const parseCommand = (input: string): { type: string; params: any } => {
    const lowerInput = input.toLowerCase()
    
    // Property Search
    for (const pattern of COMMAND_PATTERNS.search) {
      const match = lowerInput.match(pattern)
      if (match) {
        return {
          type: 'search',
          params: {
            propertyType: match[1],
            location: match[2] || match[1],
            query: input
          }
        }
      }
    }
    
    // Portfolio Commands
    for (const pattern of COMMAND_PATTERNS.portfolio) {
      if (pattern.test(lowerInput)) {
        if (lowerInput.includes('analyze') || lowerInput.includes('performance')) {
          return { type: 'portfolioAnalysis', params: {} }
        }
        if (lowerInput.includes('report')) {
          return { type: 'portfolioReport', params: {} }
        }
        if (lowerInput.includes('risk')) {
          return { type: 'portfolioRisk', params: {} }
        }
        if (lowerInput.includes('rebalance')) {
          return { type: 'portfolioRebalance', params: {} }
        }
        return { type: 'portfolio', params: { action: 'general' } }
      }
    }
    
    // Filter Commands
    for (const pattern of COMMAND_PATTERNS.filter) {
      const match = lowerInput.match(pattern)
      if (match) {
        return {
          type: 'filter',
          params: {
            filterType: match[1],
            query: input
          }
        }
      }
    }
    
    // Market Analysis
    for (const pattern of COMMAND_PATTERNS.market) {
      const match = lowerInput.match(pattern)
      if (match) {
        return {
          type: 'market',
          params: {
            location: match[1] || 'general',
            query: input
          }
        }
      }
    }
    
    // Comparison
    for (const pattern of COMMAND_PATTERNS.compare) {
      if (pattern.test(lowerInput)) {
        return {
          type: 'compare',
          params: { query: input }
        }
      }
    }
    
    // Analytics
    for (const pattern of COMMAND_PATTERNS.analytics) {
      const match = lowerInput.match(pattern)
      if (match) {
        return {
          type: 'analytics',
          params: {
            metric: match[1],
            subject: match[2] || 'portfolio',
            query: input
          }
        }
      }
    }
    
    return { type: 'search', params: { query: input } }
  }

  // Execute parsed commands
  const executeCommand = async (command: { type: string; params: any }) => {
    setIsLoading(true)
    
    try {
      switch (command.type) {
        case 'search':
          await handlePropertySearch(command.params)
          break
          
        case 'portfolioAnalysis':
          await handlePortfolioAnalysis()
          break
          
        case 'portfolioReport':
          await handlePortfolioRisk()
          break
          
        case 'portfolioRisk':
          await handlePortfolioRisk()
          break
          
        case 'market':
          await handleMarketAnalysis(command.params)
          break
          
        case 'filter':
          await handleFilterCommand(command.params)
          break
          
        case 'compare':
          await handleComparison()
          break
          
        case 'analytics':
          await handleAnalytics(command.params)
          break
          
        default:
          await handlePropertySearch(command.params)
      }
    } catch (error) {
      addMessage('ai', 'Sorry, I encountered an error processing your request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Command handlers
  const handlePropertySearch = async (params: any) => {
    const { propertyType, location, query } = params
    
    addMessage('ai', `Searching for ${propertyType || 'properties'} ${location ? `in ${location}` : ''}...`)
    
    try {
      // Geocode location first
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(location || query)}.json?key=sv3rWFwpQy2TinWkmW24&limit=1`
      )
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        const [lng, lat] = feature.center
        
        onAddressDetected(feature.place_name || feature.text, { lat, lng })
        
        // Search for properties
        const properties = await freePropertyDataService.searchDomesticProperties({
          location: { lat, lng },
          radius: 5,
          country: 'US'
        })
        
        if (properties.length > 0) {
          onPropertyFound?.(properties)
          
          const actions: ChatAction[] = [
            {
              id: 'view-map',
              label: 'View on Map',
              icon: <MapPin className="w-4 h-4" />,
              action: () => onAddressDetected(feature.place_name, { lat, lng }),
              variant: 'primary'
            },
            {
              id: 'filter-results',
              label: 'Refine Search',
              icon: <Filter className="w-4 h-4" />,
              action: () => addMessage('ai', 'What specific criteria would you like to filter by? (e.g., "price under $500k", "cap rate above 8%")'),
              variant: 'secondary'
            }
          ]
          
          addMessage('ai', `Found ${properties.length} properties in ${feature.place_name}. The properties are now displayed on the map and in your workspace.`, actions)
        } else {
          addMessage('ai', `No properties found in ${feature.place_name}. Try searching in a nearby area or different property type.`)
        }
      }
    } catch (error) {
      addMessage('ai', 'Unable to search properties at this location. Please try a different search.')
    }
  }

  const handlePortfolioAnalysis = async () => {
    if (portfolioStats.propertyCount === 0) {
      addMessage('ai', 'Your portfolio is empty. Add some properties first to see analysis.')
      return
    }
    
    const analysis = `📊 **Portfolio Analysis**

**Performance Metrics:**
• Total Value: $${portfolioStats.totalValue.toLocaleString()}
• Properties: ${portfolioStats.propertyCount}
• Average Cap Rate: ${portfolioStats.avgCapRate.toFixed(2)}%
• Sharpe Ratio: ${portfolioStats.sharpeRatio.toFixed(2)}
• Risk Score: ${portfolioStats.riskMetrics.overallRiskScore.toFixed(1)}/100

**Risk Assessment:**
• Geographic Diversification: ${portfolioStats.geographicDiversification.herfindahlIndex.toFixed(1)}/100
• Property Type Diversity: ${portfolioStats.propertyTypeDiversification.typesCount} types
• Concentration Risk: ${portfolioStats.riskMetrics.concentrationRisk.toFixed(1)}%

**Recommendations:**
${getRecommendations().slice(0, 3).map(rec => `• ${rec.content}`).join('\n')}`

    const actions: ChatAction[] = [
      {
        id: 'view-dashboard',
        label: 'Open Dashboard',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => onPortfolioAction?.('openDashboard'),
        variant: 'primary'
      },
      {
        id: 'export-report',
        label: 'Export Report',
        icon: <ArrowRight className="w-4 h-4" />,
        action: () => onPortfolioAction?.('exportReport'),
        variant: 'secondary'
      }
    ]
    
    addMessage('ai', analysis, actions)
  }

  const handleMarketAnalysis = async (params: any) => {
    addMessage('ai', 'Analyzing current market conditions...')
    
    try {
      const marketData = await financialMarketDataService.getMarketContext()
      const healthScore = await financialMarketDataService.getMarketHealthScore()
      
      const analysis = `🏦 **Market Analysis**

**Interest Rates:**
• Federal Funds Rate: ${marketData.interestRates.federalFundsRate}%
• 30-Year Mortgage: ${marketData.interestRates.mortgageRate30Year}%
• Commercial Lending: ${marketData.interestRates.commercialLendingRate}%

**REIT Performance:**
• Average Performance: ${marketData.reitPerformance.reduce((sum, reit) => sum + reit.changePercent, 0) / marketData.reitPerformance.length > 0 ? '+' : ''}${(marketData.reitPerformance.reduce((sum, reit) => sum + reit.changePercent, 0) / marketData.reitPerformance.length).toFixed(2)}%

**Market Health Score: ${healthScore.score}/100**
${healthScore.recommendation}

**Key Economic Indicators:**
${marketData.economicIndicators.slice(0, 3).map(indicator => 
  `• ${indicator.indicator}: ${indicator.value}${indicator.unit} (${indicator.changePercent > 0 ? '+' : ''}${indicator.changePercent.toFixed(1)}%)`
).join('\n')}`

      addMessage('ai', analysis)
    } catch (error) {
      addMessage('ai', 'Unable to fetch current market data. Please try again later.')
    }
  }

  const handlePortfolioRisk = async () => {
    if (portfolioStats.propertyCount === 0) {
      addMessage('ai', 'Add properties to your portfolio to analyze risk metrics.')
      return
    }
    
    const riskAnalysis = `🛡️ **Portfolio Risk Analysis**

**Overall Risk Score: ${portfolioStats.riskMetrics.overallRiskScore.toFixed(1)}/100**
${portfolioStats.riskMetrics.overallRiskScore < 30 ? '✅ Low Risk' : 
  portfolioStats.riskMetrics.overallRiskScore < 60 ? '⚠️ Medium Risk' : '🚨 High Risk'}

**Risk Breakdown:**
• Concentration Risk: ${portfolioStats.riskMetrics.concentrationRisk.toFixed(1)}%
• Liquidity Risk: ${portfolioStats.riskMetrics.liquidityRisk.toFixed(1)}/100
• Market Risk: ${portfolioStats.riskMetrics.marketRisk.toFixed(1)}/100
• Portfolio Volatility: ${portfolioStats.volatility.toFixed(1)}%

**Diversification:**
• Geographic Spread: ${portfolioStats.geographicDiversification.citiesCount} cities
• Property Types: ${portfolioStats.propertyTypeDiversification.typesCount} types
• Diversification Score: ${portfolioStats.diversificationScore.toFixed(1)}/100`

    const actions: ChatAction[] = [
      {
        id: 'reduce-risk',
        label: 'Risk Reduction Tips',
        icon: <Target className="w-4 h-4" />,
        action: () => addMessage('ai', 'To reduce risk: 1) Diversify across more locations, 2) Add different property types, 3) Consider properties with lower individual risk scores, 4) Maintain cash reserves for unexpected expenses.'),
        variant: 'danger'
      }
    ]
    
    addMessage('ai', riskAnalysis, actions)
  }

  const handleFilterCommand = async (params: any) => {
    const { filterType } = params
    
    // Parse filter requirements
    if (filterType.includes('cap rate') || filterType.includes('yield')) {
      const match = filterType.match(/(\d+(?:\.\d+)?)/)?.[0]
      if (match) {
        onFiltersChange?.({ capRateRange: { min: parseFloat(match), max: 20 } })
        addMessage('ai', `Applied filter: Cap rate above ${match}%. Use the filters panel to see results.`)
      }
    } else if (filterType.includes('price')) {
      const match = filterType.match(/(\d+(?:k|m)?)/i)?.[0]
      if (match) {
        const value = match.toLowerCase().includes('k') ? parseFloat(match) * 1000 : 
                     match.toLowerCase().includes('m') ? parseFloat(match) * 1000000 : parseFloat(match)
        onFiltersChange?.({ priceRange: { min: 0, max: value } })
        addMessage('ai', `Applied filter: Price under $${match}. Check the map for filtered results.`)
      }
    } else {
      addMessage('ai', `I'll help you filter by ${filterType}. Could you be more specific about the criteria? For example: "price under $500k" or "cap rate above 8%"`)
    }
  }

  const handleComparison = async () => {
    if (selectedItemCount < 2) {
      addMessage('ai', 'Please select at least 2 properties from your workspace to compare them.')
      return
    }
    
    const actions: ChatAction[] = [
      {
        id: 'open-comparison',
        label: 'Open Comparison Tool',
        icon: <BarChart3 className="w-4 h-4" />,
        action: () => onPortfolioAction?.('openComparison'),
        variant: 'primary'
      }
    ]
    
    addMessage('ai', `I can compare the ${selectedItemCount} properties you've selected. The comparison will show financial metrics, physical characteristics, and investment potential side by side.`, actions)
  }

  const handleAnalytics = async (params: any) => {
    const { metric, subject } = params
    
    if (metric.includes('roi') || metric.includes('return')) {
      addMessage('ai', `ROI calculation depends on your investment strategy. For rental properties, consider: 1) Cap Rate (NOI ÷ Property Value), 2) Cash-on-Cash Return (Annual Cash Flow ÷ Cash Invested), 3) Total Return (Income + Appreciation). Would you like me to calculate any of these for a specific property?`)
    } else if (metric.includes('cap rate')) {
      addMessage('ai', `Cap Rate = Net Operating Income ÷ Property Value × 100. For example, if a property generates $50,000 annually after expenses and costs $625,000, the cap rate is 8%. Which property would you like me to analyze?`)
    } else if (metric.includes('cash flow')) {
      addMessage('ai', `Cash Flow = Rental Income - (Mortgage Payment + Operating Expenses + Taxes + Insurance). Positive cash flow means the property pays for itself. Select a property to see its cash flow analysis.`)
    } else {
      addMessage('ai', `I can help calculate various metrics like ROI, cap rate, cash flow, appreciation, and more. What specific calculation would you like me to perform?`)
    }
  }

  const handleVoiceToggle = () => {
    if (isListening) {
      recognition.current?.stop()
      setIsListening(false)
    } else {
      if (recognition.current) {
        recognition.current.start()
        setIsListening(true)
      } else {
        addMessage('ai', 'Voice recognition is not supported in your browser. Please type your commands instead.')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userInput = input.trim()
    setInput('')
    setShowSuggestions(false)
    setLastCommand(userInput)
    
    // Add user message
    addMessage('user', userInput)
    
    // Parse and execute command
    const command = parseCommand(userInput)
    await executeCommand(command)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setShowSuggestions(false)
    setTimeout(() => handleSubmit(new Event('submit') as any), 100)
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`${sleekStyles.glassMorphism.primary} rounded-xl shadow-2xl border ${animationClasses.slideUp}`} style={{ width: isExpanded ? '500px' : '400px' }}>
        
        {/* Chat Messages (when expanded) */}
        {isExpanded && (
          <div className="p-4 max-h-60 overflow-y-auto border-b border-white/20" ref={messagesRef}>
            <div className="space-y-3">
              {messages.slice(-5).map(message => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user' 
                      ? `${sleekStyles.status.info} ${sleekStyles.text.accent}` 
                      : `${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary}`
                  }`}>
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    {message.actions && (
                      <div className="flex gap-2 mt-2">
                        {message.actions.map(action => (
                          <GlassButton
                            key={action.id}
                            onClick={action.action}
                            variant={action.variant || 'secondary'}
                            size="sm"
                            icon={action.icon}
                            className="text-xs"
                          >
                            {action.label}
                          </GlassButton>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`p-3 rounded-lg ${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <span className="text-sm ml-2">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Smart Suggestions */}
        {showSuggestions && !isExpanded && (
          <div className="absolute bottom-full mb-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl overflow-hidden">
            <div className="p-3">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                AI Suggestions
              </div>
              <div className="space-y-1">
                {getSmartSuggestions().slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors flex items-center gap-2"
                  >
                    {suggestion.category === 'search' && <Search className="w-3 h-3 text-gray-400" />}
                    {suggestion.category === 'portfolio' && <Building className="w-3 h-3 text-gray-400" />}
                    {suggestion.category === 'market' && <TrendingUp className="w-3 h-3 text-gray-400" />}
                    {suggestion.category === 'analytics' && <BarChart3 className="w-3 h-3 text-gray-400" />}
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center p-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ask me anything about real estate..."
                  className={`w-full px-4 py-2 rounded-lg ${sleekStyles.glassMorphism.secondary} border border-white/20 ${sleekStyles.text.primary} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm`}
                  disabled={isLoading}
                />
                {isListening && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              
              <GlassButton
                type="button"
                onClick={handleVoiceToggle}
                variant={isListening ? 'danger' : 'ghost'}
                size="sm"
                icon={isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              />
              
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Send className="w-4 h-4" />}
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        </form>

        {/* Footer with Controls */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-gray-500">
              {workspaceItemCount > 0 && (
                <span>{workspaceItemCount} items</span>
              )}
              {selectedItemCount > 0 && (
                <span>{selectedItemCount} selected</span>
              )}
              {portfolioStats.propertyCount > 0 && (
                <span>{portfolioStats.propertyCount} in portfolio</span>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1 rounded hover:bg-white/20 transition-colors ${sleekStyles.text.muted}`}
              >
                <MessageSquare className="w-3 h-3" />
              </button>
              <button className={`p-1 rounded hover:bg-white/20 transition-colors ${sleekStyles.text.muted}`}>
                <Command className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Hints */}
      {!isExpanded && messages.length <= 1 && (
        <div className="absolute -top-12 left-0 right-0 text-center">
          <div className={`text-xs ${sleekStyles.text.muted} flex items-center justify-center gap-2`}>
            <Brain className="w-3 h-3" />
            Try: "Find multifamily in Austin" or "Analyze my portfolio"
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedAIChatInterface