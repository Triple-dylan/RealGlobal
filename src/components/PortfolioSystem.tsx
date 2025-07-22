import React, { useState, useEffect, createContext, useContext } from 'react'
import { FeedItem } from '../types'

// Portfolio item extends FeedItem with additional portfolio-specific data
interface PortfolioItem extends FeedItem {
  portfolioStatus: 'owned' | 'watching' | 'analyzing' | 'target' | 'avoided'
  acquisitionDate?: Date
  purchasePrice?: number
  currentValue?: number
  monthlyIncome?: number
  expenses?: number
  notes?: string[]
  documents?: string[]
  alerts?: PortfolioAlert[]
}

interface PortfolioAlert {
  id: string
  type: 'market_change' | 'maintenance' | 'lease_expiry' | 'opportunity'
  severity: 'low' | 'medium' | 'high'
  message: string
  date: Date
  actionRequired?: boolean
}

interface PortfolioStats {
  totalValue: number
  propertyCount: number
  avgCapRate: number
  occupancyRate: number
  monthlyIncome: number
  totalIncome: number
  totalExpenses: number
  netWorth: number
  diversificationScore: number
  // Advanced Analytics
  sharpeRatio: number
  portfolioBeta: number
  riskAdjustedReturn: number
  annualizedReturn: number
  volatility: number
  maxDrawdown: number
  geographicDiversification: {
    citiesCount: number
    statesCount: number
    countriesCount: number
    herfindahlIndex: number
  }
  propertyTypeDiversification: {
    typesCount: number
    distributionBalance: number
  }
  riskMetrics: {
    concentrationRisk: number
    liquidityRisk: number
    marketRisk: number
    overallRiskScore: number
  }
}

interface PortfolioContextType {
  portfolioItems: PortfolioItem[]
  workspaceItems: FeedItem[]
  portfolioStats: PortfolioStats
  addToPortfolio: (item: FeedItem) => void
  removeFromPortfolio: (itemId: string) => void
  updatePortfolioItem: (itemId: string, updates: Partial<PortfolioItem>) => void
  moveToWorkspace: (itemId: string) => void
  addToWorkspace: (item: FeedItem) => void
  removeFromWorkspace: (itemId: string) => void
  getPortfolioPillars: () => any[]
  generatePortfolioReport: () => string
  getRecommendations: () => FeedItem[]
}

const PortfolioContext = createContext<PortfolioContextType | null>(null)

export const usePortfolio = () => {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}

interface PortfolioProviderProps {
  children: React.ReactNode
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [workspaceItems, setWorkspaceItems] = useState<FeedItem[]>([])

