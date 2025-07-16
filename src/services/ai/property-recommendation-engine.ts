import { CommercialProperty, MarketMetrics } from '../commercial/commercial-api'
import { propertySearchService } from '../property/property-search'
import { openaiService } from '../openai'

export interface UserPreferences {
  investmentStrategy: 'cash-flow' | 'appreciation' | 'development' | 'value-add' | 'core' | 'opportunistic'
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  budgetRange: {
    min: number
    max: number
  }
  preferredPropertyTypes: Array<'office' | 'retail' | 'industrial' | 'multifamily' | 'mixed-use' | 'land'>
  preferredLocations?: {
    cities?: string[]
    states?: string[]
    regions?: string[]
    avoidAreas?: string[]
  }
  investmentCriteria: {
    minCapRate?: number
    maxCapRate?: number
    minOccupancy?: number
    minSquareFootage?: number
    maxDaysOnMarket?: number
    requiresCashFlow?: boolean
    preferredTenantTypes?: string[]
  }
  timeline: {
    acquisitionTimeframe: '1-3months' | '3-6months' | '6-12months' | '1-2years' | 'flexible'
    holdPeriod: '1-3years' | '3-5years' | '5-10years' | '10+years'
  }
  marketPreferences: {
    growthMarkets?: boolean
    establishedMarkets?: boolean
    emergingMarkets?: boolean
    avoidVolatileMarkets?: boolean
  }
}

export interface PropertyRecommendation {
  property: CommercialProperty
  score: number
  matchReasons: string[]
  riskFactors: string[]
  opportunityHighlights: string[]
  projectedReturns: {
    estimatedROI: number
    cashFlow: number
    appreciation: number
    totalReturn: number
  }
  marketContext: {
    areaGrowth: number
    competitiveness: 'high' | 'medium' | 'low'
    marketTrend: 'bullish' | 'neutral' | 'bearish'
  }
  actionItems: string[]
  confidence: 'high' | 'medium' | 'low'
}

export interface RecommendationReport {
  recommendations: PropertyRecommendation[]
  portfolioAnalysis: {
    diversificationScore: number
    riskDistribution: {
      conservative: number
      moderate: number
      aggressive: number
    }
    expectedPortfolioReturn: number
    recommendedMix: string[]
  }
  marketInsights: {
    hotMarkets: string[]
    emergingOpportunities: string[]
    marketWarnings: string[]
    timing: 'excellent' | 'good' | 'fair' | 'poor'
  }
  aiSummary: string
  generatedAt: Date
}

export class PropertyRecommendationEngine {
  private preferenceWeights = {
    investmentStrategy: 0.25,
    riskTolerance: 0.20,
    budget: 0.15,
    propertyType: 0.15,
    location: 0.10,
    criteria: 0.10,
    market: 0.05
  }

