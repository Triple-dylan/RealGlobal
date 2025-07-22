// Core Data Services
export { economicDataService } from './economicData'
export { propertyDataService } from './propertyData'
export { freePropertyDataService } from './freePropertyData'
export { enhancedPropertyDataService } from './enhancedPropertyData'
export { financialMarketDataService } from './financialMarketData'
export { marketAnalysisService } from './marketAnalysis'

// AI Services
export { propertyRecommendationEngine } from './ai/property-recommendation-engine'
export { contextualDialogueService } from './dialogue/contextual-dialogue'
export { openaiService } from './openai'

// Commercial Services
export { commercialAPI } from './commercial/commercial-api'
export { commercialZonesService } from './commercial/commercial-zones-service'

// Property Services
export { propertySearchService } from './property/property-search'
export { propertyResearchService } from './propertyResearch'

// Infrastructure
export { supabase as supabaseClient } from './supabase'
export { apiClient } from './api'

// Type exports
export type { 
  PropertyListing, 
  PropertyFilters
} from './propertyData'

export type { 
  FreePropertyListing
} from './freePropertyData'

export type { 
  EnhancedPropertyListing,
  DataSourceConfig 
} from './enhancedPropertyData'

export type { 
  InterestRateData,
  REITPerformanceData,
  EconomicIndicatorData,
  ConstructionCostData,
  MarketBenchmarkData 
} from './financialMarketData'

export type { 
  EconomicIndicator,
  CountryEconomicData 
} from './economicData'