  // Enhanced portfolio analytics calculation
  const calculateStats = (): PortfolioStats => {
    const ownedProperties = portfolioItems.filter(item => item.portfolioStatus === 'owned')
    
    const totalValue = ownedProperties.reduce((sum, item) => 
      sum + (item.currentValue || item.purchasePrice || 0), 0)
    
    const monthlyIncome = ownedProperties.reduce((sum, item) => 
      sum + (item.monthlyIncome || 0), 0)
    
    const totalExpenses = ownedProperties.reduce((sum, item) => 
      sum + (item.expenses || 0), 0)
    
    const avgCapRate = ownedProperties.length > 0 
      ? ownedProperties.reduce((sum, item) => 
          sum + (item.marketData?.capRate || 0), 0) / ownedProperties.length
      : 0
    
    const avgOccupancy = ownedProperties.length > 0
      ? ownedProperties.reduce((sum, item) => 
          sum + ((item.marketData?.occupancyRate || 100) - (item.marketData?.vacancy || 0)), 0) / ownedProperties.length
      : 0

    // Advanced Analytics Calculations
    const annualIncome = monthlyIncome * 12
    const netOperatingIncome = annualIncome - (totalExpenses * 12)
    const annualizedReturn = totalValue > 0 ? (netOperatingIncome / totalValue) * 100 : 0

    // Risk-adjusted metrics (simplified for real estate)
    const riskFreeRate = 4.5 // Current 10-year treasury rate approximation
    const excessReturn = annualizedReturn - riskFreeRate
    const portfolioVolatility = calculatePortfolioVolatility(ownedProperties)
    const sharpeRatio = portfolioVolatility > 0 ? excessReturn / portfolioVolatility : 0
    const portfolioBeta = calculatePortfolioBeta(ownedProperties)
    const riskAdjustedReturn = annualizedReturn - (portfolioBeta * (8.5 - riskFreeRate)) // REIT market premium ~4%
    const maxDrawdown = calculateMaxDrawdown(ownedProperties)

    // Geographic diversification analysis
    const geographicDiversification = calculateGeographicDiversification(ownedProperties)
    
    // Property type diversification
    const propertyTypeDiversification = calculatePropertyTypeDiversification(ownedProperties)

    // Risk metrics
    const riskMetrics = calculateRiskMetrics(ownedProperties, totalValue)

    // Overall diversification score (enhanced)
    const diversificationScore = (
      geographicDiversification.herfindahlIndex * 0.4 +
      propertyTypeDiversification.distributionBalance * 0.3 +
      (Math.min(ownedProperties.length / 10, 1) * 100) * 0.3
    )

    return {
      totalValue,
      propertyCount: ownedProperties.length,
      avgCapRate,
      occupancyRate: avgOccupancy,
      monthlyIncome,
      totalIncome: annualIncome,
      totalExpenses: totalExpenses * 12,
      netWorth: totalValue - (totalExpenses * 12),
      diversificationScore,
      sharpeRatio,
      portfolioBeta,
      riskAdjustedReturn,
      annualizedReturn,
      volatility: portfolioVolatility,
      maxDrawdown,
      geographicDiversification,
      propertyTypeDiversification,
      riskMetrics
    }
  }

  // Helper function: Calculate portfolio volatility
  const calculatePortfolioVolatility = (properties: PortfolioItem[]): number => {
    if (properties.length < 2) return 15 // Default volatility for single property
    
    const capRates = properties.map(p => p.marketData?.capRate || avgCapRate || 6)
    const avgCapRate = capRates.reduce((sum, rate) => sum + rate, 0) / capRates.length
    const variance = capRates.reduce((sum, rate) => sum + Math.pow(rate - avgCapRate, 2), 0) / capRates.length
    return Math.sqrt(variance) * 2.5 // Scale factor for annual volatility
  }

  // Helper function: Calculate portfolio beta
  const calculatePortfolioBeta = (properties: PortfolioItem[]): number => {
    // Simplified beta calculation based on property types and locations
    const propertyTypeWeights = {
      'commercial': 1.2,
      'residential': 0.8,
      'industrial': 1.1,
      'mixed-use': 1.0,
      'multifamily': 0.9,
      'land': 1.5
    }
    
    let weightedBeta = 0
    let totalWeight = 0
    
    properties.forEach(property => {
      const value = property.currentValue || property.purchasePrice || 0
      const typeBeta = propertyTypeWeights[property.type as keyof typeof propertyTypeWeights] || 1.0
      weightedBeta += typeBeta * value
      totalWeight += value
    })
    
    return totalWeight > 0 ? weightedBeta / totalWeight : 1.0
  }

  // Helper function: Calculate maximum drawdown
  const calculateMaxDrawdown = (properties: PortfolioItem[]): number => {
    // Simplified calculation - in real implementation, would use historical value changes
    const values = properties.map(p => p.currentValue || p.purchasePrice || 0)
    if (values.length === 0) return 0
    
    const maxValue = Math.max(...values)
    const minValue = Math.min(...values)
    return maxValue > 0 ? ((maxValue - minValue) / maxValue) * 100 : 0
  }

