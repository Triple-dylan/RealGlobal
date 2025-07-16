# 📊 RealGlobal Data Sources & Implementation Guide

## 🎯 Quick Start Implementation Tasks

### Immediate Next Steps (Week 1-2)
1. **Affordable Housing Overlay** - HUD API integration
2. **Industrial Zones Overlay** - Municipal API collection
3. **MLS Integration Planning** - Research regional MLS APIs
4. **Property Listings Component** - Basic property visualization

---

## 🏠 Real Estate Listings Data Sources

### Primary MLS Integration (RETS)
**Priority**: Critical | **Timeline**: 4-6 weeks | **Cost**: $500-2000/month per MLS

#### Major Regional MLS Systems
```typescript
const mlsSystems = {
  // California
  CRMLS: {
    name: 'California Regional MLS',
    coverage: 'Southern California (LA, Orange County, Riverside)',
    properties: '200,000+',
    cost: '$1,500/month',
    retsUrl: 'https://rets.crmls.org/Login.asmx/Login',
    implementation: '2-3 weeks'
  },
  
  // Texas  
  NTREIS: {
    name: 'North Texas Real Estate Information Systems',
    coverage: 'Dallas-Fort Worth Metroplex',
    properties: '150,000+',
    cost: '$800/month',
    retsUrl: 'https://ntreis.ddltech.com/rets/login',
    implementation: '2 weeks'
  },
  
  // Florida
  MiMLS: {
    name: 'Miami MLS',
    coverage: 'Miami-Dade, Broward, Palm Beach',
    properties: '100,000+',
    cost: '$600/month',
    retsUrl: 'https://miami.rets.interealty.com/login.aspx',
    implementation: '1.5 weeks'
  },
  
  // New York
  REBNY: {
    name: 'Real Estate Board of New York',
    coverage: 'Manhattan, Brooklyn, Queens, Bronx',
    properties: '80,000+',
    cost: '$2,000/month',
    retsUrl: 'https://data.rebny.com/rets/login',
    implementation: '3 weeks (complex authentication)'
  }
}
```

#### Implementation Code Template
```typescript
// src/services/mls/rets-client.ts
export class RETSClient {
  private baseUrl: string
  private sessionCookie: string | null = null
  
  constructor(private config: MLSConfig) {
    this.baseUrl = config.retsUrl
  }
  
  async authenticate(): Promise<void> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'User-Agent': 'RealGlobal/1.0',
        'RETS-Version': 'RETS/1.7.2',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username: this.config.username,
        password: this.config.password
      })
    })
    
    // Extract session cookie and URLs from response
    this.sessionCookie = this.extractSessionCookie(response)
  }
  
  async searchProperties(criteria: PropertySearchCriteria): Promise<MLSProperty[]> {
    const searchUrl = `${this.baseUrl}/Search`
    const query = this.buildSearchQuery(criteria)
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Cookie': this.sessionCookie!,
        'User-Agent': 'RealGlobal/1.0',
        'RETS-Version': 'RETS/1.7.2'
      },
      body: query
    })
    
    return this.parseMLSResponse(await response.text())
  }
}
```

### Alternative/Backup Data Sources

#### Zillow API (RapidAPI)
```typescript
const zillowAPI = {
  provider: 'RapidAPI - Zillow.com API',
  url: 'https://rapidapi.com/apimaker/api/zillow-com1/',
  pricing: {
    basic: '$50/month - 1000 requests',
    pro: '$200/month - 10000 requests',
    enterprise: '$500/month - 50000 requests'
  },
  coverage: 'National (US)',
  dataQuality: 'Good for residential, limited commercial',
  implementation: '1 week'
}

// Implementation example
const fetchZillowData = async (searchParams) => {
  const response = await fetch('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
    },
    params: searchParams
  })
  return response.json()
}
```

#### RentSpider API
```typescript
const rentSpiderAPI = {
  url: 'https://www.rentspider.com/api',
  cost: '$300/month',
  strength: 'Excellent rental market data',
  coverage: 'National rental properties',
  dataTypes: ['apartments', 'houses', 'condos', 'commercial'],
  implementation: '1-2 weeks'
}
```

---

## 🏢 Zoning & Regulatory Data Sources

### Affordable Housing Data

