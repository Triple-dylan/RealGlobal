import { commercialAPI, CommercialProperty } from '../commercial/commercial-api'

export interface PropertySearchFilters {
  location?: {
    bounds?: {
      north: number
      south: number
      east: number
      west: number
    }
    center?: {
      lat: number
      lng: number
      radius: number // in miles
    }
    address?: string
  }
  propertyType: {
    types: Array<'office' | 'retail' | 'industrial' | 'multifamily' | 'mixed-use' | 'land'>
    includeSubtypes?: boolean
  }
  financial: {
    priceRange?: {
      min: number
      max: number
    }
    capRateRange?: {
      min: number
      max: number
    }
    noi?: {
      min: number
      max: number
    }
    cashOnCashReturn?: {
      min: number
      max: number
    }
  }
  physical: {
    sizeRange?: {
      min: number // square feet
      max: number
    }
    lotSizeRange?: {
      min: number // acres
      max: number
    }
    yearBuiltRange?: {
      min: number
      max: number
    }
    occupancyRange?: {
      min: number // percentage
      max: number
    }
  }
  market: {
    daysOnMarketMax?: number
    marketTrend?: 'increasing' | 'stable' | 'decreasing' | 'any'
    competitiveness?: 'high' | 'medium' | 'low' | 'any'
  }
  investment: {
    strategy?: 'cash-flow' | 'appreciation' | 'development' | 'value-add' | 'core' | 'any'
    riskTolerance?: 'conservative' | 'moderate' | 'aggressive'
    holdPeriod?: number // years
  }
  zoning?: {
    allowedUses?: string[]
    developmentPotential?: boolean
  }
}

export interface PropertySearchResult {
  properties: CommercialProperty[]
  totalCount: number
  aggregateMetrics: {
    averagePrice: number
    averageCapRate: number
    averagePricePerSqft: number
    averageDaysOnMarket: number
    priceRange: { min: number; max: number }
    totalValue: number
  }
  marketSummary: {
    hotspots: Array<{
      area: string
      propertyCount: number
      averagePrice: number
      trend: 'increasing' | 'stable' | 'decreasing'
    }>
    recommendations: string[]
  }
  searchMetadata: {
    searchTime: number
    sources: string[]
    filtersApplied: number
    resultsFromCache: boolean
  }
}

export interface SavedSearch {
  id: string
  name: string
  filters: PropertySearchFilters
  alertSettings: {
    enabled: boolean
    frequency: 'immediate' | 'daily' | 'weekly'
    email?: string
    priceChangeThreshold?: number
    newListingsOnly?: boolean
  }
  createdAt: Date
  lastRun: Date
  resultCount: number
}

export class PropertySearchService {
  private searchCache = new Map<string, { result: PropertySearchResult; timestamp: number }>()
  private savedSearches: SavedSearch[] = []
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  async searchProperties(filters: PropertySearchFilters): Promise<PropertySearchResult> {
    const startTime = Date.now()
    const cacheKey = this.generateCacheKey(filters)
    
    // Check cache first
    const cached = this.searchCache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return {
        ...cached.result,
        searchMetadata: {
          ...cached.result.searchMetadata,
          searchTime: Date.now() - startTime,
          resultsFromCache: true
        }
      }
    }

