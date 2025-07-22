export interface EconomicIndicator {
  country: string
  countryCode: string
  gdpGrowth: number
  unemploymentRate: number
  inflationRate: number
  year: number
  source: string
}

export interface CountryEconomicData {
  [countryCode: string]: EconomicIndicator
}

class EconomicDataService {
  private cache = new Map<string, { data: CountryEconomicData, timestamp: number }>()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Fetch economic data from multiple free sources
   */
  async fetchEconomicData(): Promise<CountryEconomicData> {
    const cacheKey = 'economic-data'
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const results = await Promise.allSettled([
        this.fetchFromWorldBank(),
        this.fetchFromFRED(),
        this.fetchFromOECD()
      ])

      const combinedData: CountryEconomicData = {}
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          Object.assign(combinedData, result.value)
        }
      })

      this.cache.set(cacheKey, { data: combinedData, timestamp: Date.now() })
      return combinedData
    } catch (error) {
      console.error('Error fetching economic data:', error)
      return this.getFallbackData()
    }
  }

  /**
   * Fetch from World Bank API (free, no API key required)
   */
  private async fetchFromWorldBank(): Promise<CountryEconomicData> {
    const data: CountryEconomicData = {}
    
    try {
      // World Bank API endpoints for key indicators
      const indicators = {
        gdpGrowth: 'NY.GDP.MKTP.KD.ZG',      // GDP growth (annual %)
        unemployment: 'SL.UEM.TOTL.ZS',      // Unemployment rate
        inflation: 'FP.CPI.TOTL.ZG'          // Inflation rate
      }

      const currentYear = new Date().getFullYear() - 1 // Previous year data
      
      for (const [key, indicator] of Object.entries(indicators)) {
        try {
          const response = await fetch(
            `https://api.worldbank.org/v2/country/all/indicator/${indicator}?date=${currentYear}&format=json&per_page=300`
          )
          
          if (response.ok) {
            const result = await response.json()
            const indicatorData = result[1] || []
            
            indicatorData.forEach((item: any) => {
              if (item.value !== null && item.country?.id) {
                const countryCode = item.country.id
                
                if (!data[countryCode]) {
                  data[countryCode] = {
                    country: item.country.value,
                    countryCode: countryCode,
                    gdpGrowth: 0,
                    unemploymentRate: 0,
                    inflationRate: 0,
                    year: currentYear,
                    source: 'World Bank'
                  }
                }
                
                if (key === 'gdpGrowth') data[countryCode].gdpGrowth = item.value
                if (key === 'unemployment') data[countryCode].unemploymentRate = item.value
                if (key === 'inflation') data[countryCode].inflationRate = item.value
              }
            })
          }
        } catch (error) {
          console.warn(`Failed to fetch ${key} from World Bank:`, error)
        }
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.warn('World Bank API fetch failed:', error)
    }

    return data
  }

  /**
   * Fetch from FRED API (Federal Reserve Economic Data) - requires API key but has free tier
   */
  private async fetchFromFRED(): Promise<CountryEconomicData> {
    // FRED API integration would go here
    // Requires API key but provides excellent US economic data
    return {}
  }

  /**
   * Fetch from OECD API (free, no API key required)
   */
  private async fetchFromOECD(): Promise<CountryEconomicData> {
    const data: CountryEconomicData = {}
    
    // DISABLED: OECD API calls cause CORS errors in browser
    // TODO: Implement server-side proxy for OECD data
    try {
      // OECD has free APIs for economic indicators but requires server-side proxy
      // Temporarily disabled to prevent CORS errors
      console.log('OECD API call disabled to prevent CORS errors')
    } catch (error) {
      console.warn('OECD API fetch failed:', error)
    }

    return data
  }

  /**
   * Get fallback data with realistic economic indicators
   */
  private getFallbackData(): CountryEconomicData {
    const currentYear = new Date().getFullYear() - 1
    
    return {
      'USA': {
        country: 'United States',
        countryCode: 'USA',
        gdpGrowth: 2.1,
        unemploymentRate: 3.7,
        inflationRate: 3.2,
        year: currentYear,
        source: 'Fallback Data'
      },
      'CHN': {
        country: 'China',
        countryCode: 'CHN',
        gdpGrowth: 5.2,
        unemploymentRate: 5.2,
        inflationRate: 0.2,
        year: currentYear,
        source: 'Fallback Data'
      },
      'DEU': {
        country: 'Germany',
        countryCode: 'DEU',
        gdpGrowth: -0.3,
        unemploymentRate: 3.0,
        inflationRate: 5.9,
        year: currentYear,
        source: 'Fallback Data'
      },
      'JPN': {
        country: 'Japan',
        countryCode: 'JPN',
        gdpGrowth: 1.1,
        unemploymentRate: 2.6,
        inflationRate: 3.3,
        year: currentYear,
        source: 'Fallback Data'
      },
      'GBR': {
        country: 'United Kingdom',
        countryCode: 'GBR',
        gdpGrowth: 0.1,
        unemploymentRate: 4.2,
        inflationRate: 6.7,
        year: currentYear,
        source: 'Fallback Data'
      },
      'FRA': {
        country: 'France',
        countryCode: 'FRA',
        gdpGrowth: 0.7,
        unemploymentRate: 7.3,
        inflationRate: 4.9,
        year: currentYear,
        source: 'Fallback Data'
      },
      'ITA': {
        country: 'Italy',
        countryCode: 'ITA',
        gdpGrowth: 0.7,
        unemploymentRate: 7.8,
        inflationRate: 5.6,
        year: currentYear,
        source: 'Fallback Data'
      },
      'CAN': {
        country: 'Canada',
        countryCode: 'CAN',
        gdpGrowth: 1.1,
        unemploymentRate: 5.2,
        inflationRate: 3.9,
        year: currentYear,
        source: 'Fallback Data'
      },
      'AUS': {
        country: 'Australia',
        countryCode: 'AUS',
        gdpGrowth: 1.4,
        unemploymentRate: 3.7,
        inflationRate: 5.4,
        year: currentYear,
        source: 'Fallback Data'
      },
      'BRA': {
        country: 'Brazil',
        countryCode: 'BRA',
        gdpGrowth: 2.9,
        unemploymentRate: 8.8,
        inflationRate: 4.6,
        year: currentYear,
        source: 'Fallback Data'
      },
      'IND': {
        country: 'India',
        countryCode: 'IND',
        gdpGrowth: 6.1,
        unemploymentRate: 3.2,
        inflationRate: 5.7,
        year: currentYear,
        source: 'Fallback Data'
      },
      'RUS': {
        country: 'Russia',
        countryCode: 'RUS',
        gdpGrowth: 3.6,
        unemploymentRate: 3.2,
        inflationRate: 5.9,
        year: currentYear,
        source: 'Fallback Data'
      },
      'MEX': {
        country: 'Mexico',
        countryCode: 'MEX',
        gdpGrowth: 3.2,
        unemploymentRate: 2.8,
        inflationRate: 4.7,
        year: currentYear,
        source: 'Fallback Data'
      },
      'KOR': {
        country: 'South Korea',
        countryCode: 'KOR',
        gdpGrowth: 1.4,
        unemploymentRate: 2.9,
        inflationRate: 3.6,
        year: currentYear,
        source: 'Fallback Data'
      },
      'ESP': {
        country: 'Spain',
        countryCode: 'ESP',
        gdpGrowth: 2.4,
        unemploymentRate: 12.3,
        inflationRate: 3.5,
        year: currentYear,
        source: 'Fallback Data'
      }
    }
  }

  /**
   * Update GeoJSON with economic data
   */
  async updateGeoJSONWithEconomicData(geojsonUrl: string): Promise<any> {
    try {
      const [geojsonResponse, economicData] = await Promise.all([
        fetch(geojsonUrl),
        this.fetchEconomicData()
      ])

      if (!geojsonResponse.ok) throw new Error('Failed to fetch GeoJSON')

      const geojson = await geojsonResponse.json()
      
      // Update features with economic data
      geojson.features.forEach((feature: any) => {
        const countryCode = this.getCountryCode(feature.properties)
        const economicIndicator = economicData[countryCode]
        
        if (economicIndicator) {
          feature.properties.gdp_growth = economicIndicator.gdpGrowth
          feature.properties.unemployment_rate = economicIndicator.unemploymentRate // Use unemployment rate directly
          feature.properties.inflation_rate = economicIndicator.inflationRate
          feature.properties.economic_source = economicIndicator.source
        }
      })

      return geojson
    } catch (error) {
      console.error('Error updating GeoJSON with economic data:', error)
      // Return original GeoJSON if update fails
      const response = await fetch(geojsonUrl)
      return response.json()
    }
  }

  /**
   * Extract country code from GeoJSON feature properties
   */
  private getCountryCode(properties: any): string {
    // Try various common property names for country codes
    return properties.ISO_A3 || 
           properties.ADM0_A3 || 
           properties.iso_a3 || 
           properties.ISO3 || 
           properties.countryCode || 
           properties.ADMIN || 
           ''
  }
}

export const economicDataService = new EconomicDataService() 