#### HUD (Housing and Urban Development) APIs
```typescript
const hudAPIs = {
  // Low Income Housing Tax Credit
  lihtc: {
    url: 'https://lihtc.huduser.gov/Geocoding/GeoCoding.aspx',
    format: 'REST API',
    coverage: 'National LIHTC properties',
    cost: 'Free',
    rateLimit: '1000 requests/hour'
  },
  
  // Public Housing Buildings
  publicHousing: {
    url: 'https://data.hud.gov/datasets/public-housing-buildings',
    format: 'GeoJSON/CSV download',
    coverage: 'All public housing nationwide',
    cost: 'Free',
    updateFrequency: 'Quarterly'
  },
  
  // Housing Choice Voucher Program (Section 8)
  vouchers: {
    url: 'https://data.hud.gov/datasets/housing-choice-voucher-program',
    format: 'CSV/API',
    coverage: 'Voucher program locations',
    cost: 'Free'
  }
}

// Implementation service
export class HUDDataService {
  async getLIHTCProperties(bounds: BoundingBox): Promise<AffordableHousingUnit[]> {
    const response = await fetch(
      `https://lihtc.huduser.gov/Geocoding/GeoCoding.aspx?` +
      `bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&` +
      `format=json&limit=1000`
    )
    
    const data = await response.json()
    return data.features.map(this.transformHUDProperty)
  }
}
```

#### State Housing Authority APIs
```typescript
const stateHousingAPIs = {
  california: {
    agency: 'California Department of Housing and Community Development',
    url: 'https://www.hcd.ca.gov/developers-portal/data-hub',
    apiUrl: 'https://api.hcd.ca.gov/housing-data/v1/',
    coverage: 'All affordable housing programs in CA'
  },
  
  texas: {
    agency: 'Texas Department of Housing and Community Affairs',
    url: 'https://www.tdhca.state.tx.us/developers/multifamily',
    dataType: 'CSV downloads, some API access'
  },
  
  florida: {
    agency: 'Florida Housing Finance Corporation',
    url: 'https://www.floridahousing.org/developers/multifamily',
    dataType: 'Property databases, development pipeline'
  }
}
```

### Industrial Zones Data

#### Municipal Zoning APIs (Primary Source)
```typescript
const municipalZoningAPIs = {
  // Chicago
  chicago: {
    zoning: 'https://data.cityofchicago.org/resource/p8va-airx.json',
    permits: 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
    apiType: 'Socrata API',
    authentication: 'API key required',
    implementation: `
      const fetchChicagoZoning = async () => {
        const response = await fetch(
          'https://data.cityofchicago.org/resource/p8va-airx.json?$limit=50000',
          {
            headers: {
              'X-App-Token': process.env.CHICAGO_API_KEY
            }
          }
        )
        return response.json()
      }
    `
  },
  
  // New York City
  nyc: {
    zoning: 'https://data.cityofnewyork.us/resource/7isb-wh4c.json',
    pluto: 'https://data.cityofnewyork.us/resource/64uk-42ks.json', // Property data
    apiType: 'Socrata API',
    specialFeatures: 'Includes tax lot data, building classifications'
  },
  
  // Los Angeles
  losAngeles: {
    zoning: 'https://geohub.lacity.org/datasets/zoning.geojson',
    permits: 'https://data.lacity.org/resource/yv23-pmwf.json',
    apiType: 'ArcGIS REST API + Socrata',
    coverage: 'City of LA only (not county)'
  },
  
  // Houston (no zoning, but land use data)
  houston: {
    landUse: 'https://cohgis-mycity.opendata.arcgis.com/datasets/land-use',
    permits: 'https://cohgis-mycity.opendata.arcgis.com/datasets/building-permits',
    note: 'Houston has no formal zoning - uses deed restrictions and land use'
  }
}
```

#### EPA Industrial Facilities (Supplementary)
```typescript
const epaIndustrialData = {
  // Toxic Release Inventory
  tri: {
    url: 'https://data.epa.gov/efservice/tri_facility/',
    description: 'Manufacturing facilities that handle toxic chemicals',
    format: 'REST API',
    example: 'https://data.epa.gov/efservice/tri_facility/state/ca/rows/0:100/json'
  },
  
  // Enforcement and Compliance History
  echo: {
    url: 'https://echo.epa.gov/tools/web-services',
    description: 'Facility compliance and enforcement data',
    coverage: 'All regulated facilities'
  },
  
  // National Pollutant Discharge Elimination System
  npdes: {
    url: 'https://data.epa.gov/efservice/npdes/',
    description: 'Industrial discharge permits',
    useful: 'Identifies industrial operations near water bodies'
  }
}
```

---

## 📈 Economic Indicators Data Sources

### Builder Accessibility Index Components

#### Construction Cost Data
```typescript
const constructionCostSources = {
  // Bureau of Labor Statistics
  bls: {
    api: 'https://api.bls.gov/publicAPI/v2/timeseries/data/',
    series: {
      constructionWages: 'CES2023600001', // Construction sector wages
      materialPrices: 'PCU327310327310', // Ready-mix concrete prices
      laborProductivity: 'PRS30000062' // Construction productivity
    },
    cost: 'Free (500 requests/day with registration)',
    implementation: `
      const fetchBLSData = async (seriesId) => {
        const response = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            seriesid: [seriesId],
            startyear: '2022',
            endyear: '2024',
            registrationkey: process.env.BLS_API_KEY
          })
        })
        return response.json()
      }
    `
  },
  
  // Federal Reserve Economic Data (FRED)
  fred: {
    api: 'https://api.stlouisfed.org/fred/series/observations',
    series: {
      lumber: 'WPU081', // Lumber and wood products
      steel: 'WPU101', // Iron and steel
      cement: 'WPU132' // Cement
    },
    apiKey: 'Required (free)',
    cost: 'Free'
  }
}
```

#### Permit Processing Data
```typescript
const permitDataSources = {
  // Municipal building departments
  buildingPermits: {
    chicago: 'https://data.cityofchicago.org/resource/ydr8-5enu.json',
    nyc: 'https://data.cityofnewyork.us/resource/ipu4-2q9a.json',
    austin: 'https://data.austintexas.gov/resource/3syk-w9eu.json',
    seattle: 'https://data.seattle.gov/resource/76t5-zqzr.json'
  },
  
  // Metrics to calculate
  metrics: {
    averagePermitTime: 'Days from application to approval',
    costPerSqFt: 'Permit fees per square foot',
    approvalRate: 'Percentage of permits approved',
    reviewComplexity: 'Number of review stages required'
  }
}
```

### International Accessibility Index Components

#### Airport Connectivity Data
```typescript
const airportConnectivitySources = {
  // FAA Airport Data
  faa: {
    api: 'https://api.faa.gov/airports',
    data: 'Airport locations, runway data, traffic volume',
    cost: 'Free'
  },
  
  // Flight data APIs
  flightAPIs: {
    amadeus: {
      url: 'https://developers.amadeus.com/self-service/category/air',
      cost: 'Free tier: 2000 requests/month',
      features: 'Flight schedules, routes, prices'
    },
    aviationstack: {
      url: 'https://aviationstack.com/documentation',
      cost: '$10-99/month',
      features: 'Real-time flight data, historical data'
    }
  }
}
```

#### Immigration & Investment Policy Data
```typescript
const immigrationPolicySources = {
  // Government sources
  uscis: {
    url: 'https://www.uscis.gov/tools/reports-and-studies',
    data: 'Immigration statistics, policy updates',
    format: 'Reports, some structured data'
  },
  
  // Investment policy tracking
  investmentPolicy: {
    cfius: 'Committee on Foreign Investment data',
    treaties: 'Bilateral investment treaties',
    restrictions: 'Foreign ownership restrictions by sector'
  },
  
  // Commercial sources
  immigrationData: {
    provider: 'Migration Policy Institute',
    url: 'https://www.migrationpolicy.org/programs/data-hub',
    cost: 'Some free, some paid reports'
  }
}
```

---

## 🔧 Implementation Services Architecture

### Data Collection Service
```typescript
// src/services/data-collection/data-collector.ts
export abstract class DataCollector {
  protected abstract apiUrl: string
  protected abstract rateLimit: number
  protected abstract authMethod: 'api-key' | 'oauth' | 'basic' | 'none'
  