    try {
      // Convert our filters to commercial API format
      const apiParams = this.convertFiltersToAPIParams(filters)
      
      // Search properties from commercial API
      const properties = await commercialAPI.searchProperties(apiParams)
      
      // Filter and sort results based on our criteria
      const filteredProperties = this.applyAdvancedFilters(properties, filters)
      
      // Calculate aggregate metrics
      const aggregateMetrics = this.calculateAggregateMetrics(filteredProperties)
      
      // Generate market summary
      const marketSummary = this.generateMarketSummary(filteredProperties, filters)
      
      const result: PropertySearchResult = {
        properties: filteredProperties,
        totalCount: filteredProperties.length,
        aggregateMetrics,
        marketSummary,
        searchMetadata: {
          searchTime: Date.now() - startTime,
          sources: this.getSourcesUsed(properties),
          filtersApplied: this.countAppliedFilters(filters),
          resultsFromCache: false
        }
      }
      
      // Cache the result
      this.searchCache.set(cacheKey, { result, timestamp: Date.now() })
      
      return result
    } catch (error) {
      console.error('Property search failed:', error)
      throw new Error('Failed to search properties. Please try again.')
    }
  }

  async getPropertyRecommendations(
    preferences: {
      investmentStrategy: string
      budgetRange: { min: number; max: number }
      preferredAreas?: string[]
      riskTolerance: 'conservative' | 'moderate' | 'aggressive'
    }
  ): Promise<CommercialProperty[]> {
    // Build filters based on preferences
    const filters: PropertySearchFilters = {
      financial: {
        priceRange: preferences.budgetRange
      },
      investment: {
        strategy: preferences.investmentStrategy as any,
        riskTolerance: preferences.riskTolerance
      },
      propertyType: {
        types: this.getRecommendedPropertyTypes(preferences.investmentStrategy)
      }
    }

    const searchResult = await this.searchProperties(filters)
    
    // Score and rank properties based on preferences
    return this.rankPropertiesByPreferences(searchResult.properties, preferences)
  }

  async saveSearch(name: string, filters: PropertySearchFilters): Promise<SavedSearch> {
    const savedSearch: SavedSearch = {
      id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      filters,
      alertSettings: {
        enabled: false,
        frequency: 'daily'
      },
      createdAt: new Date(),
      lastRun: new Date(),
      resultCount: 0
    }

    this.savedSearches.push(savedSearch)
    
    // Run the search to get initial count
    const result = await this.searchProperties(filters)
    savedSearch.resultCount = result.totalCount
    
    return savedSearch
  }

  getSavedSearches(): SavedSearch[] {
    return this.savedSearches
  }

  async runSavedSearch(searchId: string): Promise<PropertySearchResult> {
    const savedSearch = this.savedSearches.find(s => s.id === searchId)
    if (!savedSearch) {
      throw new Error('Saved search not found')
    }

    const result = await this.searchProperties(savedSearch.filters)
    
    // Update last run time
    savedSearch.lastRun = new Date()
    savedSearch.resultCount = result.totalCount
    
    return result
  }

  async getMarketInsights(area: string, propertyType?: string): Promise<{
    trends: Array<{
      metric: string
      current: number
      change: number
      timeframe: string
      direction: 'up' | 'down' | 'stable'
    }>
    opportunities: string[]
    risks: string[]
    forecast: string
  }> {
    try {
      const marketMetrics = await commercialAPI.getMarketMetrics({
        area,
        propertyType,
        timeframe: 'quarter'
      })

      return {
        trends: [
          {
            metric: 'Average Price',
            current: marketMetrics.pricing.averagePrice,
            change: marketMetrics.market.priceGrowth.quarterly,
            timeframe: 'Quarter',
            direction: marketMetrics.market.priceGrowth.quarterly > 0 ? 'up' : 'down'
          },
          {
            metric: 'Vacancy Rate',
            current: marketMetrics.vacancy.overall,
            change: -2.1, // Mock change data
            timeframe: 'Quarter',
            direction: 'down'
          },
          {
            metric: 'Days on Market',
            current: marketMetrics.market.averageDaysOnMarket,
            change: -8.5,
            timeframe: 'Quarter',
            direction: 'down'
          }
        ],
        opportunities: [
          'Strong rental demand in Class A properties',
          'Development opportunities in emerging districts',
          'Value-add potential in Class B buildings'
        ],
        risks: [
          'Interest rate sensitivity',
          'Supply pipeline coming online',
          'Economic uncertainty'
        ],
        forecast: 'Market conditions favor investors with strong fundamentals and patient capital. Expect continued growth in select submarkets.'
      }
    } catch (error) {
      console.error('Failed to get market insights:', error)
      throw new Error('Unable to retrieve market insights')
    }
  }

  private convertFiltersToAPIParams(filters: PropertySearchFilters): any {
    const params: any = {}
    
    if (filters.location?.bounds) {
      params.bounds = filters.location.bounds
    }
    
    if (filters.location?.center) {
      params.location = filters.location.center
    }
    
    if (filters.propertyType?.types) {
      params.propertyTypes = filters.propertyType.types
    }
    
    if (filters.financial?.priceRange) {
      params.priceRange = filters.financial.priceRange
    }
    
    if (filters.physical?.sizeRange) {
      params.sizeRange = filters.physical.sizeRange
    }
    
    params.limit = 100 // Default limit
    
    return params
  }

  private applyAdvancedFilters(properties: CommercialProperty[], filters: PropertySearchFilters): CommercialProperty[] {
    return properties.filter(property => {
      // Financial filters
      if (filters.financial?.capRateRange) {
        const capRate = property.listingDetails.capRate
        if (!capRate || 
            capRate < filters.financial.capRateRange.min || 
            capRate > filters.financial.capRateRange.max) {
          return false
        }
      }

      // Physical filters
      if (filters.physical?.yearBuiltRange) {
        const yearBuilt = property.listingDetails.yearBuilt
        if (!yearBuilt || 
            yearBuilt < filters.physical.yearBuiltRange.min || 
            yearBuilt > filters.physical.yearBuiltRange.max) {
          return false
        }
      }

      if (filters.physical?.occupancyRange) {
        const occupancy = property.listingDetails.occupancyRate
        if (!occupancy || 
            occupancy < filters.physical.occupancyRange.min || 
            occupancy > filters.physical.occupancyRange.max) {
          return false
        }
      }

      // Market filters
      if (filters.market?.daysOnMarketMax) {
        if (property.marketData.daysOnMarket > filters.market.daysOnMarketMax) {
          return false
        }
      }

      return true
    })
  }

  private calculateAggregateMetrics(properties: CommercialProperty[]) {
    if (properties.length === 0) {
      return {
        averagePrice: 0,
        averageCapRate: 0,
        averagePricePerSqft: 0,
        averageDaysOnMarket: 0,
        priceRange: { min: 0, max: 0 },
        totalValue: 0
      }
    }

    const prices = properties.map(p => p.listingDetails.listPrice).filter(p => p > 0)
    const capRates = properties.map(p => p.listingDetails.capRate || 0).filter(r => r > 0)
    const pricesPerSqft = properties.map(p => p.listingDetails.pricePerSqft || 0).filter(p => p > 0)
    const daysOnMarket = properties.map(p => p.marketData.daysOnMarket).filter(d => d > 0)

    return {
      averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      averageCapRate: capRates.length > 0 ? capRates.reduce((a, b) => a + b, 0) / capRates.length : 0,
      averagePricePerSqft: pricesPerSqft.length > 0 ? pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length : 0,
      averageDaysOnMarket: daysOnMarket.length > 0 ? daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length : 0,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      totalValue: prices.reduce((a, b) => a + b, 0)
    }
  }

  private generateMarketSummary(properties: CommercialProperty[], filters: PropertySearchFilters) {
    // Group by city to find hotspots
    const cityGroups = new Map<string, CommercialProperty[]>()
    
    properties.forEach(property => {
      const city = property.address.city
      if (!cityGroups.has(city)) {
        cityGroups.set(city, [])
      }
      cityGroups.get(city)!.push(property)
    })

    const hotspots = Array.from(cityGroups.entries())
      .map(([city, cityProperties]) => {
        const avgPrice = cityProperties.reduce((sum, p) => sum + p.listingDetails.listPrice, 0) / cityProperties.length
        return {
          area: city,
          propertyCount: cityProperties.length,
          averagePrice: avgPrice,
          trend: 'stable' as const // Would calculate from historical data
        }
      })
      .sort((a, b) => b.propertyCount - a.propertyCount)
      .slice(0, 5)

    const recommendations = [
      'Focus on properties with cap rates above 6%',
      'Consider emerging markets with strong fundamentals',
      'Diversify across property types for risk mitigation'
    ]

    return { hotspots, recommendations }
  }

  private getSourcesUsed(properties: CommercialProperty[]): string[] {
    const sources = new Set(properties.map(p => p.source))
    return Array.from(sources)
  }

  private countAppliedFilters(filters: PropertySearchFilters): number {
    let count = 0
    
    if (filters.location) count++
    if (filters.propertyType?.types?.length) count++
    if (filters.financial?.priceRange) count++
    if (filters.financial?.capRateRange) count++
    if (filters.physical?.sizeRange) count++
    if (filters.market?.daysOnMarketMax) count++
    
    return count
  }

  private generateCacheKey(filters: PropertySearchFilters): string {
    return JSON.stringify(filters)
  }

  private getRecommendedPropertyTypes(strategy: string): Array<'office' | 'retail' | 'industrial' | 'multifamily' | 'mixed-use' | 'land'> {
    switch (strategy) {
      case 'cash-flow':
        return ['multifamily', 'industrial']
      case 'appreciation':
        return ['office', 'mixed-use']
      case 'development':
        return ['land', 'mixed-use']
      case 'value-add':
        return ['office', 'retail', 'multifamily']
      default:
        return ['office', 'retail', 'industrial', 'multifamily']
    }
  }

  private rankPropertiesByPreferences(properties: CommercialProperty[], preferences: any): CommercialProperty[] {
    return properties
      .map(property => ({
        property,
        score: this.calculatePropertyScore(property, preferences)
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.property)
      .slice(0, 20) // Return top 20 recommendations
  }

  private calculatePropertyScore(property: CommercialProperty, preferences: any): number {
    let score = 0
    
    // Cap rate scoring
    const capRate = property.listingDetails.capRate || 0
    if (capRate > 6) score += 20
    else if (capRate > 4) score += 10
    
    // Price scoring (within budget gets bonus)
    const price = property.listingDetails.listPrice
    if (price >= preferences.budgetRange.min && price <= preferences.budgetRange.max) {
      score += 30
    }
    
    // Occupancy scoring
    const occupancy = property.listingDetails.occupancyRate || 0
    if (occupancy > 90) score += 15
    else if (occupancy > 80) score += 10
    
    // Days on market (fresher listings get bonus)
    const dom = property.marketData.daysOnMarket
    if (dom < 30) score += 10
    else if (dom < 60) score += 5
    
    return score
  }
}

export const propertySearchService = new PropertySearchService()