import { supabase } from './supabase'
import { Property, ZoningData, EconomicData, Coordinates, FilterState, PropertyType, ListingStatus } from '../types'
import { unzipSync, strFromU8 } from 'fflate';
import Papa from 'papaparse';

// Property API
export const propertyAPI = {
  async getProperties(bounds?: { north: number; south: number; east: number; west: number }): Promise<Property[]> {
    // Mock properties data
    const mockProperties: Property[] = [
      // New York City area
      {
        id: '1',
        address: '123 Wall St, New York, NY',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        price: 2500000,
        size: 1800,
        type: 'commercial' as PropertyType,
        zoning: 'mixed-use',
        opportunityScore: 85,
        listingDate: '2024-03-15',
        status: 'active' as ListingStatus
      },
      {
        id: '2',
        address: '456 Madison Ave, New York, NY',
        coordinates: { lat: 40.7580, lng: -73.9754 },
        price: 3800000,
        size: 2200,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 90,
        listingDate: '2024-03-14',
        status: 'active' as ListingStatus
      },
      {
        id: '3',
        address: '789 5th Ave, New York, NY',
        coordinates: { lat: 40.7733, lng: -73.9653 },
        price: 4200000,
        size: 2500,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 95,
        listingDate: '2024-03-13',
        status: 'active' as ListingStatus
      },
      {
        id: '4',
        address: '321 Park Ave, New York, NY',
        coordinates: { lat: 40.7539, lng: -73.9742 },
        price: 3500000,
        size: 2000,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 88,
        listingDate: '2024-03-12',
        status: 'active' as ListingStatus
      },
      // Los Angeles area
      {
        id: '5',
        address: '456 Sunset Blvd, Los Angeles, CA',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        price: 3200000,
        size: 5000,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 92,
        listingDate: '2024-03-14',
        status: 'active' as ListingStatus
      },
      {
        id: '6',
        address: '789 Wilshire Blvd, Los Angeles, CA',
        coordinates: { lat: 34.0573, lng: -118.2543 },
        price: 2800000,
        size: 4500,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 87,
        listingDate: '2024-03-13',
        status: 'active' as ListingStatus
      },
      {
        id: '7',
        address: '321 Hollywood Blvd, Los Angeles, CA',
        coordinates: { lat: 34.1016, lng: -118.3267 },
        price: 4500000,
        size: 6000,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 94,
        listingDate: '2024-03-12',
        status: 'active' as ListingStatus
      },
      // Chicago area
      {
        id: '8',
        address: '789 Michigan Ave, Chicago, IL',
        coordinates: { lat: 41.8781, lng: -87.6298 },
        price: 1800000,
        size: 2200,
        type: 'multifamily' as PropertyType,
        zoning: 'residential',
        opportunityScore: 78,
        listingDate: '2024-03-13',
        status: 'active' as ListingStatus
      },
      {
        id: '9',
        address: '456 State St, Chicago, IL',
        coordinates: { lat: 41.8825, lng: -87.6287 },
        price: 2100000,
        size: 2800,
        type: 'multifamily' as PropertyType,
        zoning: 'residential',
        opportunityScore: 82,
        listingDate: '2024-03-12',
        status: 'active' as ListingStatus
      },
      {
        id: '10',
        address: '123 Wacker Dr, Chicago, IL',
        coordinates: { lat: 41.8868, lng: -87.6363 },
        price: 3500000,
        size: 4000,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 89,
        listingDate: '2024-03-11',
        status: 'active' as ListingStatus
      },
      // Houston area
      {
        id: '11',
        address: '321 Energy Corridor, Houston, TX',
        coordinates: { lat: 29.7604, lng: -95.3698 },
        price: 1200000,
        size: 15000,
        type: 'industrial' as PropertyType,
        zoning: 'industrial',
        opportunityScore: 88,
        listingDate: '2024-03-12',
        status: 'active' as ListingStatus
      },
      {
        id: '12',
        address: '789 Downtown Houston, Houston, TX',
        coordinates: { lat: 29.7589, lng: -95.3677 },
        price: 2800000,
        size: 18000,
        type: 'industrial' as PropertyType,
        zoning: 'industrial',
        opportunityScore: 91,
        listingDate: '2024-03-11',
        status: 'active' as ListingStatus
      },
      {
        id: '13',
        address: '456 Galleria Area, Houston, TX',
        coordinates: { lat: 29.7397, lng: -95.4678 },
        price: 3200000,
        size: 20000,
        type: 'commercial' as PropertyType,
        zoning: 'commercial',
        opportunityScore: 93,
        listingDate: '2024-03-10',
        status: 'active' as ListingStatus
      }
    ]

    if (bounds) {
      console.log('Filtering properties by bounds:', bounds)
      const filtered = mockProperties.filter(property => 
        property.coordinates.lat >= bounds.south &&
        property.coordinates.lat <= bounds.north &&
        property.coordinates.lng >= bounds.west &&
        property.coordinates.lng <= bounds.east
      )
      console.log('Found properties in bounds:', filtered.length)
      return filtered
    }

    return mockProperties
  },

  async getPropertiesByFilters(filters: FilterState, bounds?: any): Promise<Property[]> {
    // Get all properties first
    let properties = await this.getProperties(bounds)

    // Apply filters
    if (filters.propertyTypes.length > 0) {
      properties = properties.filter(property => 
        filters.propertyTypes.includes(property.type)
      )
    }

    if (filters.opportunityScore > 0) {
      properties = properties.filter(property => 
        property.opportunityScore >= filters.opportunityScore
      )
    }

    return properties
  },

  async getPropertiesByAddress(address: string): Promise<Property[]> {
    // Get all properties and filter by address
    const allProperties = await this.getProperties()
    
    // Normalize address for comparison
    const normalizedAddress = address.toLowerCase().trim()
    
    return allProperties.filter(property => 
      property.address.toLowerCase().includes(normalizedAddress) ||
      normalizedAddress.includes(property.address.toLowerCase())
    )
  },

  async getPropertiesByLocation(coordinates: { lat: number; lng: number }, radiusInDegrees: number = 0.01): Promise<Property[]> {
    // Get all properties and filter by distance
    const allProperties = await this.getProperties()
    
    return allProperties.filter(property => {
      const distance = Math.sqrt(
        Math.pow(property.coordinates.lat - coordinates.lat, 2) +
        Math.pow(property.coordinates.lng - coordinates.lng, 2)
      )
      return distance <= radiusInDegrees
    })
  }
}

