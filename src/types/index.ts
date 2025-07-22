// Map and Location Types
export interface Coordinates {
  lat: number
  lng: number
}

export interface BoundingBox {
  north: number
  south: number
  east: number
  west: number
}

// Property and Listing Types
export interface Property {
  id: string
  address: string
  coordinates: Coordinates
  price: number
  size: number
  type: PropertyType
  zoning: string
  opportunityScore: number
  listingDate: string
  status: ListingStatus
}

export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'mixed-use' | 'land' | 'multifamily'
export type ListingStatus = 'active' | 'pending' | 'sold' | 'off-market'

// Zoning Types
export interface ZoningData {
  id: string
  name: string
  type: ZoningType
  coordinates: Coordinates[]
  restrictions: string[]
  opportunities: string[]
  score: number
}

export type ZoningType = 
  | 'opportunity-zones'
  | 'affordable-housing'
  | 'industrial'
  | 'multifamily'
  | 'commercial'
  | 'mixed-use'

// Economic Data Types
export interface EconomicData {
  id: string
  name: string
  value: number
  indicator: 'gdp-growth' | 'property-appreciation'
}

// Enhanced Filter Types with Range Support
export interface FilterState {
  zoning: string[]
  economic: string[]
  opportunityScore: number
  economicIndicator?: 'gdp-growth' | 'property-appreciation'
  economicOverlayEnabled: boolean
  propertyTypes: string[]
  propertyListingsEnabled: boolean
  
  // Enhanced filter ranges
  priceRange?: { min: number; max: number }
  capRateRange?: { min: number; max: number }
  cashFlowRange?: { min: number; max: number }
  squareFootageRange?: { min: number; max: number }
  yearBuiltRange?: { min: number; max: number }
  occupancyRange?: { min: number; max: number }
  
  // Additional filters
  amenities?: string[]
  riskLevels?: string[]
  dateFilters?: {
    listedAfter?: Date
    listedBefore?: Date
  }
}

// AI Report Types
export interface AIReport {
  id: string
  region: string
  coordinates: Coordinates[]
  summary: string
  developmentOpportunities: string[]
  permitRequirements: string[]
  governingBodies: string[]
  estimatedCost: number
  estimatedROI: number
  risks: string[]
  recommendations: string[]
  generatedAt: string
}

// Alert Types
export interface Alert {
  id: string
  userId: string
  name: string
  region: string
  coordinates: Coordinates[]
  filters: FilterState
  isActive: boolean
  createdAt: string
  lastTriggered?: string
}

// API Response Types
export interface APIResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Map Layer Types
export interface MapLayer {
  id: string
  name: string
  type: 'zoning' | 'economic' | 'property' | 'opportunity'
  visible: boolean
  opacity: number
  data: any
}

// Property listing types
export interface CommercialProperty {
  id: string
  address: string
  coordinates: { lat: number; lng: number }
  price: number
  size: number
  type: 'commercial' | 'industrial' | 'multifamily'
  subtype?: string
  listingType: 'sale' | 'lease'
  pricePerSF: number
  description: string
  broker: string
  listingDate: string
  features: string[]
  country?: string
  city?: string
  state?: string
}

// Enhanced Feed Item with Portfolio Integration
export interface FeedItem {
  id: string
  type: 'address' | 'property' | 'analysis' | 'research' | 'report'
  title: string
  content: string
  location?: {
    lat: number
    lng: number
    zoom: number
  }
  timestamp?: Date
  url?: string
  selected?: boolean
  listingLinks?: {
    loopnet?: string
    zillow?: string
    costar?: string
    crexi?: string
  }
  marketData?: {
    averagePrice?: number
    pricePerSqft?: number
    capRate?: number
    occupancyRate?: number
    vacancy?: number
  }
  // Portfolio-specific fields
  portfolioStatus?: 'owned' | 'watching' | 'analyzing' | 'target' | 'avoided'
  investmentMetrics?: {
    cashFlow?: number
    totalReturn?: number
    riskScore?: number
  }
}

export interface FeedTab {
  id: string
  title: string
  location?: {
    lat: number
    lng: number
    zoom: number
  }
  items: FeedItem[]
  isActive: boolean
  type: 'research' | 'property' | 'report'
}

export interface PropertyResearch {
  id: string
  address: string
  coordinates: { lat: number; lng: number }
  listingLinks: {
    loopnet?: string
    zillow?: string
    costar?: string
    crexi?: string
  }
  marketData: {
    averagePrice?: number
    pricePerSqft?: number
    capRate?: number
    occupancyRate?: number
    demographics?: any
  }
  webSearchResults: {
    title: string
    url: string
    snippet: string
    source: string
  }[]
  gptAnalysis?: string
  lastUpdated: Date
}

export interface ReportProperty {
  id: string
  address: string
  type: PropertyType
  price: number
  size: number
  coordinates: { lat: number; lng: number }
  selected: boolean
  research?: PropertyResearch
}

export interface PropertyReport {
  id: string
  title: string
  properties: ReportProperty[]
  analysis: {
    summary: string
    recommendations: string[]
    charts: {
      type: 'bar' | 'line' | 'pie'
      title: string
      data: any
    }[]
  }
  createdAt: Date
  lastModified: Date
}

// Chat & AI Types
export interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  actions?: ChatAction[]
  data?: any
}

export interface ChatAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  variant?: 'primary' | 'secondary' | 'success' | 'warning'
}

// Portfolio Types (Enhanced)
export interface PortfolioMetrics {
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

// Market Context Types
export interface MarketContext {
  interestRates: {
    federalFunds: number
    treasury10Year: number
    mortgage30Year: number
  }
  marketSentiment: {
    score: number
    description: string
  }
  economicIndicators: {
    gdpGrowth: number
    unemployment: number
    inflation: number
  }
  constructionCosts: {
    index: number
    changeYoY: number
  }
}