import { PropertyListing } from './propertyData'

// Enhanced property data interfaces
export interface EnhancedPropertyListing extends PropertyListing {
  // Extended market data
  marketMetrics?: {
    walkScore?: number
    crimeRate?: number
    schoolRating?: number
    proximityToTransit?: number
    neighborhoodGrowth?: number
    employmentRate?: number
    averageIncome?: number
    populationDensity?: number
  }
  
  // Investment analysis
  investmentAnalysis?: {
    capRate: number
    cashFlow: number
    cashOnCash: number
    totalReturn: number
    paybackPeriod: number
    irr: number
    appreciation: number
    riskScore: number
    liquidityScore: number
    marketScore: number
  }
  
  // Comparative metrics
  comparatives?: {
    priceVsMarket: number // Percentage above/below market average
    capRateVsMarket: number
    appreciationVsMarket: number
    similarProperties?: PropertyListing[]
    marketTrends?: {
      priceGrowth1Year: number
      priceGrowth3Year: number
      priceGrowth5Year: number
      rentalGrowth1Year: number
    }
  }
  
  // Due diligence data
  dueDiligence?: {
    environmentalRisks?: string[]
    structuralInspection?: {
      date?: Date
      score?: number
      issues?: string[]
    }
    financialHistory?: {
      lastYearIncome?: number
      lastYearExpenses?: number
      occupancyHistory?: number[]
    }
    legalStatus?: {
      liens?: boolean
      violations?: string[]
      permits?: string[]
    }
  }
  
  // Data sources and quality
  dataQuality?: {
    completeness: number // 0-100%
    freshness: number // Days since last update
    accuracy: number // 0-100% estimated accuracy
    sources: string[]
    lastUpdated: Date
    verified: boolean
  }
}

// Data source configurations
export interface DataSourceConfig {
  name: string
  endpoint: string
  apiKey?: string
  rateLimit: number // requests per minute
  isActive: boolean
  reliability: number // 0-100%
  coverage: string[] // Property types covered
  dataFields: string[] // Fields this source provides
}

// Enhanced property data service
class EnhancedPropertyDataService {
  private cache = new Map<string, { data: EnhancedPropertyListing[], timestamp: number }>()
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  
  // Data source configurations
  private dataSources: DataSourceConfig[] = [
    {
      name: 'RentSpree',
      endpoint: 'https://api.rentspree.com/v1',
      rateLimit: 100,
      isActive: true,
      reliability: 85,
      coverage: ['multifamily', 'residential'],
      dataFields: ['listing', 'rental', 'amenities']
    },
    {
      name: 'LoopNet',
      endpoint: 'https://api.loopnet.com/v2',
      rateLimit: 60,
      isActive: true,
      reliability: 90,
      coverage: ['commercial', 'industrial', 'office', 'retail'],
      dataFields: ['listing', 'market', 'investment']
    },
    {
      name: 'Zillow',
      endpoint: 'https://api.zillow.com/webservice',
      rateLimit: 1000,
      isActive: true,
      reliability: 80,
      coverage: ['residential', 'multifamily'],
      dataFields: ['listing', 'zestimate', 'market', 'neighborhood']
    },
    {
      name: 'RealtyAPI',
      endpoint: 'https://api.realtyapi.com/v1',
      rateLimit: 200,
      isActive: true,
      reliability: 75,
      coverage: ['commercial', 'residential', 'multifamily'],
      dataFields: ['listing', 'market', 'photos']
    },
    {
      name: 'PropertyRadar',
      endpoint: 'https://api.propertyradar.com/v1',
      rateLimit: 150,
      isActive: true,
      reliability: 88,
      coverage: ['commercial', 'residential', 'industrial'],
      dataFields: ['ownership', 'tax', 'zoning', 'permits']
    }
  ]

