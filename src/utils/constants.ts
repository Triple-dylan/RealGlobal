// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [-74.006, 40.7128], // New York City
  DEFAULT_ZOOM: 10,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  STYLE_URL: 'mapbox://styles/dylandahl/cmcl05lb8002k01sqc22u66wy'
}

// API Endpoints
export const API_ENDPOINTS = {
  ZONING_DATA: '/api/zoning',
  ECONOMIC_DATA: '/api/economic',
  PROPERTY_LISTINGS: '/api/properties',
  AI_REPORTS: '/api/reports',
  ALERTS: '/api/alerts'
}

// Filter Options
export const ZONING_TYPES = {
  OPPORTUNITY_ZONES: 'opportunity-zones',
  AFFORDABLE_HOUSING: 'affordable-housing',
  INDUSTRIAL: 'industrial',
  MULTIFAMILY: 'multifamily',
  COMMERCIAL: 'commercial',
  MIXED_USE: 'mixed-use'
} as const

export const ECONOMIC_INDICATORS = {
  GDP_GROWTH: 'gdp-growth',
  PROPERTY_APPRECIATION: 'property-appreciation',
  BUILDER_ACCESSIBILITY: 'builder-accessibility',
  INTERNATIONAL_ACCESS: 'international-access'
} as const

// Color Schemes for Map Layers
export const LAYER_COLORS = {
  opportunity: {
    low: '#fee5d9',
    medium: '#fcae91',
    high: '#fb6a4a',
    veryHigh: '#de2d26'
  },
  zoning: {
    opportunity: '#2ecc71',
    affordable: '#3498db',
    industrial: '#e67e22',
    multifamily: '#9b59b6',
    commercial: '#f1c40f',
    mixed: '#1abc9c'
  },
  economic: {
    low: '#d5e8d4',
    medium: '#97d077',
    high: '#5cb85c',
    veryHigh: '#449d44'
  }
}

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
}

// Map Layer Configuration
export const LAYER_CONFIG = {
  PROPERTY_PIN_SIZE: 8,
  ZONING_OPACITY: 0.6,
  ECONOMIC_OPACITY: 0.4,
  OPPORTUNITY_OPACITY: 0.7
} 