// Zoning API
export const zoningAPI = {
  async getZoningData(bounds?: { north: number; south: number; east: number; west: number }): Promise<ZoningData[]> {
    try {
      let query = supabase.from('zoning_data').select('*')

      if (bounds) {
        // Note: This is a simplified bounding box query
        // In production, you'd want to use PostGIS for proper spatial queries
        query = query.gte('score', 0) // Placeholder for spatial filtering
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type as any,
        coordinates: row.coordinates,
        restrictions: row.restrictions,
        opportunities: row.opportunities,
        score: row.score
      }))
    } catch (error) {
      console.error('Error fetching zoning data:', error)
      throw new Error('Failed to fetch zoning data')
    }
  },

  async getZoningByType(zoningTypes: string[]): Promise<ZoningData[]> {
    try {
      const { data, error } = await supabase
        .from('zoning_data')
        .select('*')
        .in('type', zoningTypes)

      if (error) throw error

      return data.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type as any,
        coordinates: row.coordinates,
        restrictions: row.restrictions,
        opportunities: row.opportunities,
        score: row.score
      }))
    } catch (error) {
      console.error('Error fetching zoning by type:', error)
      throw new Error('Failed to fetch zoning data')
    }
  }
}

// Economic API
export const economicAPI = {
  async getEconomicData(): Promise<EconomicData[]> {
    // Try World Bank JSON API first
    try {
      const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=300&date=2022'
      const resp = await fetch(wbUrl)
      if (!resp.ok) throw new Error('World Bank API not available')
      const json = await resp.json()
      // World Bank API returns an array: [metadata, data]
      if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) throw new Error('Unexpected World Bank API response')
      // Parse the data array
      const data: EconomicData[] = json[1]
        .filter((d: any) => d.country && d.country.value && d.value !== null && d.value !== undefined)
        .map((d: any) => ({
          id: d.country.id,
          name: d.country.value,
          value: typeof d.value === 'number' ? d.value : parseFloat(d.value),
          indicator: 'gdp-growth' as const
        }))
        .filter((d) => d.name && !isNaN(d.value))
      return data
    } catch (err) {
      // Fallback to mock data
      console.warn('Falling back to mock economic data:', err)
      return [
        {
          id: 'usa',
          name: 'United States',
          value: 2.1,
          indicator: 'gdp-growth' as const
        },
        {
          id: 'chn',
          name: 'China',
          value: 5.2,
          indicator: 'gdp-growth' as const
        },
        {
          id: 'ind',
          name: 'India',
          value: 6.1,
          indicator: 'gdp-growth' as const
        },
        {
          id: 'deu',
          name: 'Germany',
          value: 1.4,
          indicator: 'gdp-growth' as const
        },
        {
          id: 'jpn',
          name: 'Japan',
          value: 1.0,
          indicator: 'gdp-growth' as const
        }
      ]
    }
  },

  async getRealEstateAppreciationData(): Promise<EconomicData[]> {
    try {
      // Fetch FHFA state-level house price index data
      const fhfaUrl = 'https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_po_state.txt'
      
      try {
        const resp = await fetch(fhfaUrl)
        if (!resp.ok) throw new Error('FHFA API not available')
        const text = await resp.text()
        
        // Parse the tab-delimited data
        const lines = text.split('\n').filter(line => line.trim())
        const headers = lines[0].split('\t')
        const data: EconomicData[] = lines.slice(1).map((line, index) => {
          const values = line.split('\t')
          const state = values[0]?.trim() || ''
          const appreciation = parseFloat(values[values.length - 1]?.trim() || '0')
          return {
            id: `state-${index}`,
            name: state,
            value: appreciation,
            indicator: 'property-appreciation' as const
          }
        }).filter(d => d.name && !isNaN(d.value))
        return data
      } catch (err) {
        console.warn('FHFA API error:', err)
        throw err
      }
    } catch (err) {
      // Fallback to mock data
      console.warn('Falling back to mock real estate appreciation data:', err)
      return [
        {
          id: 'ca',
          name: 'California',
          value: 5.2,
          indicator: 'property-appreciation' as const
        },
        {
          id: 'tx',
          name: 'Texas',
          value: 3.8,
          indicator: 'property-appreciation' as const
        },
        {
          id: 'fl',
          name: 'Florida',
          value: 4.1,
          indicator: 'property-appreciation' as const
        },
        {
          id: 'ny',
          name: 'New York',
          value: 2.9,
          indicator: 'property-appreciation' as const
        },
        {
          id: 'az',
          name: 'Arizona',
          value: 6.7,
          indicator: 'property-appreciation' as const
        }
      ]
    }
  },

  async getEconomicDataByRegions(regions: string[]): Promise<EconomicData[]> {
    try {
      const { data, error } = await supabase
        .from('economic_data')
        .select('*')
        .in('region', regions)

      if (error) throw error

      return data.map(row => ({
        region: row.region,
        gdpGrowth: row.gdp_growth,
        propertyAppreciation: row.property_appreciation,
        builderAccessibility: row.builder_accessibility,
        internationalAccessibility: row.international_accessibility,
        lastUpdated: row.last_updated
      }))
    } catch (error) {
      console.error('Error fetching economic data by regions:', error)
      throw new Error('Failed to fetch economic data')
    }
  },

  async getRealEstateDevelopmentIndicators(): Promise<any[]> {
    try {
      // Comprehensive real estate development indicators
      // In production, this would aggregate data from multiple sources:
      // - Census Bureau population/employment data
      // - BLS employment statistics
      // - DOT transit investment data
      // - Local permit/construction data
      
      const mockIndicators = [
        // Major metropolitan areas with development indicators
        {
          region: 'Chicago-Naperville-Elgin, IL-IN-WI',
          coordinates: [-87.6298, 41.8781],
          populationGrowth: 0.2, // % annual growth
          employmentGrowth: 1.8,
          transitInvestment: 850000000, // Recent transit investment in dollars
          permitActivity: 12450, // Annual building permits
          medianIncome: 68960,
          housingAffordabilityIndex: 0.73,
          constructionCosts: 145, // per sq ft
          landValues: 25.5, // per sq ft
          indicators: {
            populationGrowthAreas: 0.65,
            employmentGrowthHubs: 0.78,
            transitDevelopment: 0.82,
            highPermitActivity: 0.71
          }
        },
        {
          region: 'Los Angeles-Long Beach-Anaheim, CA',
          coordinates: [-118.2437, 34.0522],
          populationGrowth: 0.8,
          employmentGrowth: 2.1,
          transitInvestment: 1200000000,
          permitActivity: 18750,
          medianIncome: 78270,
          housingAffordabilityIndex: 0.42,
          constructionCosts: 180,
          landValues: 45.2,
          indicators: {
            populationGrowthAreas: 0.72,
            employmentGrowthHubs: 0.85,
            transitDevelopment: 0.91,
            highPermitActivity: 0.88
          }
        },
        {
          region: 'New York-Newark-Jersey City, NY-NJ-PA',
          coordinates: [-74.0060, 40.7128],
          populationGrowth: 0.5,
          employmentGrowth: 1.9,
          transitInvestment: 2100000000,
          permitActivity: 22180,
          medianIncome: 82530,
          housingAffordabilityIndex: 0.38,
          constructionCosts: 220,
          landValues: 85.7,
          indicators: {
            populationGrowthAreas: 0.58,
            employmentGrowthHubs: 0.82,
            transitDevelopment: 0.95,
            highPermitActivity: 0.94
          }
        },
        {
          region: 'San Francisco-Oakland-Berkeley, CA',
          coordinates: [-122.4194, 37.7749],
          populationGrowth: 0.3,
          employmentGrowth: 2.8,
          transitInvestment: 950000000,
          permitActivity: 8420,
          medianIncome: 112040,
          housingAffordabilityIndex: 0.28,
          constructionCosts: 245,
          landValues: 125.3,
          indicators: {
            populationGrowthAreas: 0.45,
            employmentGrowthHubs: 0.95,
            transitDevelopment: 0.87,
            highPermitActivity: 0.62
          }
        },
        {
          region: 'Dallas-Fort Worth-Arlington, TX',
          coordinates: [-96.7970, 32.7767],
          populationGrowth: 1.9,
          employmentGrowth: 2.3,
          transitInvestment: 680000000,
          permitActivity: 35250,
          medianIncome: 68140,
          housingAffordabilityIndex: 0.71,
          constructionCosts: 125,
          landValues: 18.5,
          indicators: {
            populationGrowthAreas: 0.89,
            employmentGrowthHubs: 0.88,
            transitDevelopment: 0.74,
            highPermitActivity: 0.96
          }
        },
        {
          region: 'Houston-The Woodlands-Sugar Land, TX',
          coordinates: [-95.3698, 29.7604],
          populationGrowth: 1.7,
          employmentGrowth: 2.0,
          transitInvestment: 420000000,
          permitActivity: 28900,
          medianIncome: 65660,
          housingAffordabilityIndex: 0.76,
          constructionCosts: 120,
          landValues: 16.2,
          indicators: {
            populationGrowthAreas: 0.86,
            employmentGrowthHubs: 0.81,
            transitDevelopment: 0.68,
            highPermitActivity: 0.92
          }
        },
        {
          region: 'Washington-Arlington-Alexandria, DC-VA-MD-WV',
          coordinates: [-77.0369, 38.9072],
          populationGrowth: 0.7,
          employmentGrowth: 1.6,
          transitInvestment: 1800000000,
          permitActivity: 15750,
          medianIncome: 95680,
          housingAffordabilityIndex: 0.48,
          constructionCosts: 175,
          landValues: 42.8,
          indicators: {
            populationGrowthAreas: 0.68,
            employmentGrowthHubs: 0.76,
            transitDevelopment: 0.93,
            highPermitActivity: 0.79
          }
        },
        {
          region: 'Miami-Fort Lauderdale-Pompano Beach, FL',
          coordinates: [-80.1918, 25.7617],
          populationGrowth: 1.2,
          employmentGrowth: 2.4,
          transitInvestment: 580000000,
          permitActivity: 21150,
          medianIncome: 55750,
          housingAffordabilityIndex: 0.52,
          constructionCosts: 140,
          landValues: 28.7,
          indicators: {
            populationGrowthAreas: 0.79,
            employmentGrowthHubs: 0.89,
            transitDevelopment: 0.71,
            highPermitActivity: 0.87
          }
        },
        {
          region: 'Phoenix-Mesa-Chandler, AZ',
          coordinates: [-112.0740, 33.4484],
          populationGrowth: 2.2,
          employmentGrowth: 2.6,
          transitInvestment: 740000000,
          permitActivity: 31800,
          medianIncome: 62590,
          housingAffordabilityIndex: 0.68,
          constructionCosts: 135,
          landValues: 22.1,
          indicators: {
            populationGrowthAreas: 0.92,
            employmentGrowthHubs: 0.91,
            transitDevelopment: 0.78,
            highPermitActivity: 0.94
          }
        },
        {
          region: 'Boston-Cambridge-Newton, MA-NH',
          coordinates: [-71.0589, 42.3601],
          populationGrowth: 0.4,
          employmentGrowth: 1.7,
          transitInvestment: 1150000000,
          permitActivity: 11250,
          medianIncome: 89240,
          housingAffordabilityIndex: 0.43,
          constructionCosts: 195,
          landValues: 52.6,
          indicators: {
            populationGrowthAreas: 0.52,
            employmentGrowthHubs: 0.78,
            transitDevelopment: 0.89,
            highPermitActivity: 0.69
          }
        }
      ]
      
      return mockIndicators
    } catch (error) {
      console.error('Error fetching real estate development indicators:', error)
      return []
    }
  },

  // New indicators for real estate developers
  async getEmploymentGrowthData(): Promise<any[]> {
    try {
      // Bureau of Labor Statistics API - Employment data by state
      const blsUrl = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
      
      // Series for state employment (we'll use a few major states as example)
      const stateSeries = {
        'California': 'LASST060000000000006',
        'Texas': 'LASST480000000000006', 
        'Florida': 'LASST120000000000006',
        'New York': 'LASST360000000000006',
        'Pennsylvania': 'LASST420000000000006',
        'Illinois': 'LASST170000000000006',
        'Ohio': 'LASST390000000000006',
        'Georgia': 'LASST130000000000006',
        'North Carolina': 'LASST370000000000006',
        'Michigan': 'LASST260000000000006'
      }
      
      // Fallback to mock data based on recent BLS employment trends
      const mockEmploymentData = [
        { region: 'Texas', employmentGrowth: 3.2 },
        { region: 'Florida', employmentGrowth: 2.8 },
        { region: 'Arizona', employmentGrowth: 2.5 },
        { region: 'North Carolina', employmentGrowth: 2.3 },
        { region: 'Georgia', employmentGrowth: 2.1 },
        { region: 'Tennessee', employmentGrowth: 1.9 },
        { region: 'South Carolina', employmentGrowth: 1.8 },
        { region: 'Nevada', employmentGrowth: 1.7 },
        { region: 'Utah', employmentGrowth: 1.6 },
        { region: 'Colorado', employmentGrowth: 1.4 },
        { region: 'Washington', employmentGrowth: 1.2 },
        { region: 'Virginia', employmentGrowth: 1.1 },
        { region: 'California', employmentGrowth: 0.9 },
        { region: 'Oregon', employmentGrowth: 0.8 },
        { region: 'Massachusetts', employmentGrowth: 0.7 },
        { region: 'New York', employmentGrowth: 0.5 },
        { region: 'Illinois', employmentGrowth: 0.3 },
        { region: 'Pennsylvania', employmentGrowth: 0.2 },
        { region: 'Ohio', employmentGrowth: 0.1 },
        { region: 'Michigan', employmentGrowth: -0.1 },
        { region: 'Connecticut', employmentGrowth: -0.2 },
        { region: 'West Virginia', employmentGrowth: -0.8 }
      ]
      
      return mockEmploymentData
    } catch (error) {
      console.error('Error fetching employment growth data:', error)
      return []
    }
  },

  async getPopulationGrowthData(): Promise<any[]> {
    try {
      // Census Bureau API - Population estimates by state
      // https://api.census.gov/data/2022/pep/population
      
      // Fallback to mock data based on recent Census estimates
      const mockPopulationData = [
        { region: 'Texas', populationGrowth: 1.9 },
        { region: 'Florida', populationGrowth: 1.6 },
        { region: 'North Carolina', populationGrowth: 1.3 },
        { region: 'Georgia', populationGrowth: 1.1 },
        { region: 'Arizona', populationGrowth: 1.0 },
        { region: 'South Carolina', populationGrowth: 0.9 },
        { region: 'Tennessee', populationGrowth: 0.8 },
        { region: 'Nevada', populationGrowth: 0.7 },
        { region: 'Utah', populationGrowth: 0.6 },
        { region: 'Colorado', populationGrowth: 0.5 },
        { region: 'Washington', populationGrowth: 0.4 },
        { region: 'California', populationGrowth: 0.3 },
        { region: 'Virginia', populationGrowth: 0.2 },
        { region: 'Oregon', populationGrowth: 0.1 },
        { region: 'New York', populationGrowth: -0.1 },
        { region: 'Illinois', populationGrowth: -0.2 },
        { region: 'Pennsylvania', populationGrowth: -0.1 },
        { region: 'Ohio', populationGrowth: -0.1 },
        { region: 'Michigan', populationGrowth: 0.0 },
        { region: 'Massachusetts', populationGrowth: 0.1 },
        { region: 'Connecticut', populationGrowth: -0.3 },
        { region: 'West Virginia', populationGrowth: -0.6 }
      ]
      
      return mockPopulationData
    } catch (error) {
      console.error('Error fetching population growth data:', error)
      return []
    }
  },

  async getBuildingPermitData(): Promise<any[]> {
    try {
      // Census Bureau Building Permits API
      // https://www.census.gov/construction/bps/
      
      // Fallback to mock data based on recent Census permit data
      const mockPermitData = [
        { region: 'Texas', permitActivity: 185420, permitGrowth: 8.2 },
        { region: 'Florida', permitActivity: 156330, permitGrowth: 12.1 },
        { region: 'California', permitActivity: 125840, permitGrowth: -2.3 },
        { region: 'North Carolina', permitActivity: 89560, permitGrowth: 15.4 },
        { region: 'Arizona', permitActivity: 67890, permitGrowth: 18.7 },
        { region: 'Georgia', permitActivity: 65420, permitGrowth: 11.3 },
        { region: 'Tennessee', permitActivity: 54320, permitGrowth: 14.2 },
        { region: 'South Carolina', permitActivity: 45680, permitGrowth: 16.8 },
        { region: 'Virginia', permitActivity: 42150, permitGrowth: 9.1 },
        { region: 'Colorado', permitActivity: 39870, permitGrowth: 7.4 },
        { region: 'Washington', permitActivity: 38940, permitGrowth: 3.2 },
        { region: 'Nevada', permitActivity: 28460, permitGrowth: 22.1 },
        { region: 'Utah', permitActivity: 26780, permitGrowth: 13.5 },
        { region: 'Oregon', permitActivity: 24590, permitGrowth: 5.8 },
        { region: 'New York', permitActivity: 23140, permitGrowth: -1.2 },
        { region: 'Pennsylvania', permitActivity: 21680, permitGrowth: 2.4 },
        { region: 'Ohio', permitActivity: 20450, permitGrowth: 1.8 },
        { region: 'Illinois', permitActivity: 18920, permitGrowth: -0.6 },
        { region: 'Michigan', permitActivity: 17340, permitGrowth: 4.1 },
        { region: 'Massachusetts', permitActivity: 15670, permitGrowth: 1.3 },
        { region: 'Connecticut', permitActivity: 8940, permitGrowth: -3.4 },
        { region: 'West Virginia', permitActivity: 3820, permitGrowth: -5.2 }
      ]
      
      return mockPermitData
    } catch (error) {
      console.error('Error fetching building permit data:', error)
      return []
    }
  },

  async getConstructionCostData(): Promise<any[]> {
    try {
      // Bureau of Labor Statistics Producer Price Index for Construction
      // https://api.bls.gov/publicAPI/v2/timeseries/data/
      
      // Fallback to mock data based on recent construction cost indices
      const mockConstructionCosts = [
        { region: 'California', constructionCostIndex: 142, costChange: 8.3 },
        { region: 'New York', constructionCostIndex: 138, costChange: 7.9 },
        { region: 'Massachusetts', constructionCostIndex: 134, costChange: 7.1 },
        { region: 'Washington', constructionCostIndex: 131, costChange: 6.8 },
        { region: 'Connecticut', constructionCostIndex: 129, costChange: 6.4 },
        { region: 'Oregon', constructionCostIndex: 126, costChange: 6.0 },
        { region: 'Nevada', constructionCostIndex: 123, costChange: 5.7 },
        { region: 'Colorado', constructionCostIndex: 121, costChange: 5.4 },
        { region: 'Arizona', constructionCostIndex: 118, costChange: 5.1 },
        { region: 'Florida', constructionCostIndex: 116, costChange: 4.8 },
        { region: 'Utah', constructionCostIndex: 114, costChange: 4.5 },
        { region: 'Virginia', constructionCostIndex: 112, costChange: 4.2 },
        { region: 'North Carolina', constructionCostIndex: 110, costChange: 3.9 },
        { region: 'Georgia', constructionCostIndex: 108, costChange: 3.6 },
        { region: 'Tennessee', constructionCostIndex: 106, costChange: 3.3 },
        { region: 'Texas', constructionCostIndex: 105, costChange: 3.1 },
        { region: 'South Carolina', constructionCostIndex: 103, costChange: 2.8 },
        { region: 'Ohio', constructionCostIndex: 101, costChange: 2.5 },
        { region: 'Michigan', constructionCostIndex: 100, costChange: 2.2 },
        { region: 'Pennsylvania', constructionCostIndex: 99, costChange: 1.9 },
        { region: 'Illinois', constructionCostIndex: 98, costChange: 1.6 },
        { region: 'West Virginia', constructionCostIndex: 94, costChange: 0.8 }
      ]
      
      return mockConstructionCosts
    } catch (error) {
      console.error('Error fetching construction cost data:', error)
      return []
    }
  },

  // International employment data from World Bank
  async getGlobalEmploymentData(): Promise<any[]> {
    try {
      // World Bank Employment to population ratio API
      const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/SL.EMP.TOTL.SP.ZS?format=json&per_page=300&date=2022'
      
      try {
        const resp = await fetch(wbUrl)
        if (!resp.ok) throw new Error('World Bank API not available')
        const json = await resp.json()
        
        if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
          throw new Error('Unexpected World Bank API response')
        }
        
        const data = json[1]
          .filter((d: any) => d.country && d.country.value && d.value !== null && d.value !== undefined)
          .map((d: any) => ({
            region: d.country.value,
            employmentGrowth: typeof d.value === 'number' ? (d.value - 60) / 10 : 0, // Normalize to growth rate
            lastUpdated: d.date
          }))
          .filter((d: any) => d.region && !isNaN(d.employmentGrowth))
        
        return data
      } catch (apiError) {
        console.warn('World Bank Employment API error, using mock data:', apiError)
        // Global employment growth mock data
        return [
          // Strong Growth Markets
          { region: 'India', employmentGrowth: 4.2 },
          { region: 'Vietnam', employmentGrowth: 3.8 },
          { region: 'Bangladesh', employmentGrowth: 3.5 },
          { region: 'Philippines', employmentGrowth: 3.2 },
          { region: 'Indonesia', employmentGrowth: 2.9 },
          { region: 'Egypt', employmentGrowth: 2.7 },
          { region: 'Mexico', employmentGrowth: 2.4 },
          { region: 'Poland', employmentGrowth: 2.1 },
          { region: 'Turkey', employmentGrowth: 1.9 },
          { region: 'Brazil', employmentGrowth: 1.6 },
          
          // Moderate Growth Markets
          { region: 'United States', employmentGrowth: 1.4 },
          { region: 'Canada', employmentGrowth: 1.3 },
          { region: 'Australia', employmentGrowth: 1.2 },
          { region: 'United Kingdom', employmentGrowth: 1.1 },
          { region: 'Netherlands', employmentGrowth: 1.0 },
          { region: 'Germany', employmentGrowth: 0.8 },
          { region: 'France', employmentGrowth: 0.7 },
          { region: 'Spain', employmentGrowth: 0.6 },
          { region: 'South Korea', employmentGrowth: 0.5 },
          { region: 'Sweden', employmentGrowth: 0.4 },
          
          // Declining Markets
          { region: 'China', employmentGrowth: 0.2 },
          { region: 'Japan', employmentGrowth: -0.1 },
          { region: 'Italy', employmentGrowth: -0.2 },
          { region: 'Russia', employmentGrowth: -0.8 },
          { region: 'Ukraine', employmentGrowth: -2.1 }
        ]
      }
    } catch (error) {
      console.error('Error fetching global employment data:', error)
      return []
    }
  },

  // International population data from World Bank
  async getGlobalPopulationData(): Promise<any[]> {
    try {
      // World Bank Population Growth API
      const wbUrl = 'https://api.worldbank.org/v2/country/all/indicator/SP.POP.GROW?format=json&per_page=300&date=2022'
      
      try {
        const resp = await fetch(wbUrl)
        if (!resp.ok) throw new Error('World Bank API not available')
        const json = await resp.json()
        
        if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
          throw new Error('Unexpected World Bank API response')
        }
        
        const data = json[1]
          .filter((d: any) => d.country && d.country.value && d.value !== null && d.value !== undefined)
          .map((d: any) => ({
            region: d.country.value,
            populationGrowth: typeof d.value === 'number' ? d.value : 0,
            lastUpdated: d.date
          }))
          .filter((d: any) => d.region && !isNaN(d.populationGrowth))
        
        return data
      } catch (apiError) {
        console.warn('World Bank Population API error, using mock data:', apiError)
        // Global population growth mock data based on recent UN estimates
        return [
          // High Growth Countries
          { region: 'Niger', populationGrowth: 3.8 },
          { region: 'Angola', populationGrowth: 3.3 },
          { region: 'Chad', populationGrowth: 3.1 },
          { region: 'Mali', populationGrowth: 3.0 },
          { region: 'Uganda', populationGrowth: 2.9 },
          { region: 'Nigeria', populationGrowth: 2.6 },
          { region: 'Tanzania', populationGrowth: 2.5 },
          { region: 'Democratic Republic of Congo', populationGrowth: 2.4 },
          { region: 'Ethiopia', populationGrowth: 2.3 },
          { region: 'Kenya', populationGrowth: 2.2 },
          
          // Moderate Growth Countries
          { region: 'India', populationGrowth: 1.0 },
          { region: 'Philippines', populationGrowth: 1.5 },
          { region: 'Egypt', populationGrowth: 1.8 },
          { region: 'Pakistan', populationGrowth: 1.9 },
          { region: 'Bangladesh', populationGrowth: 1.1 },
          { region: 'Indonesia', populationGrowth: 0.9 },
          { region: 'Mexico', populationGrowth: 0.8 },
          { region: 'Brazil', populationGrowth: 0.7 },
          { region: 'Turkey', populationGrowth: 0.6 },
          { region: 'Vietnam', populationGrowth: 0.9 },
          
          // Developed Countries
          { region: 'United States', populationGrowth: 0.4 },
          { region: 'Canada', populationGrowth: 0.9 },
          { region: 'Australia', populationGrowth: 1.2 },
          { region: 'United Kingdom', populationGrowth: 0.5 },
          { region: 'France', populationGrowth: 0.3 },
          { region: 'Netherlands', populationGrowth: 0.4 },
          { region: 'Sweden', populationGrowth: 0.8 },
          { region: 'Norway', populationGrowth: 0.7 },
          
          // Declining Population Countries
          { region: 'China', populationGrowth: 0.0 },
          { region: 'Germany', populationGrowth: -0.1 },
          { region: 'Japan', populationGrowth: -0.5 },
          { region: 'South Korea', populationGrowth: -0.1 },
          { region: 'Italy', populationGrowth: -0.3 },
          { region: 'Spain', populationGrowth: 0.1 },
          { region: 'Poland', populationGrowth: -0.2 },
          { region: 'Russia', populationGrowth: -0.4 },
          { region: 'Ukraine', populationGrowth: -0.7 }
        ]
      }
    } catch (error) {
      console.error('Error fetching global population data:', error)
      return []
    }
  },

  // International construction cost data 
  async getGlobalConstructionCostData(): Promise<any[]> {
    try {
      // Mock data based on global construction cost indices from various sources
      // (Turner & Townsend, Arcadis, etc.)
      const globalConstructionCosts = [
        // Very High Cost Markets
        { region: 'Switzerland', constructionCostIndex: 168, costChange: 5.2 },
        { region: 'Norway', constructionCostIndex: 155, costChange: 4.8 },
        { region: 'Denmark', constructionCostIndex: 148, costChange: 6.1 },
        { region: 'Sweden', constructionCostIndex: 142, costChange: 5.7 },
        { region: 'Luxembourg', constructionCostIndex: 140, costChange: 4.9 },
        { region: 'Finland', constructionCostIndex: 138, costChange: 5.3 },
        { region: 'Iceland', constructionCostIndex: 135, costChange: 7.2 },
        { region: 'Netherlands', constructionCostIndex: 132, costChange: 6.8 },
        
        // High Cost Markets  
        { region: 'Germany', constructionCostIndex: 128, costChange: 7.1 },
        { region: 'Austria', constructionCostIndex: 125, costChange: 6.4 },
        { region: 'Belgium', constructionCostIndex: 122, costChange: 5.9 },
        { region: 'France', constructionCostIndex: 120, costChange: 6.2 },
        { region: 'United Kingdom', constructionCostIndex: 118, costChange: 8.1 },
        { region: 'Australia', constructionCostIndex: 116, costChange: 7.8 },
        { region: 'Canada', constructionCostIndex: 114, costChange: 6.9 },
        { region: 'Japan', constructionCostIndex: 112, costChange: 4.2 },
        
        // Moderate Cost Markets
        { region: 'United States', constructionCostIndex: 110, costChange: 7.4 },
        { region: 'Italy', constructionCostIndex: 108, costChange: 5.8 },
        { region: 'Spain', constructionCostIndex: 105, costChange: 6.1 },
        { region: 'South Korea', constructionCostIndex: 103, costChange: 4.9 },
        { region: 'Israel', constructionCostIndex: 101, costChange: 6.7 },
        { region: 'Portugal', constructionCostIndex: 98, costChange: 5.4 },
        { region: 'Czech Republic', constructionCostIndex: 95, costChange: 8.2 },
        { region: 'Slovenia', constructionCostIndex: 92, costChange: 7.1 },
        
        // Lower Cost Markets
        { region: 'Poland', constructionCostIndex: 88, costChange: 9.1 },
        { region: 'Chile', constructionCostIndex: 85, costChange: 6.8 },
        { region: 'Estonia', constructionCostIndex: 82, costChange: 7.9 },
        { region: 'Hungary', constructionCostIndex: 78, costChange: 8.5 },
        { region: 'Mexico', constructionCostIndex: 75, costChange: 7.2 },
        { region: 'Turkey', constructionCostIndex: 72, costChange: 12.4 },
        { region: 'Brazil', constructionCostIndex: 68, costChange: 8.9 },
        { region: 'Russia', constructionCostIndex: 65, costChange: 15.2 },
        { region: 'China', constructionCostIndex: 62, costChange: 4.1 },
        { region: 'India', constructionCostIndex: 45, costChange: 6.8 },
        { region: 'Vietnam', constructionCostIndex: 42, costChange: 8.2 },
        { region: 'Philippines', constructionCostIndex: 38, costChange: 7.4 },
        { region: 'Bangladesh', constructionCostIndex: 32, costChange: 9.1 }
      ]
      
      return globalConstructionCosts
    } catch (error) {
      console.error('Error fetching global construction cost data:', error)
      return []
    }
  },

  // Global Special Economic Zones data
  async getGlobalSpecialEconomicZones(): Promise<any[]> {
    try {
      // Mock data for major global special economic zones and development areas
      const globalSEZs = [
        // Asia-Pacific
        { 
          region: 'China',
          specialZones: 2543,
          zoneTypes: ['Special Economic Zones', 'Free Trade Zones', 'High-Tech Parks'],
          investmentIncentives: ['Tax holidays', 'Reduced corporate tax', 'Streamlined approvals'],
          totalInvestment: 1240000 // millions USD
        },
        {
          region: 'India', 
          specialZones: 373,
          zoneTypes: ['Special Economic Zones', 'Export Processing Zones'],
          investmentIncentives: ['100% FDI', 'Tax exemptions', 'Duty-free imports'],
          totalInvestment: 185000
        },
        {
          region: 'Philippines',
          specialZones: 389,
          zoneTypes: ['Economic Zones', 'Freeports', 'Tourism Enterprise Zones'],
          investmentIncentives: ['Income tax holiday', 'Duty exemptions'],
          totalInvestment: 52000
        },
        {
          region: 'Vietnam',
          specialZones: 326,
          zoneTypes: ['Economic Zones', 'High-Tech Parks', 'Industrial Parks'],
          investmentIncentives: ['Corporate tax incentives', 'Land rent reductions'],
          totalInvestment: 68000
        },
        {
          region: 'Malaysia',
          specialZones: 234,
          zoneTypes: ['Free Industrial Zones', 'Commercial Free Zones'],
          investmentIncentives: ['Pioneer status', 'Investment tax allowance'],
          totalInvestment: 45000
        },
        
        // Middle East & Africa
        {
          region: 'United Arab Emirates',
          specialZones: 45,
          zoneTypes: ['Free Zones', 'Economic Cities'],
          investmentIncentives: ['100% foreign ownership', 'No corporate tax', 'No personal tax'],
          totalInvestment: 89000
        },
        {
          region: 'Egypt',
          specialZones: 89,
          zoneTypes: ['Free Zones', 'Investment Zones'],
          investmentIncentives: ['Tax holidays', 'Customs exemptions'],
          totalInvestment: 23000
        },
        {
          region: 'Nigeria',
          specialZones: 45,
          zoneTypes: ['Free Trade Zones', 'Special Economic Zones'],
          investmentIncentives: ['Tax incentives', 'Infrastructure support'],
          totalInvestment: 18000
        },
        
        // Americas
        {
          region: 'Mexico',
          specialZones: 156,
          zoneTypes: ['Maquiladoras', 'Special Economic Zones'],
          investmentIncentives: ['IMMEX program', 'Tax benefits'],
          totalInvestment: 34000
        },
        {
          region: 'Brazil',
          specialZones: 23,
          zoneTypes: ['Free Trade Zones', 'Industrial Districts'],
          investmentIncentives: ['Tax reductions', 'Simplified procedures'],
          totalInvestment: 28000
        },
        {
          region: 'Costa Rica',
          specialZones: 67,
          zoneTypes: ['Free Trade Zones'],
          investmentIncentives: ['Tax exemptions', 'Duty-free imports'],
          totalInvestment: 12000
        },
        
        // Europe
        {
          region: 'Poland',
          specialZones: 14,
          zoneTypes: ['Special Economic Zones'],
          investmentIncentives: ['Corporate income tax exemption', 'Real estate tax relief'],
          totalInvestment: 25000
        },
        {
          region: 'Ireland',
          specialZones: 8,
          zoneTypes: ['Shannon Free Zone', 'International Financial Services Centre'],
          investmentIncentives: ['Low corporate tax rate', 'Customs benefits'],
          totalInvestment: 15000
        }
      ]
      
      return globalSEZs
    } catch (error) {
      console.error('Error fetching global SEZ data:', error)
      return []
    }
  }
}