  abstract collect(params: CollectionParams): Promise<RawData[]>
  
  protected async makeRequest(url: string, options: RequestOptions = {}): Promise<Response> {
    // Rate limiting logic
    await this.rateLimiter.wait()
    
    // Authentication
    const headers = await this.getAuthHeaders()
    
    return fetch(url, {
      ...options,
      headers: { ...headers, ...options.headers }
    })
  }
}

// Specific collectors
export class HUDDataCollector extends DataCollector {
  protected apiUrl = 'https://lihtc.huduser.gov/Geocoding/GeoCoding.aspx'
  protected rateLimit = 1000 // requests per hour
  protected authMethod = 'none'
  
  async collect(params: BoundingBoxParams): Promise<AffordableHousingData[]> {
    const url = `${this.apiUrl}?bbox=${params.bounds}&format=json&limit=1000`
    const response = await this.makeRequest(url)
    return this.parseResponse(await response.json())
  }
}
```

### Data Processing Pipeline
```typescript
// src/services/data-processing/data-processor.ts
export class DataProcessingPipeline {
  private processors: Map<string, DataProcessor> = new Map()
  private validators: Map<string, DataValidator> = new Map()
  private enrichers: Map<string, DataEnricher> = new Map()
  
  async processData(dataType: string, rawData: any[]): Promise<ProcessedData[]> {
    // 1. Clean and normalize
    const cleaned = await this.processors.get(dataType)?.process(rawData) || []
    
    // 2. Validate
    const validated = await this.validators.get(dataType)?.validate(cleaned) || []
    
    // 3. Enrich with additional data
    const enriched = await this.enrichers.get(dataType)?.enrich(validated) || []
    
    // 4. Store in database
    await this.storeProcessedData(dataType, enriched)
    
    return enriched
  }
}
```

### Cache Strategy
```typescript
// src/services/cache/cache-strategy.ts
export class CacheStrategy {
  private redis = new Redis(process.env.REDIS_URL)
  private ttlSettings = {
    propertyListings: 3600, // 1 hour
    zoningData: 86400 * 7, // 1 week
    economicData: 86400, // 1 day
    analysisResults: 86400 * 30 // 30 days
  }
  
