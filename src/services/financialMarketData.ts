export interface InterestRateData {
  federalFundsRate: number
  treasury10Year: number
  treasury30Year: number
  mortgageRate30Year: number
  mortgageRate15Year: number
  commercialLendingRate: number
  date: Date
  source: string
}

export interface REITPerformanceData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  dividendYield: number
  peRatio: number
  sector: 'residential' | 'commercial' | 'healthcare' | 'retail' | 'industrial' | 'office' | 'diversified'
  nav: number
  premiumDiscount: number
  volume: number
  dayRange: { low: number; high: number }
  yearRange: { low: number; high: number }
  lastUpdated: Date
}

export interface EconomicIndicatorData {
  indicator: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  unit: string
  frequency: 'monthly' | 'quarterly' | 'annually'
  nextRelease?: Date
  lastUpdated: Date
  historicalData?: { date: Date; value: number }[]
}

export interface ConstructionCostData {
  index: number
  region: string
  costPerSqft: {
    residential: number
    commercial: number
    industrial: number
  }
  materialCosts: {
    steel: number
    concrete: number
    lumber: number
    labor: number
  }
  changeFromPreviousMonth: number
  changeFromPreviousYear: number
  lastUpdated: Date
}

export interface MarketBenchmarkData {
  benchmark: string
  value: number
  return1Month: number
  return3Month: number
  return1Year: number
  return3Year: number
  return5Year: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  lastUpdated: Date
}

// Financial Market Data Service
class FinancialMarketDataService {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private readonly CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