  /**
   * Fetch enhanced property data from multiple sources
   */
  async fetchEnhancedProperties(filters: any): Promise<EnhancedPropertyListing[]> {
    const cacheKey = JSON.stringify(filters)
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Fetch from multiple sources in parallel
      const sourcePromises = this.dataSources
        .filter(source => source.isActive)
        .map(source => this.fetchFromSource(source, filters))

      const results = await Promise.allSettled(sourcePromises)
      
      // Combine and deduplicate results
      const allProperties: EnhancedPropertyListing[] = []
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allProperties.push(...result.value)
        }
      })

      const deduplicatedProperties = this.deduplicateProperties(allProperties)
      const enhancedProperties = await this.enhancePropertyData(deduplicatedProperties)
      
      // Cache results
      this.cache.set(cacheKey, { data: enhancedProperties, timestamp: Date.now() })
      
      return enhancedProperties
    } catch (error) {
      console.error('Error fetching enhanced properties:', error)
      return this.getFallbackData(filters)
    }
  }

  /**
   * Fetch data from a specific source
   */
  private async fetchFromSource(source: DataSourceConfig, filters: any): Promise<EnhancedPropertyListing[]> {
    try {
      // Simulate API calls with mock data for different sources
      switch (source.name) {
        case 'RentSpree':
          return this.fetchFromRentSpree(filters)
        case 'LoopNet':
          return this.fetchFromLoopNet(filters)
        case 'Zillow':
          return this.fetchFromZillow(filters)
        case 'RealtyAPI':
          return this.fetchFromRealtyAPI(filters)
        case 'PropertyRadar':
          return this.fetchFromPropertyRadar(filters)
        default:
          return []
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${source.name}:`, error)
      return []
    }
  }

  /**
   * Mock RentSpree API integration
   */
  private async fetchFromRentSpree(filters: any): Promise<EnhancedPropertyListing[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const mockProperties: EnhancedPropertyListing[] = [
      {
        id: 'rs_001',
        address: '123 Market Street, San Francisco, CA',
        coordinates: { lat: 37.7749, lng: -122.4194 },
        type: 'multifamily',
        price: 2800000,
        squareFootage: 4500,
        description: 'Prime multifamily property in SOMA district',
        source: 'RentSpree',
        marketMetrics: {
          walkScore: 98,
          crimeRate: 2.3,
          schoolRating: 8.5,
          proximityToTransit: 0.2,
          neighborhoodGrowth: 12.5,
          employmentRate: 96.2,
          averageIncome: 85000,
          populationDensity: 18500
        },
        investmentAnalysis: {
          capRate: 6.2,
          cashFlow: 8500,
          cashOnCash: 8.1,
          totalReturn: 14.2,
          paybackPeriod: 8.5,
          irr: 16.8,
          appreciation: 8.0,
          riskScore: 35,
          liquidityScore: 75,
          marketScore: 88
        },
        dataQuality: {
          completeness: 92,
          freshness: 2,
          accuracy: 88,
          sources: ['RentSpree', 'MLS'],
          lastUpdated: new Date(),
          verified: true
        }
      }
    ]

    return mockProperties.filter(p => 
      !filters.types || filters.types.includes(p.type)
    )
  }

  /**
   * Mock LoopNet API integration
   */
  private async fetchFromLoopNet(filters: any): Promise<EnhancedPropertyListing[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const mockProperties: EnhancedPropertyListing[] = [
      {
        id: 'ln_001',
        address: '456 Business Plaza, Austin, TX',
        coordinates: { lat: 30.2672, lng: -97.7431 },
        type: 'commercial',
        price: 1500000,
        squareFootage: 12000,
        description: 'Class A office building with modern amenities',
        source: 'LoopNet',
        marketMetrics: {
          walkScore: 65,
          crimeRate: 1.8,
          schoolRating: 7.2,
          proximityToTransit: 0.8,
          neighborhoodGrowth: 15.2,
          employmentRate: 94.8,
          averageIncome: 72000,
          populationDensity: 3200
        },
        investmentAnalysis: {
          capRate: 7.8,
          cashFlow: 12500,
          cashOnCash: 9.2,
          totalReturn: 16.8,
          paybackPeriod: 7.2,
          irr: 18.5,
          appreciation: 9.0,
          riskScore: 25,
          liquidityScore: 60,
          marketScore: 92
        },
        dataQuality: {
          completeness: 95,
          freshness: 1,
          accuracy: 92,
          sources: ['LoopNet', 'CoStar'],
          lastUpdated: new Date(),
          verified: true
        }
      }
    ]

    return mockProperties.filter(p => 
      !filters.types || filters.types.includes(p.type)
    )
  }

  /**
   * Mock Zillow API integration
   */
  private async fetchFromZillow(filters: any): Promise<EnhancedPropertyListing[]> {
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const mockProperties: EnhancedPropertyListing[] = [
      {
        id: 'z_001',
        address: '789 Oak Avenue, Portland, OR',
        coordinates: { lat: 45.5152, lng: -122.6784 },
        type: 'residential',
        price: 650000,
        squareFootage: 1800,
        description: 'Updated single family home in trendy neighborhood',
        source: 'Zillow',
        marketMetrics: {
          walkScore: 78,
          crimeRate: 1.2,
          schoolRating: 9.1,
          proximityToTransit: 0.5,
          neighborhoodGrowth: 8.5,
          employmentRate: 95.5,
          averageIncome: 68000,
          populationDensity: 4800
        },
        investmentAnalysis: {
          capRate: 5.2,
          cashFlow: 1200,
          cashOnCash: 6.8,
          totalReturn: 11.2,
          paybackPeriod: 12.5,
          irr: 12.8,
          appreciation: 6.0,
          riskScore: 20,
          liquidityScore: 85,
          marketScore: 78
        },
        comparatives: {
          priceVsMarket: -5.2, // 5.2% below market average
          capRateVsMarket: 0.8,
          appreciationVsMarket: 1.2,
          marketTrends: {
            priceGrowth1Year: 8.5,
            priceGrowth3Year: 24.2,
            priceGrowth5Year: 45.8,
            rentalGrowth1Year: 6.2
          }
        },
        dataQuality: {
          completeness: 88,
          freshness: 3,
          accuracy: 85,
          sources: ['Zillow', 'MLS'],
          lastUpdated: new Date(),
          verified: false
        }
      }
    ]

    return mockProperties.filter(p => 
      !filters.types || filters.types.includes(p.type)
    )
  }

  /**
   * Mock RealtyAPI integration
   */
  private async fetchFromRealtyAPI(filters: any): Promise<EnhancedPropertyListing[]> {
    await new Promise(resolve => setTimeout(resolve, 250))
    
    const mockProperties: EnhancedPropertyListing[] = [
      {
        id: 'ra_001',
        address: '321 Industrial Way, Denver, CO',
        coordinates: { lat: 39.7392, lng: -104.9903 },
        type: 'industrial',
        price: 2200000,
        squareFootage: 25000,
        description: 'Modern warehouse with loading docks and office space',
        source: 'RealtyAPI',
        marketMetrics: {
          walkScore: 35,
          crimeRate: 2.1,
          proximityToTransit: 1.5,
          neighborhoodGrowth: 18.5,
          employmentRate: 92.5,
          populationDensity: 1200
        },
        investmentAnalysis: {
          capRate: 8.5,
          cashFlow: 18000,
          cashOnCash: 10.2,
          totalReturn: 18.5,
          paybackPeriod: 6.8,
          irr: 21.2,
          appreciation: 10.0,
          riskScore: 40,
          liquidityScore: 45,
          marketScore: 85
        },
        dataQuality: {
          completeness: 85,
          freshness: 5,
          accuracy: 80,
          sources: ['RealtyAPI'],
          lastUpdated: new Date(),
          verified: false
        }
      }
    ]

    return mockProperties.filter(p => 
      !filters.types || filters.types.includes(p.type)
    )
  }

  /**
   * Mock PropertyRadar integration
   */
  private async fetchFromPropertyRadar(filters: any): Promise<EnhancedPropertyListing[]> {
    await new Promise(resolve => setTimeout(resolve, 180))
    
    // PropertyRadar typically provides ownership and tax data
    // This would enhance existing listings rather than provide new ones
    return []
  }

  /**
   * Remove duplicate properties across sources
   */
  private deduplicateProperties(properties: EnhancedPropertyListing[]): EnhancedPropertyListing[] {
    const seenAddresses = new Set<string>()
    const uniqueProperties: EnhancedPropertyListing[] = []
    
    for (const property of properties) {
      const normalizedAddress = property.address.toLowerCase().replace(/[^\w\s]/g, '').trim()
      
      if (!seenAddresses.has(normalizedAddress)) {
        seenAddresses.add(normalizedAddress)
        uniqueProperties.push(property)
      } else {
        // Merge data from duplicate sources
        const existingIndex = uniqueProperties.findIndex(p => 
          p.address.toLowerCase().replace(/[^\w\s]/g, '').trim() === normalizedAddress
        )
        if (existingIndex !== -1) {
          uniqueProperties[existingIndex] = this.mergePropertyData(uniqueProperties[existingIndex], property)
        }
      }
    }
    
    return uniqueProperties
  }

  /**
   * Merge data from multiple sources for the same property
   */
  private mergePropertyData(existing: EnhancedPropertyListing, additional: EnhancedPropertyListing): EnhancedPropertyListing {
    return {
      ...existing,
      // Take the most complete data
      description: existing.description || additional.description,
      price: existing.price || additional.price,
      squareFootage: existing.squareFootage || additional.squareFootage,
      
      // Merge market metrics
      marketMetrics: {
        ...existing.marketMetrics,
        ...additional.marketMetrics
      },
      
      // Merge investment analysis (average where both exist)
      investmentAnalysis: existing.investmentAnalysis && additional.investmentAnalysis ? {
        capRate: (existing.investmentAnalysis.capRate + additional.investmentAnalysis.capRate) / 2,
        cashFlow: (existing.investmentAnalysis.cashFlow + additional.investmentAnalysis.cashFlow) / 2,
        cashOnCash: (existing.investmentAnalysis.cashOnCash + additional.investmentAnalysis.cashOnCash) / 2,
        totalReturn: (existing.investmentAnalysis.totalReturn + additional.investmentAnalysis.totalReturn) / 2,
        paybackPeriod: (existing.investmentAnalysis.paybackPeriod + additional.investmentAnalysis.paybackPeriod) / 2,
        irr: (existing.investmentAnalysis.irr + additional.investmentAnalysis.irr) / 2,
        appreciation: (existing.investmentAnalysis.appreciation + additional.investmentAnalysis.appreciation) / 2,
        riskScore: (existing.investmentAnalysis.riskScore + additional.investmentAnalysis.riskScore) / 2,
        liquidityScore: (existing.investmentAnalysis.liquidityScore + additional.investmentAnalysis.liquidityScore) / 2,
        marketScore: (existing.investmentAnalysis.marketScore + additional.investmentAnalysis.marketScore) / 2
      } : existing.investmentAnalysis || additional.investmentAnalysis,
      
      // Combine data sources
      dataQuality: {
        completeness: Math.max(existing.dataQuality?.completeness || 0, additional.dataQuality?.completeness || 0),
        freshness: Math.min(existing.dataQuality?.freshness || 999, additional.dataQuality?.freshness || 999),
        accuracy: Math.max(existing.dataQuality?.accuracy || 0, additional.dataQuality?.accuracy || 0),
        sources: [
          ...(existing.dataQuality?.sources || []),
          ...(additional.dataQuality?.sources || [])
        ].filter((source, index, array) => array.indexOf(source) === index),
        lastUpdated: new Date(),
        verified: (existing.dataQuality?.verified || false) || (additional.dataQuality?.verified || false)
      }
    }
  }

  /**
   * Enhance property data with calculated metrics
   */
  private async enhancePropertyData(properties: EnhancedPropertyListing[]): Promise<EnhancedPropertyListing[]> {
    return properties.map(property => ({
      ...property,
      
      // Calculate missing investment metrics
      investmentAnalysis: property.investmentAnalysis || this.calculateInvestmentMetrics(property),
      
      // Add market comparatives
      comparatives: property.comparatives || this.calculateComparatives(property, properties),
      
      // Enhance data quality score
      dataQuality: {
        ...property.dataQuality,
        completeness: this.calculateCompleteness(property),
        ...property.dataQuality
      }
    }))
  }

  /**
   * Calculate investment metrics for properties missing them
   */
  private calculateInvestmentMetrics(property: EnhancedPropertyListing): any {
    const price = property.price || 500000
    const estimatedRent = price * 0.008 // 0.8% of price as monthly rent
    const estimatedExpenses = estimatedRent * 0.3 // 30% of rent as expenses
    const noi = (estimatedRent - estimatedExpenses) * 12
    
    return {
      capRate: (noi / price) * 100,
      cashFlow: estimatedRent - estimatedExpenses,
      cashOnCash: 8.5,
      totalReturn: 12.8,
      paybackPeriod: 10.2,
      irr: 14.5,
      appreciation: 6.5,
      riskScore: Math.random() * 40 + 20, // Random risk between 20-60
      liquidityScore: property.type === 'residential' ? 80 : property.type === 'commercial' ? 60 : 40,
      marketScore: 75 + Math.random() * 20
    }
  }

  /**
   * Calculate comparative metrics
   */
  private calculateComparatives(property: EnhancedPropertyListing, allProperties: EnhancedPropertyListing[]): any {
    const similarProperties = allProperties.filter(p => 
      p.type === property.type && p.id !== property.id
    )
    
    const avgPrice = similarProperties.reduce((sum, p) => sum + (p.price || 0), 0) / similarProperties.length
    const priceVsMarket = property.price ? ((property.price - avgPrice) / avgPrice) * 100 : 0
    
    return {
      priceVsMarket,
      capRateVsMarket: 0.5,
      appreciationVsMarket: 1.2,
      marketTrends: {
        priceGrowth1Year: 8.5 + Math.random() * 5,
        priceGrowth3Year: 25 + Math.random() * 10,
        priceGrowth5Year: 45 + Math.random() * 15,
        rentalGrowth1Year: 5 + Math.random() * 3
      }
    }
  }

  /**
   * Calculate data completeness score
   */
  private calculateCompleteness(property: EnhancedPropertyListing): number {
    let score = 0
    const totalFields = 15 // Total important fields
    
    if (property.address) score++
    if (property.price) score++
    if (property.squareFootage) score++
    if (property.description) score++
    if (property.marketMetrics?.walkScore) score++
    if (property.marketMetrics?.schoolRating) score++
    if (property.investmentAnalysis?.capRate) score++
    if (property.investmentAnalysis?.cashFlow) score++
    if (property.investmentAnalysis?.riskScore) score++
    if (property.comparatives?.priceVsMarket) score++
    if (property.dataQuality?.sources?.length) score++
    
    return (score / totalFields) * 100
  }

  /**
   * Get fallback data when APIs fail
   */
  private getFallbackData(filters: any): EnhancedPropertyListing[] {
    // Return sample enhanced properties for testing
    return [
      {
        id: 'fallback_001',
        address: 'Sample Property, Demo City, ST',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        type: 'commercial',
        price: 1000000,
        squareFootage: 5000,
        description: 'Sample property for demonstration',
        source: 'Demo',
        investmentAnalysis: {
          capRate: 7.5,
          cashFlow: 5000,
          cashOnCash: 8.2,
          totalReturn: 14.5,
          paybackPeriod: 8.8,
          irr: 16.2,
          appreciation: 7.0,
          riskScore: 30,
          liquidityScore: 70,
          marketScore: 80
        },
        dataQuality: {
          completeness: 75,
          freshness: 1,
          accuracy: 85,
          sources: ['Demo'],
          lastUpdated: new Date(),
          verified: false
        }
      }
    ]
  }

  /**
   * Get data source health metrics
   */
  getDataSourceHealth(): { source: string; status: 'active' | 'degraded' | 'down'; responseTime: number; reliability: number }[] {
    return this.dataSources.map(source => ({
      source: source.name,
      status: source.isActive ? 'active' : 'down',
      responseTime: Math.random() * 500 + 100,
      reliability: source.reliability
    }))
  }

  /**
   * Get market insights for a specific area
   */
  async getMarketInsights(coordinates: { lat: number; lng: number }, radius: number = 5): Promise<any> {
    // Mock market insights
    return {
      averagePrice: 850000,
      averageCapRate: 6.8,
      averageCashFlow: 3200,
      marketAppreciation: 8.5,
      inventoryCount: 45,
      daysOnMarket: 28,
      pricePerSqft: 425,
      marketTrend: 'rising',
      competitiveIndex: 75,
      investorActivity: 'high',
      recommendations: [
        'Strong rental demand in this area',
        'Property values have increased 12% YoY',
        'Low inventory suggests seller\'s market'
      ]
    }
  }
}

export const enhancedPropertyDataService = new EnhancedPropertyDataService()