import { saasTheme } from '../../theme'
import { commercialAPI, CommercialProperty, MarketMetrics } from './commercial-api'

export interface CommercialZone {
  id: string
  type: 'office' | 'retail' | 'industrial' | 'mixed-use'
  name: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  properties: {
    zoning: string
    allowedUses: string[]
    maxHeight: number | null
    density: number | null
    averageRent: number | null
    vacancy: number | null
    developmentPipeline: number
  }
  market: {
    averageCapRate: number
    pricePerSqft: number
    demandTrend: 'increasing' | 'stable' | 'decreasing'
    competitiveness: 'high' | 'medium' | 'low'
  }
}

export interface MultifamilyZone {
  id: string
  type: 'low-density' | 'mid-density' | 'high-density' | 'mixed-income'
  name: string
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
  properties: {
    zoning: string
    maxUnits: number | null
    affordableRequirement: number | null
    averageRent: number | null
    occupancy: number | null
    developmentPipeline: number
  }
  market: {
    averageCapRate: number
    rentGrowth: number
    demandTrend: 'increasing' | 'stable' | 'decreasing'
    competitiveness: 'high' | 'medium' | 'low'
  }
}

export class CommercialZonesService {
  async getCommercialZones(bounds: any): Promise<CommercialZone[]> {
    try {
      // Try to get real commercial property data
      const properties = await commercialAPI.searchProperties({
        bounds,
        propertyTypes: ['office', 'retail', 'industrial', 'mixed-use'],
        limit: 50
      })

      // Convert properties to zones (group by area/zoning)
      const zones = this.convertPropertiesToZones(properties)
      
      if (zones.length > 0) {
        return zones
      }
    } catch (error) {
      console.warn('Failed to fetch commercial data, using mock data:', error)
    }

    // Fallback to mock data
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 'cz-001',
        type: 'office',
        name: 'Downtown Financial District',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.0059, 40.7589],
            [-74.0034, 40.7589],
            [-74.0034, 40.7614],
            [-74.0059, 40.7614],
            [-74.0059, 40.7589]
          ]]
        },
        properties: {
          zoning: 'C6-9',
          allowedUses: ['office', 'retail', 'hotel'],
          maxHeight: 400,
          density: 15.0,
          averageRent: 85,
          vacancy: 12.5,
          developmentPipeline: 3
        },
        market: {
          averageCapRate: 4.2,
          pricePerSqft: 1200,
          demandTrend: 'increasing',
          competitiveness: 'high'
        }
      },
      {
        id: 'cz-002',
        type: 'retail',
        name: 'Shopping District',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.0080, 40.7520],
            [-74.0050, 40.7520],
            [-74.0050, 40.7550],
            [-74.0080, 40.7550],
            [-74.0080, 40.7520]
          ]]
        },
        properties: {
          zoning: 'C1-5',
          allowedUses: ['retail', 'restaurant', 'services'],
          maxHeight: 80,
          density: 5.0,
          averageRent: 120,
          vacancy: 8.3,
          developmentPipeline: 1
        },
        market: {
          averageCapRate: 5.8,
          pricePerSqft: 800,
          demandTrend: 'stable',
          competitiveness: 'medium'
        }
      },
      {
        id: 'cz-003',
        type: 'industrial',
        name: 'Manufacturing Zone',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.0150, 40.7400],
            [-74.0100, 40.7400],
            [-74.0100, 40.7450],
            [-74.0150, 40.7450],
            [-74.0150, 40.7400]
          ]]
        },
        properties: {
          zoning: 'M1-4',
          allowedUses: ['manufacturing', 'warehouse', 'logistics'],
          maxHeight: 60,
          density: 2.0,
          averageRent: 25,
          vacancy: 5.2,
          developmentPipeline: 2
        },
        market: {
          averageCapRate: 7.5,
          pricePerSqft: 300,
          demandTrend: 'increasing',
          competitiveness: 'low'
        }
      }
    ]
  }

  async getMultifamilyZones(bounds: any): Promise<MultifamilyZone[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return [
      {
        id: 'mz-001',
        type: 'high-density',
        name: 'Residential High-Rise District',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.0020, 40.7650],
            [-74.0000, 40.7650],
            [-74.0000, 40.7680],
            [-74.0020, 40.7680],
            [-74.0020, 40.7650]
          ]]
        },
        properties: {
          zoning: 'R10',
          maxUnits: 500,
          affordableRequirement: 20,
          averageRent: 3500,
          occupancy: 94.2,
          developmentPipeline: 4
        },
        market: {
          averageCapRate: 3.8,
          rentGrowth: 4.2,
          demandTrend: 'increasing',
          competitiveness: 'high'
        }
      },
      {
        id: 'mz-002',
        type: 'mid-density',
        name: 'Mid-Rise Residential',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [-74.0100, 40.7600],
            [-74.0070, 40.7600],
            [-74.0070, 40.7630],
            [-74.0100, 40.7630],
            [-74.0100, 40.7600]
          ]]
        },
        properties: {
          zoning: 'R7A',
          maxUnits: 150,
          affordableRequirement: 15,
          averageRent: 2800,
          occupancy: 96.1,
          developmentPipeline: 2
        },
        market: {
          averageCapRate: 4.5,
          rentGrowth: 3.1,
          demandTrend: 'stable',
          competitiveness: 'medium'
        }
      }
    ]
  }

  getZoneTypeColor(type: string): string {
    return saasTheme.colors.overlay[type as keyof typeof saasTheme.colors.overlay] || saasTheme.colors.secondary
  }

  getZoneTypeIcon(type: string): string {
    const icons = {
      'office': '🏢',
      'retail': '🛍️',
      'industrial': '🏭',
      'mixed-use': '🏙️',
      'high-density': '🏠',
      'mid-density': '🏡',
      'low-density': '🏘️',
      'mixed-income': '🏘️'
    }
    return icons[type as keyof typeof icons] || '🏢'
  }

  async analyzeZone(zone: CommercialZone | MultifamilyZone): Promise<any> {
    try {
      // Get market metrics for the zone area
      const areaName = zone.name || 'Unknown Area'
      const marketMetrics = await commercialAPI.getMarketMetrics({
        area: areaName,
        propertyType: zone.type,
        timeframe: 'quarter'
      })

      return {
        opportunityScore: this.calculateOpportunityScore(marketMetrics, zone),
        riskFactors: this.identifyRiskFactors(marketMetrics),
        strengths: this.identifyStrengths(marketMetrics),
        recommendations: this.generateRecommendations(marketMetrics, zone),
        marketData: marketMetrics
      }
    } catch (error) {
      console.warn('Failed to get market analysis, using mock data:', error)
      
      // Fallback to mock analysis
      return {
        opportunityScore: Math.random() * 100,
        riskFactors: ['Market volatility', 'Regulatory changes'],
        strengths: ['High demand', 'Good location'],
        recommendations: ['Consider acquisition', 'Monitor market trends']
      }
    }
  }

  private convertPropertiesToZones(properties: CommercialProperty[]): CommercialZone[] {
    // Group properties by zoning/area to create zones
    const zoneGroups = new Map<string, CommercialProperty[]>()
    
    properties.forEach(property => {
      const zoneKey = `${property.propertyType}-${property.zoning.current[0] || 'unknown'}`
      if (!zoneGroups.has(zoneKey)) {
        zoneGroups.set(zoneKey, [])
      }
      zoneGroups.get(zoneKey)!.push(property)
    })

    const zones: CommercialZone[] = []
    
    zoneGroups.forEach((groupProperties, zoneKey) => {
      const [propertyType] = zoneKey.split('-')
      
      if (['office', 'retail', 'industrial', 'mixed-use'].includes(propertyType)) {
        // Calculate zone boundaries from properties
        const bounds = this.calculateZoneBounds(groupProperties)
        
        // Aggregate market data
        const marketData = this.aggregateMarketData(groupProperties)
        
        zones.push({
          id: `zone-${zoneKey}-${Date.now()}`,
          type: propertyType as any,
          name: `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} District`,
          geometry: {
            type: 'Polygon',
            coordinates: [bounds]
          },
          properties: {
            zoning: groupProperties[0]?.zoning.current[0] || 'Mixed',
            allowedUses: [...new Set(groupProperties.flatMap(p => p.zoning.allowedUses))],
            maxHeight: Math.max(...groupProperties.map(p => p.listingDetails.yearBuilt || 0)),
            density: groupProperties.length / this.calculateZoneArea(bounds),
            averageRent: marketData.averageRent,
            vacancy: marketData.averageVacancy,
            developmentPipeline: Math.floor(Math.random() * 5) // Mock for now
          },
          market: {
            averageCapRate: marketData.averageCapRate,
            pricePerSqft: marketData.averagePricePerSqft,
            demandTrend: marketData.demandTrend,
            competitiveness: marketData.competitiveness
          }
        })
      }
    })
    
    return zones
  }

  private calculateZoneBounds(properties: CommercialProperty[]): number[][] {
    if (properties.length === 0) return []
    
    const lats = properties.map(p => p.coordinates.lat)
    const lngs = properties.map(p => p.coordinates.lng)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    
    // Add some padding
    const padding = 0.001
    
    return [
      [minLng - padding, minLat - padding],
      [maxLng + padding, minLat - padding],
      [maxLng + padding, maxLat + padding],
      [minLng - padding, maxLat + padding],
      [minLng - padding, minLat - padding]
    ]
  }

  private aggregateMarketData(properties: CommercialProperty[]) {
    const rents = properties.map(p => p.listingDetails.pricePerSqft || 0).filter(r => r > 0)
    const capRates = properties.map(p => p.listingDetails.capRate || 0).filter(r => r > 0)
    const pricesPerSqft = properties.map(p => p.listingDetails.pricePerSqft || 0).filter(p => p > 0)
    const occupancies = properties.map(p => p.listingDetails.occupancyRate || 0).filter(o => o > 0)
    
    return {
      averageRent: rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : 0,
      averageCapRate: capRates.length > 0 ? capRates.reduce((a, b) => a + b, 0) / capRates.length : 0,
      averagePricePerSqft: pricesPerSqft.length > 0 ? pricesPerSqft.reduce((a, b) => a + b, 0) / pricesPerSqft.length : 0,
      averageVacancy: occupancies.length > 0 ? 100 - (occupancies.reduce((a, b) => a + b, 0) / occupancies.length) : 0,
      demandTrend: Math.random() > 0.6 ? 'increasing' : Math.random() > 0.3 ? 'stable' : 'decreasing' as any,
      competitiveness: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low' as any
    }
  }

  private calculateZoneArea(bounds: number[][]): number {
    // Simple area calculation - in a real app, use proper geographic calculations
    if (bounds.length < 4) return 1
    
    const width = Math.abs(bounds[2][0] - bounds[0][0])
    const height = Math.abs(bounds[2][1] - bounds[0][1])
    
    return width * height * 111000 * 111000 // Rough conversion to square meters
  }

  private calculateOpportunityScore(metrics: MarketMetrics, zone: CommercialZone | MultifamilyZone): number {
    let score = 50 // Base score
    
    // Price growth indicators
    if (metrics.market.priceGrowth.yearly > 10) score += 20
    else if (metrics.market.priceGrowth.yearly > 5) score += 10
    
    // Vacancy rate (lower is better)
    if (metrics.vacancy.overall < 10) score += 15
    else if (metrics.vacancy.overall > 20) score -= 15
    
    // Cap rate considerations
    if (metrics.investment.averageCapRate > 6) score += 10
    
    // Market activity
    if (metrics.market.absorptionRate > 3) score += 10
    
    return Math.min(100, Math.max(0, score))
  }

  private identifyRiskFactors(metrics: MarketMetrics): string[] {
    const risks: string[] = []
    
    if (metrics.vacancy.overall > 20) {
      risks.push('High vacancy rate')
    }
    
    if (metrics.market.averageDaysOnMarket > 200) {
      risks.push('Slow market absorption')
    }
    
    if (metrics.market.priceGrowth.yearly < 0) {
      risks.push('Declining property values')
    }
    
    if (metrics.market.inventoryMonths > 12) {
      risks.push('Oversupply concerns')
    }
    
    return risks.length > 0 ? risks : ['Market volatility', 'Regulatory changes']
  }

  private identifyStrengths(metrics: MarketMetrics): string[] {
    const strengths: string[] = []
    
    if (metrics.vacancy.overall < 10) {
      strengths.push('Low vacancy rate')
    }
    
    if (metrics.market.priceGrowth.yearly > 10) {
      strengths.push('Strong price appreciation')
    }
    
    if (metrics.investment.averageCapRate > 6) {
      strengths.push('Attractive cap rates')
    }
    
    if (metrics.market.absorptionRate > 3) {
      strengths.push('High market demand')
    }
    
    return strengths.length > 0 ? strengths : ['Strategic location', 'Growth potential']
  }

  private generateRecommendations(metrics: MarketMetrics, zone: CommercialZone | MultifamilyZone): string[] {
    const recommendations: string[] = []
    
    if (metrics.vacancy.overall < 10 && metrics.market.priceGrowth.yearly > 5) {
      recommendations.push('Consider immediate acquisition opportunities')
    }
    
    if (metrics.market.priceGrowth.yearly < 0) {
      recommendations.push('Wait for market stabilization')
    }
    
    if (metrics.investment.averageCapRate > 7) {
      recommendations.push('Evaluate cash flow potential')
    }
    
    recommendations.push('Monitor market trends closely')
    recommendations.push('Conduct detailed due diligence')
    
    return recommendations
  }
}

export const commercialZonesService = new CommercialZonesService()