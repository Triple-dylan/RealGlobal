import React, { useState } from 'react'

import { Filter, MapPin, TrendingUp, Building2, Home, Store, ChevronDown, ChevronUp, Users, FileText, DollarSign } from 'lucide-react'
import { useAnimations, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'
import { FilterState } from '../types'

interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

const zoningOptions: FilterOption[] = [
  { value: 'opportunity-zones', label: 'Opportunity Zones', icon: <MapPin className={`w-4 h-4 ${animationClasses.pulse}`} /> },
  { value: 'affordable-housing', label: 'Tax Credit Zones', icon: <Home className={`w-4 h-4 ${animationClasses.breathe}`} /> },
  { value: 'commercial-zones', label: 'Commercial Zones', icon: <Store className={`w-4 h-4 ${animationClasses.shimmer}`} /> },
  { value: 'multifamily-zones', label: 'Multifamily Zones', icon: <Building2 className={`w-4 h-4 ${animationClasses.pulse}`} /> },
]

// Real estate development indicators - Updated for real data sources
const economicOptions: FilterOption[] = [
  { value: 'employment-growth', label: 'Employment Growth', icon: <TrendingUp className={`w-4 h-4 ${animationClasses.breathe}`} /> },
  { value: 'population-growth', label: 'Population Growth', icon: <Users className={`w-4 h-4 ${animationClasses.pulse}`} /> },
  { value: 'permit-activity', label: 'Building Permit Activity', icon: <FileText className={`w-4 h-4 ${animationClasses.shimmer}`} /> },
  { value: 'construction-costs', label: 'Construction Cost Index', icon: <DollarSign className={`w-4 h-4 ${animationClasses.breathe}`} /> },
]

// Removed unused options

// Quick Filter Presets - Property listings managed separately now
const FILTER_PRESETS = [
  { 
    name: "🏢 Commercial Focus", 
    filters: { 
      zoning: ['commercial-zones'], 
      economic: ['employment-growth'], 
      opportunityScore: 60, 
      economicIndicator: 'gdp-growth' as const, 
      economicOverlayEnabled: true,
      propertyTypes: ['office', 'retail', 'industrial'], 
      propertyListingsEnabled: true
    }
  },
  { 
    name: "🏠 Multifamily Focus", 
    filters: { 
      zoning: ['multifamily-zones'], 
      economic: ['population-growth'], 
      opportunityScore: 50, 
      economicIndicator: 'property-appreciation' as const, 
      economicOverlayEnabled: true,
      propertyTypes: ['multifamily'], 
      propertyListingsEnabled: true
    }
  },
  { 
    name: "🎯 Opportunity Zones", 
    filters: { 
      zoning: ['opportunity-zones', 'affordable-housing'], 
      economic: [], 
      opportunityScore: 50, 
      economicIndicator: 'gdp-growth' as const, 
      economicOverlayEnabled: false,
      propertyTypes: [], 
      propertyListingsEnabled: false
    }
  },
  { 
    name: "💰 Tax Credit Focus", 
    filters: { 
      zoning: ['affordable-housing'], 
      economic: [], 
      opportunityScore: 50, 
      economicIndicator: 'property-appreciation' as const, 
      economicOverlayEnabled: false,
      propertyTypes: [],
      propertyListingsEnabled: false
    }
  },
  { 
    name: "📊 Economic Analysis", 
    filters: { 
      zoning: ['opportunity-zones'], 
      economic: ['employment-growth', 'permit-activity'], 
      opportunityScore: 50, 
      economicIndicator: 'gdp-growth' as const, 
      economicOverlayEnabled: true,
      propertyTypes: [],
      propertyListingsEnabled: false
    }
  },
  { 
    name: "🧹 Clean Slate", 
    filters: { 
      zoning: [], 
      economic: [], 
      opportunityScore: 50, 
      economicIndicator: 'gdp-growth' as const, 
      economicOverlayEnabled: false,
      propertyTypes: [],
      propertyListingsEnabled: false
    }
  }
]

// Removed unused color scales



interface FiltersPanelProps {
  onFiltersChange?: (filters: FilterState) => void
  initialFilters?: FilterState
  map?: any // For zoom functionality
  loading?: boolean
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onFiltersChange, initialFilters }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    zoning: [],
    economic: [],
    opportunityScore: 50,
    economicIndicator: 'gdp-growth' as const,
    economicOverlayEnabled: false,
    propertyTypes: ['commercial', 'industrial', 'multifamily'],
    propertyListingsEnabled: false
  })
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  // Removed unused state
  // Removed unused state
  
  // Initialize animations and glass effects
  useAnimations()
  useGlassEffects()

  // Simplified filter options for clean UX with enhanced animations
  const quickFilters = [
    { id: 'zones', label: 'Development Zones', icon: <MapPin className={`w-4 h-4 ${animationClasses.pulse}`} />, count: filters.zoning.length },
    { id: 'market', label: 'Market Data', icon: <TrendingUp className={`w-4 h-4 ${animationClasses.breathe}`} />, count: filters.economic.length },
    { id: 'properties', label: 'Property Search', icon: <Building2 className={`w-4 h-4 ${animationClasses.shimmer}`} />, active: filters.propertyListingsEnabled }
  ]

  const handleZoningChange = (value: string) => {
    const newZoning = filters.zoning.includes(value)
      ? filters.zoning.filter(v => v !== value)
      : [...filters.zoning, value]
    
    const newFilters = { ...filters, zoning: newZoning }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleEconomicChange = (value: string) => {
    const newEconomic = filters.economic.includes(value)
      ? filters.economic.filter(v => v !== value)
      : [...filters.economic, value]
    
    const newFilters = { ...filters, economic: newEconomic }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  // Removed unused handlers



  // Removed unused function

  // Removed unused function

  // Removed unused functions

  if (isMinimized) {
    return (
      <div className={`fixed top-[74px] left-4 z-40 ${sleekStyles.glassMorphism.primary} rounded-xl shadow-lg ${animationClasses.slideUp}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Filter className="w-4 h-4 text-blue-500" />
          <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>Filters</span>
          <GlassButton
            onClick={() => setIsMinimized(false)}
            variant="ghost"
            size="sm"
            className={`${animationClasses.hoverScale} ${animationClasses.buttonPress}`}
            icon={<ChevronDown className="w-4 h-4" />}
          >
            Expand
          </GlassButton>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed top-[74px] left-4 z-40 ${sleekStyles.glassMorphism.primary} rounded-xl shadow-xl ${animationClasses.slideRight} ${animationClasses.hoverGlow}`} style={{ width: 220 }}>
      {/* Clean Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          <h2 className={`font-medium ${sleekStyles.text.primary} text-sm`}>Filters</h2>
        </div>
        <GlassButton
          onClick={() => setIsMinimized(true)}
          variant="ghost"
          size="sm"
          className={`${animationClasses.hoverScale} ${animationClasses.buttonPress}`}
          icon={<ChevronUp className="w-4 h-4" />}
        >
          Minimize
        </GlassButton>
      </div>
      
      {/* Streamlined Filter Pills */}
      <div className="p-4 space-y-3">
        {quickFilters.map(filter => (
          <div key={filter.id} className="space-y-2">
            <button
              onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border ${sleekStyles.transitions.smooth} ${sleekStyles.hover.lift} ${animationClasses.hoverFloat} ${animationClasses.clickFeedback} ${
                activeFilter === filter.id 
                  ? `${sleekStyles.status.info} ${sleekStyles.text.accent}` 
                  : `${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary} hover:${sleekStyles.glassMorphism.primary}`
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${activeFilter === filter.id ? 'text-blue-500' : 'text-gray-500'}`}>
                  {filter.icon}
                </div>
                <span className="text-sm font-medium">{filter.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {filter.count !== undefined && filter.count > 0 && (
                  <span className={`${sleekStyles.status.info} text-xs px-2 py-1 rounded-full font-medium`}>
                    {filter.count}
                  </span>
                )}
                {filter.active && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <ChevronDown className={`w-4 h-4 ${sleekStyles.text.muted} ${animationClasses.ultraSmooth} ${activeFilter === filter.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            
            {/* Progressive Disclosure Content */}
            {activeFilter === filter.id && (
              <div className={`pl-4 pr-2 space-y-2 border-l border-white/20 ${animationClasses.slideDown}`}>
                {filter.id === 'zones' && (
                  <div className="space-y-1">
                    {zoningOptions.slice(0, 3).map(option => (
                      <label key={option.value} className={`flex items-center gap-2 p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                        <input
                          type="checkbox"
                          checked={filters.zoning.includes(option.value)}
                          onChange={() => handleZoningChange(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {filter.id === 'market' && (
                  <div className="space-y-1">
                    {economicOptions.slice(0, 3).map(option => (
                      <label key={option.value} className={`flex items-center gap-2 p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                        <input
                          type="checkbox"
                          checked={filters.economic.includes(option.value)}
                          onChange={() => handleEconomicChange(option.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {filter.id === 'properties' && (
                  <div className="space-y-2">
                    <label className={`flex items-center gap-2 p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                      <input
                        type="checkbox"
                        checked={filters.propertyListingsEnabled}
                        onChange={(e) => {
                          const newFilters = { ...filters, propertyListingsEnabled: e.target.checked }
                          setFilters(newFilters)
                          onFiltersChange?.(newFilters)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${sleekStyles.text.primary}`}>Enable Property Search</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default FiltersPanel 