  async generateRecommendations(
    userPreferences: UserPreferences,
    maxRecommendations: number = 10
  ): Promise<RecommendationReport> {
    try {
      // Step 1: Search for properties based on preferences
      const searchResult = await propertySearchService.searchProperties({
        propertyType: {
          types: userPreferences.preferredPropertyTypes
        },
        financial: {
          priceRange: userPreferences.budgetRange,
          capRateRange: userPreferences.investmentCriteria.minCapRate ? {
            min: userPreferences.investmentCriteria.minCapRate,
            max: userPreferences.investmentCriteria.maxCapRate || 15
          } : undefined
        },
        physical: {
          sizeRange: userPreferences.investmentCriteria.minSquareFootage ? {
            min: userPreferences.investmentCriteria.minSquareFootage,
            max: 1000000
          } : undefined,
          occupancyRange: userPreferences.investmentCriteria.minOccupancy ? {
            min: userPreferences.investmentCriteria.minOccupancy,
            max: 100
          } : undefined
        },
        market: {
          daysOnMarketMax: userPreferences.investmentCriteria.maxDaysOnMarket
        },
        investment: {
          strategy: userPreferences.investmentStrategy,
          riskTolerance: userPreferences.riskTolerance
        }
      })

      // Step 2: Score and rank properties
      const scoredProperties = await Promise.all(
        searchResult.properties.map(property => this.scoreProperty(property, userPreferences))
      )

      // Step 3: Sort by score and take top recommendations
      const topRecommendations = scoredProperties
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations)

      // Step 4: Generate portfolio analysis
      const portfolioAnalysis = this.analyzePortfolio(topRecommendations, userPreferences)

      // Step 5: Generate market insights
      const marketInsights = await this.generateMarketInsights(topRecommendations, userPreferences)

      // Step 6: Generate AI summary
      const aiSummary = await this.generateAISummary(topRecommendations, portfolioAnalysis, marketInsights, userPreferences)

      return {
        recommendations: topRecommendations,
        portfolioAnalysis,
        marketInsights,
        aiSummary,
        generatedAt: new Date()
      }

    } catch (error) {
      console.error('Error generating property recommendations:', error)
      throw new Error('Failed to generate property recommendations')
    }
  }

  private async scoreProperty(
    property: CommercialProperty,
    preferences: UserPreferences
  ): Promise<PropertyRecommendation> {
    let totalScore = 0
    const matchReasons: string[] = []
    const riskFactors: string[] = []
    const opportunityHighlights: string[] = []

    // Investment Strategy Score
    const strategyScore = this.scoreInvestmentStrategy(property, preferences.investmentStrategy)
    totalScore += strategyScore * this.preferenceWeights.investmentStrategy
    if (strategyScore > 80) matchReasons.push(`Excellent fit for ${preferences.investmentStrategy} strategy`)

    // Risk Tolerance Score
    const riskScore = this.scoreRiskTolerance(property, preferences.riskTolerance)
    totalScore += riskScore * this.preferenceWeights.riskTolerance
    if (riskScore < 60) riskFactors.push('Higher risk than preferred tolerance')

    // Budget Score
    const budgetScore = this.scoreBudget(property, preferences.budgetRange)
    totalScore += budgetScore * this.preferenceWeights.budget
    if (budgetScore > 90) matchReasons.push('Within ideal budget range')

    // Property Type Score
    const typeScore = this.scorePropertyType(property, preferences.preferredPropertyTypes)
    totalScore += typeScore * this.preferenceWeights.propertyType

    // Investment Criteria Score
    const criteriaScore = this.scoreInvestmentCriteria(property, preferences.investmentCriteria)
    totalScore += criteriaScore * this.preferenceWeights.criteria

    // Identify opportunities
    if (property.listingDetails.capRate && property.listingDetails.capRate > 7) {
      opportunityHighlights.push(`Strong ${property.listingDetails.capRate}% cap rate`)
    }
    if (property.listingDetails.occupancyRate && property.listingDetails.occupancyRate > 90) {
      opportunityHighlights.push(`High ${property.listingDetails.occupancyRate}% occupancy`)
    }
    if (property.marketData.daysOnMarket < 30) {
      opportunityHighlights.push('Recently listed - fresh opportunity')
    }

    // Identify risk factors
    if (property.listingDetails.occupancyRate && property.listingDetails.occupancyRate < 80) {
      riskFactors.push(`Lower occupancy at ${property.listingDetails.occupancyRate}%`)
    }
    if (property.marketData.daysOnMarket > 180) {
      riskFactors.push('Extended time on market')
    }

    // Calculate projected returns
    const projectedReturns = this.calculateProjectedReturns(property, preferences)

    // Determine market context
    const marketContext = {
      areaGrowth: Math.random() * 10 + 2, // Mock - would use real market data
      competitiveness: 'medium' as const,
      marketTrend: 'neutral' as const
    }

    // Generate action items
    const actionItems = this.generateActionItems(property, preferences)

    // Determine confidence
    const confidence = totalScore > 80 ? 'high' : totalScore > 60 ? 'medium' : 'low'

    return {
      property,
      score: Math.round(totalScore),
      matchReasons,
      riskFactors,
      opportunityHighlights,
      projectedReturns,
      marketContext,
      actionItems,
      confidence
    }
  }

  private scoreInvestmentStrategy(property: CommercialProperty, strategy: string): number {
    const capRate = property.listingDetails.capRate || 0
    const pricePerSqft = property.listingDetails.pricePerSqft || 0
    const occupancy = property.listingDetails.occupancyRate || 0

    switch (strategy) {
      case 'cash-flow':
        return this.scoreCashFlowStrategy(capRate, occupancy)
      case 'appreciation':
        return this.scoreAppreciationStrategy(pricePerSqft, property.propertyType)
      case 'value-add':
        return this.scoreValueAddStrategy(occupancy, property.listingDetails.yearBuilt || 0)
      case 'development':
        return property.propertyType === 'land' ? 90 : 20
      case 'core':
        return this.scoreCoreStrategy(capRate, occupancy, property.propertyType)
      case 'opportunistic':
        return this.scoreOpportunisticStrategy(property)
      default:
        return 50
    }
  }

  private scoreCashFlowStrategy(capRate: number, occupancy: number): number {
    let score = 0
    if (capRate > 8) score += 40
    else if (capRate > 6) score += 25
    else if (capRate > 4) score += 10

    if (occupancy > 90) score += 30
    else if (occupancy > 80) score += 20
    else if (occupancy > 70) score += 10

    return Math.min(100, score + 30) // Base score
  }

  private scoreAppreciationStrategy(pricePerSqft: number, propertyType: string): number {
    let score = 50 // Base score
    
    // Office and mixed-use typically better for appreciation
    if (['office', 'mixed-use'].includes(propertyType)) score += 20
    
    // Lower price per sqft might indicate upside potential
    if (pricePerSqft < 200) score += 20
    
    return Math.min(100, score)
  }

  private scoreValueAddStrategy(occupancy: number, yearBuilt: number): number {
    let score = 40 // Base score
    
    // Lower occupancy indicates value-add opportunity
    if (occupancy < 80) score += 25
    else if (occupancy < 90) score += 15
    
    // Older buildings often have value-add potential
    const age = new Date().getFullYear() - yearBuilt
    if (age > 20) score += 25
    else if (age > 10) score += 15
    
    return Math.min(100, score)
  }

  private scoreCoreStrategy(capRate: number, occupancy: number, propertyType: string): number {
    let score = 30 // Base score
    
    // Stable, lower-risk properties
    if (capRate >= 5 && capRate <= 7) score += 25
    if (occupancy > 85) score += 25
    
    // Core property types
    if (['office', 'multifamily'].includes(propertyType)) score += 20
    
    return Math.min(100, score)
  }

  private scoreOpportunisticStrategy(property: CommercialProperty): number {
    let score = 40 // Base score
    
    // Distressed or unique opportunities
    if (property.marketData.daysOnMarket > 90) score += 20
    if (property.listingDetails.occupancyRate && property.listingDetails.occupancyRate < 70) score += 25
    if (property.propertyType === 'land') score += 15
    
    return Math.min(100, score)
  }

  private scoreRiskTolerance(property: CommercialProperty, tolerance: string): number {
    const occupancy = property.listingDetails.occupancyRate || 0
    const age = new Date().getFullYear() - (property.listingDetails.yearBuilt || 2000)
    const capRate = property.listingDetails.capRate || 0

    switch (tolerance) {
      case 'conservative':
        return this.scoreConservativeRisk(occupancy, age, capRate)
      case 'moderate':
        return this.scoreModerateRisk(occupancy, age, capRate)
      case 'aggressive':
        return this.scoreAggressiveRisk(occupancy, age, capRate)
      default:
        return 50
    }
  }

  private scoreConservativeRisk(occupancy: number, age: number, capRate: number): number {
    let score = 0
    if (occupancy > 90) score += 35
    if (age < 15) score += 25
    if (capRate >= 5 && capRate <= 7) score += 25
    return Math.min(100, score + 15)
  }

  private scoreModerateRisk(occupancy: number, age: number, capRate: number): number {
    let score = 20 // Base score
    if (occupancy > 80) score += 25
    if (age < 25) score += 20
    if (capRate >= 4 && capRate <= 9) score += 25
    return Math.min(100, score + 10)
  }

  private scoreAggressiveRisk(occupancy: number, age: number, capRate: number): number {
    let score = 30 // Base score
    if (capRate > 8) score += 30 // Higher returns for higher risk
    if (occupancy < 80) score += 20 // Value-add opportunity
    if (age > 20) score += 20 // Renovation potential
    return Math.min(100, score)
  }

  private scoreBudget(property: CommercialProperty, budgetRange: { min: number; max: number }): number {
    const price = property.listingDetails.listPrice
    
    if (price < budgetRange.min || price > budgetRange.max) return 0
    
    // Score based on position within budget
    const budgetSpan = budgetRange.max - budgetRange.min
    const pricePosition = (price - budgetRange.min) / budgetSpan
    
    // Prefer properties in the middle to upper-middle of budget range
    if (pricePosition >= 0.4 && pricePosition <= 0.8) return 100
    if (pricePosition >= 0.2 && pricePosition <= 0.9) return 80
    return 60
  }

  private scorePropertyType(property: CommercialProperty, preferredTypes: string[]): number {
    return preferredTypes.includes(property.propertyType) ? 100 : 0
  }

  private scoreInvestmentCriteria(property: CommercialProperty, criteria: any): number {
    let score = 50 // Base score
    
    if (criteria.minCapRate && property.listingDetails.capRate) {
      if (property.listingDetails.capRate >= criteria.minCapRate) score += 20
    }
    
    if (criteria.minOccupancy && property.listingDetails.occupancyRate) {
      if (property.listingDetails.occupancyRate >= criteria.minOccupancy) score += 15
    }
    
    if (criteria.minSquareFootage && property.listingDetails.squareFootage) {
      if (property.listingDetails.squareFootage >= criteria.minSquareFootage) score += 10
    }
    
    if (criteria.maxDaysOnMarket) {
      if (property.marketData.daysOnMarket <= criteria.maxDaysOnMarket) score += 15
    }
    
    return Math.min(100, score)
  }

  private calculateProjectedReturns(property: CommercialProperty, preferences: UserPreferences) {
    const capRate = property.listingDetails.capRate || 5
    const price = property.listingDetails.listPrice
    
    // Simple ROI calculation - would be more sophisticated in production
    const estimatedROI = capRate + Math.random() * 3 // Add growth factor
    const cashFlow = (price * capRate) / 100
    const appreciation = price * 0.03 // 3% annual appreciation
    const totalReturn = cashFlow + appreciation
    
    return {
      estimatedROI: Math.round(estimatedROI * 100) / 100,
      cashFlow: Math.round(cashFlow),
      appreciation: Math.round(appreciation),
      totalReturn: Math.round(totalReturn)
    }
  }

  private generateActionItems(property: CommercialProperty, preferences: UserPreferences): string[] {
    const items = []
    
    items.push('Schedule property tour and inspection')
    items.push('Review financial statements and rent rolls')
    items.push('Conduct market comparable analysis')
    
    if (property.listingDetails.occupancyRate && property.listingDetails.occupancyRate < 90) {
      items.push('Analyze lease-up potential and market demand')
    }
    
    if (property.listingDetails.yearBuilt && (new Date().getFullYear() - property.listingDetails.yearBuilt) > 15) {
      items.push('Assess capital improvement requirements')
    }
    
    items.push('Perform due diligence on zoning and permits')
    items.push('Evaluate financing options and terms')
    
    return items
  }

  private analyzePortfolio(recommendations: PropertyRecommendation[], preferences: UserPreferences) {
    const types = recommendations.map(r => r.property.propertyType)
    const uniqueTypes = [...new Set(types)]
    
    // Calculate diversification score
    const diversificationScore = Math.min(100, (uniqueTypes.length / 4) * 100)
    
    // Risk distribution
    const riskDistribution = {
      conservative: recommendations.filter(r => r.confidence === 'high').length,
      moderate: recommendations.filter(r => r.confidence === 'medium').length,
      aggressive: recommendations.filter(r => r.confidence === 'low').length
    }
    
    // Expected portfolio return
    const avgROI = recommendations.reduce((sum, r) => sum + r.projectedReturns.estimatedROI, 0) / recommendations.length
    
    // Recommended mix
    const recommendedMix = [
      'Focus on high-confidence opportunities',
      'Maintain property type diversification',
      'Balance risk across portfolio'
    ]
    
    return {
      diversificationScore,
      riskDistribution,
      expectedPortfolioReturn: avgROI,
      recommendedMix
    }
  }

  private async generateMarketInsights(recommendations: PropertyRecommendation[], preferences: UserPreferences) {
    // Group by location to find hot markets
    const cityGroups = new Map<string, PropertyRecommendation[]>()
    
    recommendations.forEach(rec => {
      const city = rec.property.address.city
      if (!cityGroups.has(city)) {
        cityGroups.set(city, [])
      }
      cityGroups.get(city)!.push(rec)
    })
    
    const hotMarkets = Array.from(cityGroups.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([city]) => city)
    
    return {
      hotMarkets,
      emergingOpportunities: [
        'Industrial properties showing strong fundamentals',
        'Value-add multifamily in growth markets',
        'Mixed-use developments in urban areas'
      ],
      marketWarnings: [
        'Monitor interest rate impacts on financing',
        'Watch for oversupply in certain markets',
        'Economic uncertainty affecting tenant demand'
      ],
      timing: 'good' as const
    }
  }

  private async generateAISummary(
    recommendations: PropertyRecommendation[],
    portfolioAnalysis: any,
    marketInsights: any,
    preferences: UserPreferences
  ): Promise<string> {
    try {
      const prompt = `Generate a concise investment summary for a commercial real estate portfolio recommendation:

INVESTMENT STRATEGY: ${preferences.investmentStrategy}
RISK TOLERANCE: ${preferences.riskTolerance}
BUDGET: $${preferences.budgetRange.min.toLocaleString()} - $${preferences.budgetRange.max.toLocaleString()}

TOP RECOMMENDATIONS: ${recommendations.slice(0, 3).map(r => 
  `${r.property.propertyType} in ${r.property.address.city} - Score: ${r.score}/100`
).join(', ')}

PORTFOLIO METRICS:
- Diversification Score: ${portfolioAnalysis.diversificationScore}/100
- Expected Return: ${portfolioAnalysis.expectedPortfolioReturn}%
- Hot Markets: ${marketInsights.hotMarkets.join(', ')}

Provide a 2-3 sentence professional summary focusing on key opportunities and strategic recommendations.`

      const response = await openaiService.chat(prompt)
      return response || 'Based on your preferences, we\'ve identified strong investment opportunities that align with your strategy and risk tolerance. The recommended portfolio offers good diversification and attractive returns potential.'
      
    } catch (error) {
      console.error('Error generating AI summary:', error)
      return 'Based on your investment preferences, we\'ve identified a portfolio of properties that align with your strategy and risk tolerance, offering attractive return potential in growing markets.'
    }
  }
}

export const propertyRecommendationEngine = new PropertyRecommendationEngine()