  // Helper function: Geographic diversification analysis
  const calculateGeographicDiversification = (properties: PortfolioItem[]) => {
    const cities = new Set<string>()
    const states = new Set<string>()
    const countries = new Set<string>()
    const cityValues: { [key: string]: number } = {}
    
    let totalValue = 0
    
    properties.forEach(property => {
      const value = property.currentValue || property.purchasePrice || 0
      totalValue += value
      
      if (property.location) {
        // Simplified location extraction (would use geocoding in real implementation)
        const cityKey = `${Math.floor(property.location.lat * 10)}_${Math.floor(property.location.lng * 10)}`
        const stateKey = `${Math.floor(property.location.lat)}_${Math.floor(property.location.lng)}`
        const countryKey = property.location.lat > 24 && property.location.lat < 50 && 
                          property.location.lng > -125 && property.location.lng < -66 ? 'USA' : 'Other'
        
        cities.add(cityKey)
        states.add(stateKey)
        countries.add(countryKey)
        
        cityValues[cityKey] = (cityValues[cityKey] || 0) + value
      }
    })
    
    // Calculate Herfindahl-Hirschman Index for concentration
    let hhi = 0
    Object.values(cityValues).forEach(value => {
      const share = value / totalValue
      hhi += share * share
    })
    
    const herfindahlIndex = Math.max(0, (1 - hhi) * 100) // Convert to diversification score
    
    return {
      citiesCount: cities.size,
      statesCount: states.size,
      countriesCount: countries.size,
      herfindahlIndex
    }
  }

  // Helper function: Property type diversification
  const calculatePropertyTypeDiversification = (properties: PortfolioItem[]) => {
    const typeValues: { [key: string]: number } = {}
    let totalValue = 0
    
    properties.forEach(property => {
      const value = property.currentValue || property.purchasePrice || 0
      const type = property.type || 'unknown'
      typeValues[type] = (typeValues[type] || 0) + value
      totalValue += value
    })
    
    const types = Object.keys(typeValues)
    let distributionBalance = 0
    
    if (totalValue > 0) {
      let hhi = 0
      Object.values(typeValues).forEach(value => {
        const share = value / totalValue
        hhi += share * share
      })
      distributionBalance = Math.max(0, (1 - hhi) * 100)
    }
    
    return {
      typesCount: types.length,
      distributionBalance
    }
  }

  // Helper function: Risk metrics calculation
  const calculateRiskMetrics = (properties: PortfolioItem[], totalValue: number) => {
    // Concentration risk (based on largest property)
    const propertyValues = properties.map(p => p.currentValue || p.purchasePrice || 0)
    const maxPropertyValue = Math.max(...propertyValues, 0)
    const concentrationRisk = totalValue > 0 ? (maxPropertyValue / totalValue) * 100 : 0
    
    // Liquidity risk (based on property types - commercial less liquid than residential)
    const liquidityWeights = {
      'residential': 0.2,
      'multifamily': 0.4,
      'commercial': 0.7,
      'industrial': 0.8,
      'land': 0.9,
      'mixed-use': 0.6
    }
    
    let weightedLiquidityRisk = 0
    properties.forEach(property => {
      const value = property.currentValue || property.purchasePrice || 0
      const weight = value / totalValue
      const liquidityRisk = liquidityWeights[property.type as keyof typeof liquidityWeights] || 0.5
      weightedLiquidityRisk += liquidityRisk * weight
    })
    
    // Market risk (based on average cap rates vs market benchmarks)
    const marketBenchmark = 6.5 // Average commercial real estate cap rate
    const avgCapRate = properties.reduce((sum, p) => sum + (p.marketData?.capRate || 6), 0) / Math.max(properties.length, 1)
    const marketRisk = Math.abs(avgCapRate - marketBenchmark) * 10 // Scale factor
    
    // Overall risk score
    const overallRiskScore = (concentrationRisk * 0.4 + weightedLiquidityRisk * 100 * 0.3 + marketRisk * 0.3)
    
    return {
      concentrationRisk,
      liquidityRisk: weightedLiquidityRisk * 100,
      marketRisk,
      overallRiskScore
    }
  }