// Alerts API
export const alertsAPI = {
  async createAlert(userId: string, alertData: {
    name: string
    region: string
    coordinates: Coordinates[]
    filters: FilterState
  }) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: userId,
          name: alertData.name,
          region: alertData.region,
          coordinates: alertData.coordinates,
          filters: alertData.filters,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating alert:', error)
      throw new Error('Failed to create alert')
    }
  },

  async getUserAlerts(userId: string) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user alerts:', error)
      throw new Error('Failed to fetch alerts')
    }
  },

  async updateAlert(alertId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update(updates)
        .eq('id', alertId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating alert:', error)
      throw new Error('Failed to update alert')
    }
  }
}

// Tax Credit Zones API (Comprehensive Real Estate Development Incentives)
export const taxCreditZonesAPI = {
  
  async getAffordableHousingZones(bounds?: { north: number; south: number; east: number; west: number }): Promise<any[]> {
    try {
      // Mock LIHTC QCT and DDA zones
      console.log('[AffordableHousingZones] Generating mock zone polygons for bounds:', bounds)
      
      const mockZones = [
        // Chicago QCT
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.7, 41.85], [-87.65, 41.85], [-87.65, 41.89], [-87.7, 41.89], [-87.7, 41.85]
            ]]
          },
          properties: {
            zone_type: 'QCT',
            tract_name: 'Chicago South Side QCT',
            state: 'IL',
            county: 'Cook',
            description: 'Low-income area with enhanced LIHTC benefits',
            benefits: '+30% Tax Credits',
            program: 'LIHTC QCT'
          }
        },
        // Chicago DDA
        {
          type: 'Feature', 
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.66, 41.87], [-87.62, 41.87], [-87.62, 41.91], [-87.66, 41.91], [-87.66, 41.87]
            ]]
          },
          properties: {
            zone_type: 'DDA',
            tract_name: 'Chicago North DDA',
            state: 'IL',
            county: 'Cook', 
            description: 'High-cost development area with enhanced incentives',
            benefits: '+30% Tax Credits',
            program: 'LIHTC DDA'
          }
        },
        // LA QCT
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-118.28, 34.03], [-118.24, 34.03], [-118.24, 34.07], [-118.28, 34.07], [-118.28, 34.03]
            ]]
          },
          properties: {
            zone_type: 'QCT',
            tract_name: 'LA Downtown QCT',
            state: 'CA',
            county: 'Los Angeles',
            description: 'Low-income area with enhanced LIHTC benefits',
            benefits: '+30% Tax Credits',
            program: 'LIHTC QCT'
          }
        },
        // SF DDA
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon', 
            coordinates: [[
              [-122.45, 37.76], [-122.41, 37.76], [-122.41, 37.80], [-122.45, 37.80], [-122.45, 37.76]
            ]]
          },
          properties: {
            zone_type: 'DDA',
            tract_name: 'San Francisco Central DDA',
            state: 'CA',
            county: 'San Francisco',
            description: 'High-cost development area with enhanced incentives',
            benefits: '+30% Tax Credits',
            program: 'LIHTC DDA'
          }
        },
        // NYC QCT
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-73.98, 40.75], [-73.94, 40.75], [-73.94, 40.79], [-73.98, 40.79], [-73.98, 40.75]
            ]]
          },
          properties: {
            zone_type: 'QCT',
            tract_name: 'Manhattan East QCT',
            state: 'NY',
            county: 'New York',
            description: 'Low-income area with enhanced LIHTC benefits',
            benefits: '+30% Tax Credits',
            program: 'LIHTC QCT'
          }
        }
      ]
      
      return mockZones
    } catch (error) {
      console.error('Error fetching affordable housing zones:', error)
      return []
    }
  },

  async getOpportunityZones(bounds?: { north: number; south: number; east: number; west: number }): Promise<any[]> {
    try {
      // Mock Opportunity Zones data
      console.log('[OpportunityZones] Generating mock OZ polygons for bounds:', bounds)
      
      const mockOZs = [
        // Chicago OZ
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.72, 41.83], [-87.68, 41.83], [-87.68, 41.87], [-87.72, 41.87], [-87.72, 41.83]
            ]]
          },
          properties: {
            zone_type: 'OZ',
            tract_name: 'Chicago West Side OZ',
            tract_id: '17031842400',
            state: 'IL',
            county: 'Cook',
            description: 'Qualified Opportunity Zone for capital gains deferral',
            benefits: 'Capital gains tax deferral + reduction',
            program: 'Opportunity Zones'
          }
        },
        // LA OZ
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-118.32, 34.01], [-118.28, 34.01], [-118.28, 34.05], [-118.32, 34.05], [-118.32, 34.01]
            ]]
          },
          properties: {
            zone_type: 'OZ',
            tract_name: 'LA Central OZ',
            tract_id: '06037207400',
            state: 'CA',
            county: 'Los Angeles',
            description: 'Qualified Opportunity Zone for capital gains deferral',
            benefits: 'Capital gains tax deferral + reduction',
            program: 'Opportunity Zones'
          }
        },
        // Detroit OZ
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-83.08, 42.33], [-83.04, 42.33], [-83.04, 42.37], [-83.08, 42.37], [-83.08, 42.33]
            ]]
          },
          properties: {
            zone_type: 'OZ',
            tract_name: 'Detroit Downtown OZ',
            tract_id: '26163532600',
            state: 'MI',
            county: 'Wayne',
            description: 'Qualified Opportunity Zone for capital gains deferral',
            benefits: 'Capital gains tax deferral + reduction',
            program: 'Opportunity Zones'
          }
        }
      ]
      
      return mockOZs
    } catch (error) {
      console.error('Error fetching opportunity zones:', error)
      return []
    }
  },

  async getNewMarketsZones(bounds?: { north: number; south: number; east: number; west: number }): Promise<any[]> {
    try {
      // Mock New Markets Tax Credit eligible areas
      console.log('[NewMarketsZones] Generating mock NMTC areas for bounds:', bounds)
      
      const mockNMTCs = [
        // Chicago NMTC Area
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-87.69, 41.86], [-87.65, 41.86], [-87.65, 41.90], [-87.69, 41.90], [-87.69, 41.86]
            ]]
          },
          properties: {
            zone_type: 'NMTC',
            area_name: 'Chicago North NMTC Area',
            state: 'IL',
            county: 'Cook',
            description: 'Low-income community eligible for New Markets Tax Credits',
            benefits: '39% tax credit over 7 years',
            program: 'New Markets Tax Credit'
          }
        },
        // Atlanta NMTC Area
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-84.42, 33.73], [-84.38, 33.73], [-84.38, 33.77], [-84.42, 33.77], [-84.42, 33.73]
            ]]
          },
          properties: {
            zone_type: 'NMTC',
            area_name: 'Atlanta Downtown NMTC Area',
            state: 'GA',
            county: 'Fulton',
            description: 'Low-income community eligible for New Markets Tax Credits',
            benefits: '39% tax credit over 7 years',
            program: 'New Markets Tax Credit'
          }
        }
      ]
      
      return mockNMTCs
    } catch (error) {
      console.error('Error fetching New Markets zones:', error)
      return []
    }
  },

  async getHistoricZones(bounds?: { north: number; south: number; east: number; west: number }): Promise<any[]> {
    try {
      // Mock Historic Rehabilitation Tax Credit areas
      console.log('[HistoricZones] Generating mock HTC areas for bounds:', bounds)
      
      const mockHTCs = [
        // Historic District in Boston
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-71.06, 42.35], [-71.04, 42.35], [-71.04, 42.37], [-71.06, 42.37], [-71.06, 42.35]
            ]]
          },
          properties: {
            zone_type: 'HTC',
            district_name: 'Boston Historic District',
            state: 'MA',
            county: 'Suffolk',
            description: 'Historic district eligible for rehabilitation tax credits',
            benefits: '20% federal + state credits',
            program: 'Historic Tax Credit'
          }
        },
        // Savannah Historic District
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-81.12, 32.07], [-81.08, 32.07], [-81.08, 32.09], [-81.12, 32.09], [-81.12, 32.07]
            ]]
          },
          properties: {
            zone_type: 'HTC',
            district_name: 'Savannah Historic District',
            state: 'GA',
            county: 'Chatham',
            description: 'Historic district eligible for rehabilitation tax credits',
            benefits: '20% federal + state credits',
            program: 'Historic Tax Credit'
          }
        }
      ]
      
      return mockHTCs
    } catch (error) {
      console.error('Error fetching Historic zones:', error)
      return []
    }
  }
} 