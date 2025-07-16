export interface PropertyListing {
  id: string
  type: 'commercial' | 'industrial' | 'multifamily'
  subtype?: string
  coordinates: {
    lat: number
    lng: number
  }
  address: string
  city: string
  state: string
  country: string
  zipCode?: string
  price?: number
  pricePerSqft?: number
  squareFootage?: number
  yearBuilt?: number
  lotSize?: number
  zoning?: string
  occupancyRate?: number
  capRate?: number
  description?: string
  amenities?: string[]
  images?: string[]
  source: string
  listingUrl?: string
  lastUpdated: Date
}

export interface PropertyFilters {
  types: ('commercial' | 'industrial' | 'multifamily')[]
  minPrice?: number
  maxPrice?: number
  minSize?: number
  maxSize?: number
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

class PropertyDataService {
  private cache = new Map<string, { data: PropertyListing[], timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Fetch properties from multiple free sources
   */
  async fetchProperties(filters: PropertyFilters): Promise<PropertyListing[]> {
    const cacheKey = this.getCacheKey(filters)
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const results = await Promise.allSettled([
        this.fetchFromOpenStreetMap(filters),
        this.fetchFromUSGSCommercialData(filters),
        this.fetchFromLocalGovernmentData(filters),
        this.fetchFromFreeCommercialAPIs(filters)
      ])

      const allProperties: PropertyListing[] = []
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allProperties.push(...result.value)
        } else {
          console.warn(`Property source ${index} failed:`, result.reason)
        }
      })

      // Remove duplicates based on coordinates and address
      const uniqueProperties = this.removeDuplicates(allProperties)
      