  /**
   * Fetch current interest rates from multiple sources
   */
  async fetchInterestRates(): Promise<InterestRateData> {
    const cacheKey = 'interest-rates'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // In production, this would fetch from APIs like FRED, Treasury.gov, etc.
      const rateData: InterestRateData = await this.fetchFromFREDAPI()
      
      this.cache.set(cacheKey, { data: rateData, timestamp: Date.now() })
      return rateData
    } catch (error) {
      console.error('Error fetching interest rates:', error)
      return this.getFallbackInterestRates()
    }
  }

  /**
   * Fetch REIT performance data
   */
  async fetchREITPerformance(): Promise<REITPerformanceData[]> {
    const cacheKey = 'reit-performance'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Major REITs to track
      const reitSymbols = [
        'VNQ', 'REZ', 'IYR', 'SCHH', 'XLRE', // ETFs
        'AMT', 'PLD', 'CCI', 'EQIX', 'PSA', // Individual REITs
        'WELL', 'DLR', 'O', 'SPG', 'AVB'
      ]

      const reitData = await Promise.all(
        reitSymbols.map(symbol => this.fetchREITData(symbol))
      )

      this.cache.set(cacheKey, { data: reitData, timestamp: Date.now() })
      return reitData
    } catch (error) {
      console.error('Error fetching REIT data:', error)
      return this.getFallbackREITData()
    }
  }

  /**
   * Fetch economic indicators
   */
  async fetchEconomicIndicators(): Promise<EconomicIndicatorData[]> {
    const cacheKey = 'economic-indicators'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const indicators = [
        'GDP', 'CPI', 'unemployment', 'housing-starts', 'building-permits',
        'existing-home-sales', 'new-home-sales', 'consumer-confidence',
        'industrial-production', 'retail-sales'
      ]

      const indicatorData = await Promise.all(
        indicators.map(indicator => this.fetchEconomicIndicator(indicator))
      )

      this.cache.set(cacheKey, { data: indicatorData, timestamp: Date.now() })
      return indicatorData
    } catch (error) {
      console.error('Error fetching economic indicators:', error)
      return this.getFallbackEconomicIndicators()
    }
  }

  /**
   * Fetch construction cost indices
   */
  async fetchConstructionCosts(): Promise<ConstructionCostData[]> {
    const cacheKey = 'construction-costs'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Major metropolitan areas
      const regions = [
        'National', 'New York', 'Los Angeles', 'Chicago', 'Houston',
        'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas'
      ]

      const costData = await Promise.all(
        regions.map(region => this.fetchConstructionCostData(region))
      )

      this.cache.set(cacheKey, { data: costData, timestamp: Date.now() })
      return costData
    } catch (error) {
      console.error('Error fetching construction costs:', error)
      return this.getFallbackConstructionCosts()
    }
  }

  /**
   * Fetch market benchmarks for comparison
   */
  async fetchMarketBenchmarks(): Promise<MarketBenchmarkData[]> {
    const cacheKey = 'market-benchmarks'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const benchmarks = [
        'S&P 500', 'FTSE NAREIT All REITs', 'FTSE NAREIT Equity REITs',
        'Dow Jones Real Estate Index', 'MSCI US REIT Index',
        '10-Year Treasury', 'High Yield Bond Index', 'Case-Shiller Home Price Index'
      ]

      const benchmarkData = await Promise.all(
        benchmarks.map(benchmark => this.fetchBenchmarkData(benchmark))
      )

      this.cache.set(cacheKey, { data: benchmarkData, timestamp: Date.now() })
      return benchmarkData
    } catch (error) {
      console.error('Error fetching market benchmarks:', error)
      return this.getFallbackBenchmarkData()
    }
  }

  /**
   * Get comprehensive market context for investment analysis
   */
  async getMarketContext(): Promise<{
    interestRates: InterestRateData
    reitPerformance: REITPerformanceData[]
    economicIndicators: EconomicIndicatorData[]
    constructionCosts: ConstructionCostData[]
    benchmarks: MarketBenchmarkData[]
    marketSentiment: {
      score: number
      description: string
      factors: string[]
    }
  }> {
    const [interestRates, reitPerformance, economicIndicators, constructionCosts, benchmarks] = 
      await Promise.all([
        this.fetchInterestRates(),
        this.fetchREITPerformance(),
        this.fetchEconomicIndicators(),
        this.fetchConstructionCosts(),
        this.fetchMarketBenchmarks()
      ])

    const marketSentiment = this.calculateMarketSentiment({
      interestRates,
      reitPerformance,
      economicIndicators
    })

    return {
      interestRates,
      reitPerformance,
      economicIndicators,
      constructionCosts,
      benchmarks,
      marketSentiment
    }
  }

  /**
   * Calculate market sentiment based on various indicators
   */
  private calculateMarketSentiment(data: {
    interestRates: InterestRateData
    reitPerformance: REITPerformanceData[]
    economicIndicators: EconomicIndicatorData[]
  }): { score: number; description: string; factors: string[] } {
    let score = 50 // Neutral starting point
    const factors: string[] = []

    // Interest rate impact
    if (data.interestRates.federalFundsRate > 5) {
      score -= 15
      factors.push('High federal funds rate creating headwinds')
    } else if (data.interestRates.federalFundsRate < 2) {
      score += 10
      factors.push('Low interest rates supporting valuations')
    }

    // REIT performance impact
    const avgREITChange = data.reitPerformance.reduce((sum, reit) => sum + reit.changePercent, 0) / data.reitPerformance.length
    if (avgREITChange > 2) {
      score += 10
      factors.push('Strong REIT performance indicating positive sentiment')
    } else if (avgREITChange < -2) {
      score -= 10
      factors.push('Weak REIT performance suggesting caution')
    }

    // GDP impact
    const gdpIndicator = data.economicIndicators.find(i => i.indicator === 'GDP')
    if (gdpIndicator && gdpIndicator.value > 2.5) {
      score += 5
      factors.push('Strong GDP growth supporting real estate demand')
    } else if (gdpIndicator && gdpIndicator.value < 1) {
      score -= 8
      factors.push('Weak GDP growth may impact real estate demand')
    }

    // Unemployment impact
    const unemploymentIndicator = data.economicIndicators.find(i => i.indicator === 'unemployment')
    if (unemploymentIndicator && unemploymentIndicator.value < 4) {
      score += 5
      factors.push('Low unemployment supporting rental demand')
    } else if (unemploymentIndicator && unemploymentIndicator.value > 6) {
      score -= 8
      factors.push('High unemployment may pressure rental markets')
    }

    // Determine description
    let description: string
    if (score >= 70) description = 'Very Bullish'
    else if (score >= 60) description = 'Bullish'
    else if (score >= 40) description = 'Neutral'
    else if (score >= 30) description = 'Bearish'
    else description = 'Very Bearish'

    return { score: Math.max(0, Math.min(100, score)), description, factors }
  }

  // Private API integration methods (mock implementations)
  
  private async fetchFromFREDAPI(): Promise<InterestRateData> {
    // Mock FRED API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      federalFundsRate: 5.25,
      treasury10Year: 4.35,
      treasury30Year: 4.55,
      mortgageRate30Year: 7.12,
      mortgageRate15Year: 6.45,
      commercialLendingRate: 6.85,
      date: new Date(),
      source: 'Federal Reserve Economic Data (FRED)'
    }
  }

  private async fetchREITData(symbol: string): Promise<REITPerformanceData> {
    // Mock stock API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const mockREITs: { [key: string]: Partial<REITPerformanceData> } = {
      'VNQ': { name: 'Vanguard Real Estate ETF', sector: 'diversified', price: 85.50, dividendYield: 3.8 },
      'AMT': { name: 'American Tower Corporation', sector: 'commercial', price: 185.25, dividendYield: 3.2 },
      'PLD': { name: 'Prologis Inc', sector: 'industrial', price: 115.75, dividendYield: 2.9 },
      'O': { name: 'Realty Income Corporation', sector: 'retail', price: 55.80, dividendYield: 5.4 },
      'AVB': { name: 'AvalonBay Communities', sector: 'residential', price: 178.90, dividendYield: 3.6 }
    }

    const baseData = mockREITs[symbol] || { name: `${symbol} REIT`, sector: 'diversified' as const, price: 100, dividendYield: 4.0 }
    
    return {
      symbol,
      name: baseData.name!,
      price: baseData.price!,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      marketCap: Math.random() * 50000000000,
      dividendYield: baseData.dividendYield!,
      peRatio: 15 + Math.random() * 20,
      sector: baseData.sector!,
      nav: baseData.price! * (0.95 + Math.random() * 0.1),
      premiumDiscount: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 10000000),
      dayRange: { low: baseData.price! * 0.98, high: baseData.price! * 1.02 },
      yearRange: { low: baseData.price! * 0.7, high: baseData.price! * 1.3 },
      lastUpdated: new Date()
    }
  }

  private async fetchEconomicIndicator(indicator: string): Promise<EconomicIndicatorData> {
    // Mock economic data API call
    await new Promise(resolve => setTimeout(resolve, 150))
    
    const mockIndicators: { [key: string]: Partial<EconomicIndicatorData> } = {
      'GDP': { value: 2.4, unit: '%', frequency: 'quarterly' as const },
      'CPI': { value: 3.2, unit: '%', frequency: 'monthly' as const },
      'unemployment': { value: 3.7, unit: '%', frequency: 'monthly' as const },
      'housing-starts': { value: 1.35, unit: 'millions', frequency: 'monthly' as const },
      'building-permits': { value: 1.45, unit: 'millions', frequency: 'monthly' as const }
    }

    const baseData = mockIndicators[indicator] || { value: Math.random() * 10, unit: 'index', frequency: 'monthly' as const }
    const previousValue = baseData.value! * (0.95 + Math.random() * 0.1)
    
    return {
      indicator,
      value: baseData.value!,
      previousValue,
      change: baseData.value! - previousValue,
      changePercent: ((baseData.value! - previousValue) / previousValue) * 100,
      unit: baseData.unit!,
      frequency: baseData.frequency!,
      nextRelease: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      lastUpdated: new Date()
    }
  }

  private async fetchConstructionCostData(region: string): Promise<ConstructionCostData> {
    // Mock construction cost API call
    await new Promise(resolve => setTimeout(resolve, 120))
    
    const baseIndex = 100 + Math.random() * 50
    
    return {
      index: baseIndex,
      region,
      costPerSqft: {
        residential: 150 + Math.random() * 100,
        commercial: 200 + Math.random() * 150,
        industrial: 100 + Math.random() * 75
      },
      materialCosts: {
        steel: baseIndex * 1.2,
        concrete: baseIndex * 0.8,
        lumber: baseIndex * 1.5,
        labor: baseIndex * 1.1
      },
      changeFromPreviousMonth: (Math.random() - 0.5) * 5,
      changeFromPreviousYear: 5 + Math.random() * 10,
      lastUpdated: new Date()
    }
  }

  private async fetchBenchmarkData(benchmark: string): Promise<MarketBenchmarkData> {
    // Mock benchmark API call
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const baseReturn = (Math.random() - 0.3) * 20 // -6% to +14% range
    
    return {
      benchmark,
      value: 100 + Math.random() * 200,
      return1Month: baseReturn * 0.1,
      return3Month: baseReturn * 0.25,
      return1Year: baseReturn,
      return3Year: baseReturn * 2.5,
      return5Year: baseReturn * 4,
      volatility: 10 + Math.random() * 15,
      sharpeRatio: (Math.random() - 0.2) * 2,
      maxDrawdown: -(5 + Math.random() * 20),
      lastUpdated: new Date()
    }
  }

  // Fallback data methods
  
  private getFallbackInterestRates(): InterestRateData {
    return {
      federalFundsRate: 5.25,
      treasury10Year: 4.35,
      treasury30Year: 4.55,
      mortgageRate30Year: 7.12,
      mortgageRate15Year: 6.45,
      commercialLendingRate: 6.85,
      date: new Date(),
      source: 'Fallback Data'
    }
  }

  private getFallbackREITData(): REITPerformanceData[] {
    return [
      {
        symbol: 'VNQ',
        name: 'Vanguard Real Estate ETF',
        price: 85.50,
        change: 1.25,
        changePercent: 1.48,
        marketCap: 28000000000,
        dividendYield: 3.8,
        peRatio: 18.5,
        sector: 'diversified',
        nav: 84.95,
        premiumDiscount: 0.65,
        volume: 2500000,
        dayRange: { low: 84.20, high: 85.80 },
        yearRange: { low: 72.10, high: 92.30 },
        lastUpdated: new Date()
      }
    ]
  }

  private getFallbackEconomicIndicators(): EconomicIndicatorData[] {
    return [
      {
        indicator: 'GDP',
        value: 2.4,
        previousValue: 2.1,
        change: 0.3,
        changePercent: 14.3,
        unit: '%',
        frequency: 'quarterly',
        lastUpdated: new Date()
      }
    ]
  }

  private getFallbackConstructionCosts(): ConstructionCostData[] {
    return [
      {
        index: 125.4,
        region: 'National',
        costPerSqft: {
          residential: 180,
          commercial: 250,
          industrial: 140
        },
        materialCosts: {
          steel: 150.5,
          concrete: 100.2,
          lumber: 188.7,
          labor: 138.1
        },
        changeFromPreviousMonth: 1.2,
        changeFromPreviousYear: 8.5,
        lastUpdated: new Date()
      }
    ]
  }

  private getFallbackBenchmarkData(): MarketBenchmarkData[] {
    return [
      {
        benchmark: 'S&P 500',
        value: 4850.25,
        return1Month: 2.1,
        return3Month: 5.8,
        return1Year: 12.4,
        return3Year: 8.9,
        return5Year: 11.2,
        volatility: 16.5,
        sharpeRatio: 0.68,
        maxDrawdown: -23.5,
        lastUpdated: new Date()
      }
    ]
  }

  /**
   * Get current market health score
   */
  async getMarketHealthScore(): Promise<{
    score: number
    components: {
      interestRates: number
      reitPerformance: number
      economicGrowth: number
      constructionCosts: number
    }
    recommendation: string
  }> {
    try {
      const context = await this.getMarketContext()
      
      // Calculate component scores (0-100)
      const interestRatesScore = Math.max(0, 100 - (context.interestRates.federalFundsRate * 15))
      const reitPerformanceScore = Math.min(100, Math.max(0, 50 + (context.reitPerformance.reduce((sum, reit) => sum + reit.changePercent, 0) / context.reitPerformance.length) * 10))
      const gdpIndicator = context.economicIndicators.find(i => i.indicator === 'GDP')
      const economicGrowthScore = gdpIndicator ? Math.min(100, Math.max(0, gdpIndicator.value * 25)) : 50
      const constructionCostsScore = Math.max(0, 100 - Math.max(0, context.constructionCosts[0]?.changeFromPreviousYear || 0) * 5)
      
      const overallScore = (interestRatesScore + reitPerformanceScore + economicGrowthScore + constructionCostsScore) / 4
      
      let recommendation: string
      if (overallScore >= 75) recommendation = 'Favorable conditions for real estate investment'
      else if (overallScore >= 50) recommendation = 'Mixed conditions - proceed with caution'
      else recommendation = 'Challenging conditions - consider defensive strategies'
      
      return {
        score: Math.round(overallScore),
        components: {
          interestRates: Math.round(interestRatesScore),
          reitPerformance: Math.round(reitPerformanceScore),
          economicGrowth: Math.round(economicGrowthScore),
          constructionCosts: Math.round(constructionCostsScore)
        },
        recommendation
      }
    } catch (error) {
      console.error('Error calculating market health score:', error)
      return {
        score: 50,
        components: { interestRates: 50, reitPerformance: 50, economicGrowth: 50, constructionCosts: 50 },
        recommendation: 'Unable to assess market conditions'
      }
    }
  }
}

export const financialMarketDataService = new FinancialMarketDataService()