  const portfolioStats = calculateStats()

  // Add item to portfolio
  const addToPortfolio = (item: FeedItem) => {
    const portfolioItem: PortfolioItem = {
      ...item,
      portfolioStatus: 'owned',
      acquisitionDate: new Date(),
      purchasePrice: item.marketData?.averagePrice,
      currentValue: item.marketData?.averagePrice,
      monthlyIncome: item.marketData?.averagePrice 
        ? (item.marketData.averagePrice * (item.marketData.capRate || 6) / 100) / 12 
        : undefined,
      notes: [],
      documents: [],
      alerts: []
    }
    
    setPortfolioItems(prev => [...prev, portfolioItem])
    
    // Remove from workspace if it exists there
    setWorkspaceItems(prev => prev.filter(workspaceItem => workspaceItem.id !== item.id))
  }

  // Remove from portfolio
  const removeFromPortfolio = (itemId: string) => {
    setPortfolioItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Update portfolio item
  const updatePortfolioItem = (itemId: string, updates: Partial<PortfolioItem>) => {
    setPortfolioItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ))
  }

  // Move from portfolio to workspace
  const moveToWorkspace = (itemId: string) => {
    const portfolioItem = portfolioItems.find(item => item.id === itemId)
    if (portfolioItem) {
      const workspaceItem: FeedItem = {
        id: portfolioItem.id,
        type: portfolioItem.type,
        title: portfolioItem.title,
        content: portfolioItem.content,
        location: portfolioItem.location,
        marketData: portfolioItem.marketData,
        timestamp: portfolioItem.timestamp,
        selected: false
      }
      
      setWorkspaceItems(prev => [...prev, workspaceItem])
      removeFromPortfolio(itemId)
    }
  }

  // Add to workspace
  const addToWorkspace = (item: FeedItem) => {
    setWorkspaceItems(prev => {
      // Avoid duplicates
      if (prev.find(existing => existing.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }

  // Remove from workspace
  const removeFromWorkspace = (itemId: string) => {
    setWorkspaceItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Get portfolio items as pillar data for map visualization
  const getPortfolioPillars = () => {
    return portfolioItems
      .filter(item => item.location)
      .map(item => ({
        id: item.id,
        coordinates: [item.location!.lng, item.location!.lat] as [number, number],
        height: Math.min((item.currentValue || 100000) / 1000000, 1), // Normalized height
        color: getStatusColor(item.portfolioStatus),
        value: item.currentValue || item.purchasePrice,
        type: item.portfolioStatus === 'owned' ? 'portfolio' : 'potential',
        status: item.portfolioStatus
      }))
  }

  // Get status-based colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'owned': return '#10B981'
      case 'watching': return '#3B82F6'
      case 'analyzing': return '#F59E0B'
      case 'target': return '#8B5CF6'
      case 'avoided': return '#EF4444'
      default: return '#6B7280'
    }
  }

  // Generate enhanced portfolio performance report
  const generatePortfolioReport = (): string => {
    const stats = portfolioStats
    
    return `
# Portfolio Performance Report
Generated: ${new Date().toLocaleDateString()}

## Executive Summary
- **Total Portfolio Value**: $${stats.totalValue.toLocaleString()}
- **Property Count**: ${stats.propertyCount}
- **Average Cap Rate**: ${stats.avgCapRate.toFixed(2)}%
- **Occupancy Rate**: ${stats.occupancyRate.toFixed(1)}%
- **Annualized Return**: ${stats.annualizedReturn.toFixed(2)}%

## Financial Performance
- **Monthly Income**: $${stats.monthlyIncome.toLocaleString()}
- **Annual Income**: $${stats.totalIncome.toLocaleString()}
- **Annual Expenses**: $${stats.totalExpenses.toLocaleString()}
- **Net Worth**: $${stats.netWorth.toLocaleString()}

## Advanced Risk Analytics
- **Sharpe Ratio**: ${stats.sharpeRatio.toFixed(2)}
- **Portfolio Beta**: ${stats.portfolioBeta.toFixed(2)}
- **Risk-Adjusted Return**: ${stats.riskAdjustedReturn.toFixed(2)}%
- **Portfolio Volatility**: ${stats.volatility.toFixed(1)}%
- **Maximum Drawdown**: ${stats.maxDrawdown.toFixed(1)}%

## Diversification Analysis
- **Overall Diversification Score**: ${stats.diversificationScore.toFixed(1)}/100
- **Geographic Spread**: ${stats.geographicDiversification.citiesCount} cities, ${stats.geographicDiversification.statesCount} regions
- **Property Types**: ${stats.propertyTypeDiversification.typesCount} different types
- **Geographic Diversification**: ${stats.geographicDiversification.herfindahlIndex.toFixed(1)}/100
- **Type Distribution Balance**: ${stats.propertyTypeDiversification.distributionBalance.toFixed(1)}/100

## Risk Assessment
- **Overall Risk Score**: ${stats.riskMetrics.overallRiskScore.toFixed(1)}/100
- **Concentration Risk**: ${stats.riskMetrics.concentrationRisk.toFixed(1)}% (largest property)
- **Liquidity Risk**: ${stats.riskMetrics.liquidityRisk.toFixed(1)}/100
- **Market Risk**: ${stats.riskMetrics.marketRisk.toFixed(1)}/100
- **Risk Level**: ${stats.riskMetrics.overallRiskScore < 30 ? 'Low' : stats.riskMetrics.overallRiskScore < 60 ? 'Medium' : 'High'}

## Performance Benchmarking
- **vs. REIT Index**: ${stats.annualizedReturn > 8.5 ? '+' : ''}${(stats.annualizedReturn - 8.5).toFixed(2)}%
- **Risk-Adjusted Performance**: ${stats.sharpeRatio > 0.5 ? 'Above Average' : stats.sharpeRatio > 0 ? 'Average' : 'Below Average'}
- **Diversification vs. Optimal**: ${stats.diversificationScore > 70 ? 'Well Diversified' : stats.diversificationScore > 40 ? 'Moderately Diversified' : 'Concentration Risk'}

## Recommendations
${generateRecommendations(stats).map(rec => `- ${rec}`).join('\n')}

## Property Breakdown
${portfolioItems.map(item => `
### ${item.title}
- Status: ${item.portfolioStatus}
- Value: $${(item.currentValue || 0).toLocaleString()}
- Monthly Income: $${(item.monthlyIncome || 0).toLocaleString()}
- Cap Rate: ${item.marketData?.capRate || 'N/A'}%
- Portfolio Weight: ${((item.currentValue || 0) / stats.totalValue * 100).toFixed(1)}%
`).join('')}
    `
  }

  // Generate AI-powered recommendations based on advanced analytics
  const generateRecommendations = (stats: PortfolioStats): string[] => {
    const recommendations: string[] = []
    
    // Risk-based recommendations
    if (stats.riskMetrics.concentrationRisk > 40) {
      recommendations.push('🎯 **Reduce Concentration Risk**: Largest property represents ${stats.riskMetrics.concentrationRisk.toFixed(1)}% of portfolio. Consider diversifying.')
    }
    
    if (stats.geographicDiversification.citiesCount < 3 && stats.propertyCount > 2) {
      recommendations.push('🌍 **Expand Geographic Diversification**: Properties concentrated in ${stats.geographicDiversification.citiesCount} location(s). Consider other markets.')
    }
    
    if (stats.propertyTypeDiversification.typesCount < 2 && stats.propertyCount > 1) {
      recommendations.push('🏢 **Diversify Property Types**: Portfolio focused on single property type. Mix commercial, residential, and industrial.')
    }
    
    // Performance-based recommendations
    if (stats.avgCapRate < 5) {
      recommendations.push('📈 **Improve Yield**: Average cap rate of ${stats.avgCapRate.toFixed(2)}% is below market. Target higher-yielding properties.')
    }
    
    if (stats.sharpeRatio < 0.3) {
      recommendations.push('⚖️ **Optimize Risk-Return Balance**: Sharpe ratio of ${stats.sharpeRatio.toFixed(2)} suggests poor risk-adjusted returns.')
    }
    
    if (stats.occupancyRate < 85) {
      recommendations.push('🏠 **Address Vacancy Issues**: ${stats.occupancyRate.toFixed(1)}% occupancy is below optimal. Focus on tenant retention and marketing.')
    }
    
    // Growth recommendations
    if (stats.propertyCount < 5) {
      recommendations.push('📊 **Scale Portfolio**: With ${stats.propertyCount} properties, consider adding 2-3 more for better diversification benefits.')
    }
    
    if (stats.riskMetrics.liquidityRisk > 70) {
      recommendations.push('💧 **Improve Liquidity**: High liquidity risk detected. Consider adding more liquid property types or REITs.')
    }
    
    // Market positioning
    if (stats.portfolioBeta > 1.3) {
      recommendations.push('📉 **Reduce Market Sensitivity**: Portfolio beta of ${stats.portfolioBeta.toFixed(2)} indicates high market correlation. Add defensive assets.')
    }
    
    return recommendations.length > 0 ? recommendations : ['✅ **Portfolio Optimized**: Current allocation appears well-balanced for your risk profile.']
  }

  // Enhanced AI-powered recommendations based on advanced portfolio analytics
  const getRecommendations = (): FeedItem[] => {
    const recommendations: FeedItem[] = []
    const stats = portfolioStats
    
    // Advanced risk-based recommendations
    if (stats.riskMetrics.concentrationRisk > 35) {
      recommendations.push({
        id: `rec-concentration-${Date.now()}`,
        type: 'analysis',
        title: '🎯 Concentration Risk Alert',
        content: `Your largest property represents ${stats.riskMetrics.concentrationRisk.toFixed(1)}% of total portfolio value. Consider diversifying to reduce single-asset risk exposure.`,
        timestamp: new Date(),
        selected: false,
        marketData: {
          capRate: stats.avgCapRate,
          occupancyRate: stats.occupancyRate
        }
      })
    }
    
    if (stats.sharpeRatio < 0.4) {
      recommendations.push({
        id: `rec-sharpe-${Date.now()}`,
        type: 'analysis',
        title: '⚖️ Risk-Adjusted Return Optimization',
        content: `Current Sharpe ratio of ${stats.sharpeRatio.toFixed(2)} indicates suboptimal risk-adjusted returns. Target properties with cap rates 1-2% above current ${stats.avgCapRate.toFixed(1)}% average.`,
        timestamp: new Date(),
        selected: false,
        marketData: {
          capRate: stats.avgCapRate + 1.5,
          occupancyRate: 92
        }
      })
    }
    
    if (stats.geographicDiversification.citiesCount < 3 && stats.propertyCount > 2) {
      recommendations.push({
        id: `rec-geographic-${Date.now()}`,
        type: 'analysis',
        title: '🌍 Geographic Diversification',
        content: `Properties are concentrated in ${stats.geographicDiversification.citiesCount} location(s). Expanding to 4-5 markets could improve diversification score from ${stats.diversificationScore.toFixed(1)} to 75+.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    if (stats.propertyTypeDiversification.typesCount < 2 && stats.propertyCount > 1) {
      recommendations.push({
        id: `rec-property-types-${Date.now()}`,
        type: 'analysis',
        title: '🏢 Property Type Diversification',
        content: `Single property type concentration detected. Adding complementary property types (commercial, multifamily, industrial) could reduce volatility by 15-25%.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    if (stats.portfolioBeta > 1.25) {
      recommendations.push({
        id: `rec-beta-${Date.now()}`,
        type: 'analysis',
        title: '📉 Market Sensitivity Reduction',
        content: `Portfolio beta of ${stats.portfolioBeta.toFixed(2)} indicates high market correlation. Consider defensive assets like healthcare or storage properties to reduce systematic risk.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    if (stats.avgCapRate < 5.5) {
      recommendations.push({
        id: `rec-yield-enhancement-${Date.now()}`,
        type: 'analysis',
        title: '📈 Yield Enhancement Opportunity',
        content: `Current ${stats.avgCapRate.toFixed(2)}% average cap rate is below market. Target properties with 6.5-8% cap rates in secondary markets for improved cash flow.`,
        timestamp: new Date(),
        selected: false,
        marketData: {
          capRate: 7.2,
          occupancyRate: 88
        }
      })
    }
    
    if (stats.riskMetrics.liquidityRisk > 65) {
      recommendations.push({
        id: `rec-liquidity-${Date.now()}`,
        type: 'analysis',
        title: '💧 Liquidity Risk Management',
        content: `High liquidity risk score of ${stats.riskMetrics.liquidityRisk.toFixed(1)}. Consider allocating 15-20% to REITs or publicly traded real estate for improved liquidity.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    if (stats.occupancyRate < 88) {
      recommendations.push({
        id: `rec-occupancy-${Date.now()}`,
        type: 'analysis',
        title: '🏠 Occupancy Optimization',
        content: `${stats.occupancyRate.toFixed(1)}% occupancy is below optimal 90-95% range. Improving tenant retention could increase NOI by $${((95 - stats.occupancyRate) / 100 * stats.monthlyIncome * 12).toLocaleString()}/year.`,
        timestamp: new Date(),
        selected: false,
        marketData: {
          occupancyRate: 95,
          capRate: stats.avgCapRate
        }
      })
    }
    
    // Growth and optimization recommendations
    if (stats.propertyCount < 5 && stats.totalValue > 500000) {
      recommendations.push({
        id: `rec-scaling-${Date.now()}`,
        type: 'analysis',
        title: '📊 Portfolio Scaling Strategy',
        content: `With ${stats.propertyCount} properties valued at $${(stats.totalValue / 1000000).toFixed(1)}M, adding 2-3 complementary assets could achieve optimal diversification and economies of scale.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    if (stats.maxDrawdown > 25) {
      recommendations.push({
        id: `rec-drawdown-${Date.now()}`,
        type: 'analysis',
        title: '📉 Drawdown Risk Mitigation',
        content: `Maximum drawdown of ${stats.maxDrawdown.toFixed(1)}% suggests vulnerability to market cycles. Consider counter-cyclical properties or defensive sectors.`,
        timestamp: new Date(),
        selected: false
      })
    }
    
    // Positive reinforcement for well-optimized portfolios
    if (recommendations.length === 0) {
      recommendations.push({
        id: `rec-optimized-${Date.now()}`,
        type: 'analysis',
        title: '✅ Portfolio Well-Optimized',
        content: `Strong performance metrics: Sharpe ratio ${stats.sharpeRatio.toFixed(2)}, diversification score ${stats.diversificationScore.toFixed(1)}, and ${stats.avgCapRate.toFixed(2)}% cap rate. Continue monitoring market conditions.`,
        timestamp: new Date(),
        selected: false,
        marketData: {
          capRate: stats.avgCapRate,
          occupancyRate: stats.occupancyRate
        }
      })
    }
    
    return recommendations
  }

  const contextValue: PortfolioContextType = {
    portfolioItems,
    workspaceItems,
    portfolioStats,
    addToPortfolio,
    removeFromPortfolio,
    updatePortfolioItem,
    moveToWorkspace,
    addToWorkspace,
    removeFromWorkspace,
    getPortfolioPillars,
    generatePortfolioReport,
    getRecommendations
  }

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  )
}

export default PortfolioProvider