  async get<T>(key: string, dataType: keyof typeof this.ttlSettings): Promise<T | null> {
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }
  
  async set(key: string, data: any, dataType: keyof typeof this.ttlSettings): Promise<void> {
    const ttl = this.ttlSettings[dataType]
    await this.redis.setex(key, ttl, JSON.stringify(data))
  }
}
```

---

## 📊 Data Quality & Monitoring

### Data Quality Metrics
```typescript
interface DataQualityMetrics {
  coverage: {
    geographic: number // Percentage of target areas covered
    temporal: number // Data freshness score
    completeness: number // Percentage of required fields populated
  }
  
  accuracy: {
    geocodingAccuracy: number // Percentage of addresses successfully geocoded
    dataValidationRate: number // Percentage passing validation
    userReportedIssues: number // Issues reported by users
  }
  
  performance: {
    collectionLatency: number // Average API response time
    processingTime: number // Time to process raw data
    cacheHitRate: number // Percentage of requests served from cache
  }
}
```

### Data Monitoring Dashboard
```typescript
// src/services/monitoring/data-monitor.ts
export class DataMonitor {
  async generateQualityReport(): Promise<DataQualityReport> {
    const [coverage, accuracy, performance] = await Promise.all([
      this.calculateCoverage(),
      this.calculateAccuracy(),
      this.calculatePerformance()
    ])
    
    return {
      timestamp: new Date(),
      coverage,
      accuracy,
      performance,
      recommendations: this.generateRecommendations({ coverage, accuracy, performance })
    }
  }
  
  private generateRecommendations(metrics: DataQualityMetrics): string[] {
    const recommendations = []
    
    if (metrics.coverage.geographic < 0.8) {
      recommendations.push('Expand data collection to underserved geographic areas')
    }
    
    if (metrics.accuracy.geocodingAccuracy < 0.9) {
      recommendations.push('Improve address standardization and geocoding accuracy')
    }
    
    if (metrics.performance.cacheHitRate < 0.7) {
      recommendations.push('Optimize caching strategy for frequently accessed data')
    }
    
    return recommendations
  }
}
```

---

This comprehensive data sources guide provides everything needed to implement the complete RealGlobal platform, with specific APIs, implementation code, costs, and timelines for each component. 