      this.cache.set(cacheKey, { data: uniqueProperties, timestamp: Date.now() })
      return uniqueProperties
    } catch (error) {
      console.error('Error fetching properties:', error)
      return []
    }
  }

  /**
   * Fetch commercial properties from OpenStreetMap Overpass API
   */
  private async fetchFromOpenStreetMap(filters: PropertyFilters): Promise<PropertyListing[]> {
    if (!filters.bounds) return []

    const { north, south, east, west } = filters.bounds
    
    // Overpass query for commercial, industrial, and multifamily properties
    const query = `
      [out:json][timeout:25];
      (
        way["building"~"commercial|industrial|office|retail|warehouse|factory|apartments|hotel"]
          (${south},${west},${north},${east});
        way["landuse"~"commercial|industrial|retail"]
          (${south},${west},${north},${east});
        way["amenity"~"office|industrial"]
          (${south},${west},${north},${east});
        relation["building"~"commercial|industrial|office|retail|warehouse|factory|apartments|hotel"]
          (${south},${west},${north},${east});
      );
      out geom;
    `

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      })

      if (!response.ok) throw new Error('OpenStreetMap API error')

      const data = await response.json()
      return this.parseOpenStreetMapData(data.elements)
    } catch (error) {
      console.warn('OpenStreetMap fetch failed:', error)
      return []
    }
  }

  /**
   * Fetch from USGS and other government commercial data sources
   */
  private async fetchFromUSGSCommercialData(filters: PropertyFilters): Promise<PropertyListing[]> {
    // This would integrate with USGS National Map and other government sources
    // For now, returning empty array as these APIs require more specific implementation
    return []
  }

  /**
   * Fetch from local government open data portals
   */
  private async fetchFromLocalGovernmentData(filters: PropertyFilters): Promise<PropertyListing[]> {
    const properties: PropertyListing[] = []

    try {
      // Example: NYC Open Data for commercial properties
      if (filters.bounds) {
        const nycData = await this.fetchNYCOpenData(filters.bounds)
        properties.push(...nycData)
      }
    } catch (error) {
      console.warn('Local government data fetch failed:', error)
    }

    return properties
  }

  /**
   * Fetch from free commercial real estate APIs
   */
  private async fetchFromFreeCommercialAPIs(filters: PropertyFilters): Promise<PropertyListing[]> {
    const properties: PropertyListing[] = []

    try {
      // RentSpree API (free tier) - but only for multifamily
      if (filters.types.includes('multifamily')) {
        // Note: User said RentSpree is inappropriate - skipping
      }

      // PropertyRadar API (has free tier)
      const propertyRadarData = await this.fetchPropertyRadarData(filters)
      properties.push(...propertyRadarData)

      // Reonomy API (has free tier for limited data)
      const reonomyData = await this.fetchReonomyData(filters)
      properties.push(...reonomyData)

    } catch (error) {
      console.warn('Free commercial APIs fetch failed:', error)
    }

    return properties
  }

  /**
   * Fetch NYC Open Data commercial properties
   */
  private async fetchNYCOpenData(bounds: PropertyFilters['bounds']): Promise<PropertyListing[]> {
    if (!bounds) return []

    try {
      // NYC Department of Finance Property Sales Data
      const salesUrl = `https://data.cityofnewyork.us/resource/tc32-3hbf.json?$limit=100&$where=within_box(location,${bounds.south},${bounds.west},${bounds.north},${bounds.east})`
      
      const response = await fetch(salesUrl)
      if (!response.ok) throw new Error('NYC Open Data API error')

      const data = await response.json()
      return this.parseNYCOpenData(data)
    } catch (error) {
      console.warn('NYC Open Data fetch failed:', error)
      return []
    }
  }

  /**
   * Fetch from PropertyRadar API (free tier)
   */
  private async fetchPropertyRadarData(filters: PropertyFilters): Promise<PropertyListing[]> {
    // PropertyRadar API integration would go here
    // Requires API key but has free tier
    return []
  }

  /**
   * Fetch from Reonomy API (free tier)
   */
  private async fetchReonomyData(filters: PropertyFilters): Promise<PropertyListing[]> {
    // Reonomy API integration would go here
    // Has free tier for basic property data
    return []
  }

  /**
   * Parse OpenStreetMap data into PropertyListing format
   */
  private parseOpenStreetMapData(elements: any[]): PropertyListing[] {
    return elements.map((element, index) => {
      const center = this.getElementCenter(element)
      const tags = element.tags || {}
      
      return {
        id: `osm-${element.id || index}`,
        type: this.mapOSMToPropertyType(tags),
        coordinates: center,
        address: this.buildAddressFromTags(tags),
        city: tags['addr:city'] || 'Unknown',
        state: tags['addr:state'] || 'Unknown',
        country: tags['addr:country'] || 'US',
        zipCode: tags['addr:postcode'],
        description: tags.description || tags.name,
        amenities: this.extractAmenities(tags),
        source: 'OpenStreetMap',
        lastUpdated: new Date()
      } as PropertyListing
    }).filter(prop => prop.coordinates.lat !== 0 && prop.coordinates.lng !== 0)
  }

  /**
   * Parse NYC Open Data into PropertyListing format
   */
  private parseNYCOpenData(data: any[]): PropertyListing[] {
    return data.map((item, index) => ({
      id: `nyc-${item.ease_ment || index}`,
      type: this.mapNYCToPropertyType(item.building_class_category),
      coordinates: {
        lat: parseFloat(item.location?.latitude || '0'),
        lng: parseFloat(item.location?.longitude || '0')
      },
      address: `${item.address || ''}, ${item.borough || ''}`,
      city: item.borough || 'New York',
      state: 'NY',
      country: 'US',
      zipCode: item.zip_code,
      price: parseFloat(item.sale_price || '0'),
      squareFootage: parseFloat(item.gross_square_feet || '0'),
      yearBuilt: parseInt(item.year_built || '0'),
      source: 'NYC Open Data',
      lastUpdated: new Date()
    })).filter(prop => prop.coordinates.lat !== 0 && prop.coordinates.lng !== 0)
  }

  /**
   * Map OpenStreetMap building types to our property types
   */
  private mapOSMToPropertyType(tags: any): PropertyListing['type'] {
    const building = tags.building?.toLowerCase()
    const landuse = tags.landuse?.toLowerCase()
    const amenity = tags.amenity?.toLowerCase()

    if (building === 'apartments' || building === 'residential') return 'multifamily'
    if (building === 'industrial' || building === 'warehouse' || building === 'factory') return 'industrial'
    if (building === 'commercial' || building === 'office' || building === 'retail') return 'commercial'
    if (landuse === 'industrial') return 'industrial'
    if (landuse === 'commercial' || landuse === 'retail') return 'commercial'
    if (amenity === 'office') return 'commercial'
    if (amenity === 'industrial') return 'industrial'

    return 'commercial' // Default fallback
  }

  /**
   * Map NYC building class to our property types
   */
  private mapNYCToPropertyType(buildingClass: string): PropertyListing['type'] {
    if (!buildingClass) return 'commercial'
    
    const category = buildingClass.toLowerCase()
    if (category.includes('apartment') || category.includes('residential')) return 'multifamily'
    if (category.includes('industrial') || category.includes('warehouse')) return 'industrial'
    return 'commercial'
  }

  /**
   * Get center coordinates from OSM element
   */
  private getElementCenter(element: any): { lat: number; lng: number } {
    if (element.lat && element.lon) {
      return { lat: element.lat, lng: element.lon }
    }
    
    if (element.geometry && element.geometry.length > 0) {
      const coords = element.geometry
      const sumLat = coords.reduce((sum: number, coord: any) => sum + coord.lat, 0)
      const sumLon = coords.reduce((sum: number, coord: any) => sum + coord.lon, 0)
      return {
        lat: sumLat / coords.length,
        lng: sumLon / coords.length
      }
    }
    
    return { lat: 0, lng: 0 }
  }

  /**
   * Build address from OSM tags
   */
  private buildAddressFromTags(tags: any): string {
    const parts = []
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
    if (tags['addr:street']) parts.push(tags['addr:street'])
    return parts.join(' ') || tags.name || 'Unknown Address'
  }

  /**
   * Extract amenities from OSM tags
   */
  private extractAmenities(tags: any): string[] {
    const amenities = []
    if (tags.parking) amenities.push('Parking')
    if (tags.wheelchair === 'yes') amenities.push('Wheelchair Accessible')
    if (tags.elevator === 'yes') amenities.push('Elevator')
    if (tags.air_conditioning === 'yes') amenities.push('Air Conditioning')
    return amenities
  }

  /**
   * Remove duplicate properties
   */
  private removeDuplicates(properties: PropertyListing[]): PropertyListing[] {
    const seen = new Set<string>()
    return properties.filter(prop => {
      const key = `${prop.coordinates.lat.toFixed(6)}-${prop.coordinates.lng.toFixed(6)}-${prop.address}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * Generate cache key for filters
   */
  private getCacheKey(filters: PropertyFilters): string {
    return JSON.stringify(filters)
  }

  /**
   * Get property details for a specific property
   */
  async getPropertyDetails(propertyId: string): Promise<PropertyListing | null> {
    // This would fetch detailed information about a specific property
    // from various sources and combine them
    return null
  }

  /**
   * Search properties by address or location
   */
  async searchProperties(query: string, filters?: Partial<PropertyFilters>): Promise<PropertyListing[]> {
    // This would implement property search functionality
    // using geocoding and the existing fetch methods
    return []
  }
}

export const propertyDataService = new PropertyDataService() 