import React, { useState, useRef, useEffect } from 'react'

import { Filter, MapPin, TrendingUp, Building2, Home, Factory, Store, Pin, PinOff, ChevronDown, ChevronUp, ZoomIn, Loader2, Users, FileText, DollarSign, Globe, Database, Search } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
}

const zoningOptions: FilterOption[] = [
  { value: 'opportunity-zones', label: 'Opportunity Zones', icon: <MapPin className="w-4 h-4" /> },
  { value: 'affordable-housing', label: 'Tax Credit Zones', icon: <Home className="w-4 h-4" /> },
  { value: 'commercial-zones', label: 'Commercial Zones', icon: <Store className="w-4 h-4" /> },
  { value: 'multifamily-zones', label: 'Multifamily Zones', icon: <Building2 className="w-4 h-4" /> },
]

// Real estate development indicators - Updated for real data sources
const economicOptions: FilterOption[] = [
  { value: 'employment-growth', label: 'Employment Growth', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'population-growth', label: 'Population Growth', icon: <Users className="w-4 h-4" /> },
  { value: 'permit-activity', label: 'Building Permit Activity', icon: <FileText className="w-4 h-4" /> },
  { value: 'construction-costs', label: 'Construction Cost Index', icon: <DollarSign className="w-4 h-4" /> },
]

// Property types for listings
const propertyTypeOptions: FilterOption[] = [
  { value: 'commercial', label: 'Commercial', icon: <Store className="w-4 h-4" /> },
  { value: 'industrial', label: 'Industrial', icon: <Factory className="w-4 h-4" /> },
  { value: 'multifamily', label: 'Multifamily', icon: <Building2 className="w-4 h-4" /> },
]

const economicIndicatorOptions = [
  { value: 'gdp-growth', label: 'GDP Growth' },
  { value: 'property-appreciation', label: 'Property Appreciation' }
]

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

// GDP Growth color scale - matches EconomicOverlay.tsx GDP_COLOR_SCALE
const GDP_GROWTH_COLOR_SCALE = [
  { label: 'Decline', range: '< 0%', color: 'rgba(255, 80, 120, 0.7)' }, // bright red for negative
  { label: 'Flat', range: '0–0.5%', color: 'rgba(60, 60, 80, 0.3)' }, // dark gray for near-zero
  { label: 'Low', range: '0.5–2.5%', color: 'rgba(100, 200, 255, 0.5)' }, // bright cyan for low
  { label: 'Medium', range: '2.5–5%', color: 'rgba(80, 160, 255, 0.6)' }, // space blue for medium
  { label: 'High', range: '> 5%', color: 'rgba(60, 120, 255, 0.8)' } // deep space blue for high
]

// Property Appreciation color scale - matches EconomicOverlay.tsx APPRECIATION_COLOR_SCALE  
const PROPERTY_APPRECIATION_COLOR_SCALE = [
  { label: 'Decline', range: '< 0%', color: 'rgba(255, 60, 80, 0.7)' }, // bright red for depreciation
  { label: 'Flat', range: '0–1%', color: 'rgba(80, 80, 100, 0.3)' }, // subtle gray for minimal
  { label: 'Low', range: '1–3%', color: 'rgba(255, 200, 100, 0.5)' }, // warm gold for low
  { label: 'Medium', range: '3–6%', color: 'rgba(255, 160, 60, 0.6)' }, // bright orange for medium
  { label: 'High', range: '> 6%', color: 'rgba(255, 120, 40, 0.8)' } // intense orange for high
]

// Population Growth color scale 
const POPULATION_GROWTH_COLOR_SCALE = [
  { label: 'Decline', range: '< 0%', color: 'rgba(239, 68, 68, 0.25)' }, // red
  { label: 'Flat', range: '0–0.5%', color: 'rgba(0,0,0,0)' }, // clear
  { label: 'Low', range: '0.5–1%', color: 'rgba(34, 197, 94, 0.18)' }, // light green
  { label: 'Medium', range: '1–2%', color: 'rgba(34, 197, 94, 0.28)' }, // green
  { label: 'High', range: '> 2%', color: 'rgba(34, 197, 94, 0.4)' } // strong green
]

// Employment Growth color scale
const EMPLOYMENT_GROWTH_COLOR_SCALE = [
  { label: 'Decline', range: '< 0%', color: 'rgba(239, 68, 68, 0.25)' }, // red
  { label: 'Flat', range: '0–1%', color: 'rgba(0,0,0,0)' }, // clear
  { label: 'Low', range: '1–2%', color: 'rgba(59, 130, 246, 0.18)' }, // light blue
  { label: 'Medium', range: '2–3%', color: 'rgba(59, 130, 246, 0.28)' }, // blue
  { label: 'High', range: '> 3%', color: 'rgba(59, 130, 246, 0.4)' } // strong blue
]

// Transit Investment color scale
const TRANSIT_INVESTMENT_COLOR_SCALE = [
  { label: 'None', range: '$0', color: 'rgba(0,0,0,0)' }, // clear
  { label: 'Low', range: '< $500M', color: 'rgba(168, 85, 247, 0.18)' }, // light purple
  { label: 'Medium', range: '$500M–$1B', color: 'rgba(168, 85, 247, 0.28)' }, // purple
  { label: 'High', range: '$1B–$2B', color: 'rgba(168, 85, 247, 0.4)' }, // strong purple
  { label: 'Very High', range: '> $2B', color: 'rgba(168, 85, 247, 0.5)' } // very strong purple
]

// Building Permits color scale
const PERMIT_ACTIVITY_COLOR_SCALE = [
  { label: 'Low', range: '< 10K', color: 'rgba(0,0,0,0)' }, // clear
  { label: 'Medium', range: '10K–20K', color: 'rgba(249, 115, 22, 0.18)' }, // light orange
  { label: 'High', range: '20K–30K', color: 'rgba(249, 115, 22, 0.28)' }, // orange
  { label: 'Very High', range: '> 30K', color: 'rgba(249, 115, 22, 0.4)' } // strong orange
]

// Tax credit zones color scale (QCT/DDA polygons)
const AFFORDABLE_HOUSING_ZONES_COLOR_SCALE = [
  { 
    label: 'QCT', 
    fullName: 'Qualified Census Tracts', 
    description: 'Tax credit boost zones',
    type: 'QCT', 
    color: 'rgba(59, 130, 246, 0.4)', 
    borderColor: 'rgba(59, 130, 246, 1.0)' 
  },
  { 
    label: 'DDA', 
    fullName: 'Difficult Development Areas',
    description: 'High-cost development zones', 
    type: 'DDA', 
    color: 'rgba(239, 68, 68, 0.4)', 
    borderColor: 'rgba(239, 68, 68, 1.0)' 
  },
]



import { FilterState } from '../types'

interface FiltersPanelProps {
  onFiltersChange?: (filters: FilterState) => void
  initialFilters?: FilterState
  map?: any // For zoom functionality
  loading?: boolean
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onFiltersChange, initialFilters, map, loading }) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    zoning: [],
    economic: [],
    opportunityScore: 50,
    economicIndicator: 'gdp-growth' as const,
    economicOverlayEnabled: false,
    propertyTypes: ['commercial', 'industrial', 'multifamily'],
    propertyListingsEnabled: false
  })
  const [position, setPosition] = useState({ x: 19, y: 35 })
  const [size, setSize] = useState({ width: 160, height: undefined })
  const [darkMode, setDarkMode] = useState(true)
  const dragRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // New state for enhancements
  const [isPinned, setIsPinned] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    presets: true,
    economic: false,
    zoning: false,
    economicFactors: true
  })
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const onDrag = (e: MouseEvent) => {
      if (!dragging || isPinned) return
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
    }
    const onDragEnd = () => setDragging(false)
    if (dragging && !isPinned) {
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('mouseup', onDragEnd)
    }
    return () => {
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('mouseup', onDragEnd)
    }
  }, [dragging, dragOffset, isPinned])

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const handleOpportunityScoreChange = (value: number) => {
    const newFilters = { ...filters, opportunityScore: value }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleEconomicIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = { ...filters, economicIndicator: e.target.value as 'gdp-growth' | 'property-appreciation' }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleEconomicOverlayToggle = () => {
    const newFilters = { ...filters, economicOverlayEnabled: !filters.economicOverlayEnabled }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }



  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    setFilters(preset.filters)
    onFiltersChange?.(preset.filters)
  }

  const zoomToSelectedZones = () => {
    if (!map || filters.zoning.length === 0) return
    // This would need to be implemented based on your map library
    // For now, we'll just log the action
    console.log('Zooming to selected zones:', filters.zoning)
  }

  const togglePin = () => {
    setIsPinned(!isPinned)
  }

  return (
    <div
      ref={dragRef}
      className="fixed top-[58px] left-4 z-40 bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-2xl flex flex-col"
      style={{ width: 280, maxWidth: 280, fontSize: '15px', marginLeft: 12, padding: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-gray-900 text-sm">Advanced Filters</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsedSections({})}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            title="Expand All"
          >
            Expand
          </button>
        </div>
      </div>
      
      <div className="px-3 py-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Property Data Sources Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection('dataSources')}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2 hover:text-blue-600"
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Property Data Sources
            </div>
            {collapsedSections.dataSources ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          {!collapsedSections.dataSources && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="free-domestic"
                  className="rounded border-gray-300"
                />
                <label htmlFor="free-domestic" className="text-xs text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Free US Properties
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="free-international"
                  className="rounded border-gray-300"
                />
                <label htmlFor="free-international" className="text-xs text-gray-700 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  International Properties
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="osm-buildings"
                  className="rounded border-gray-300"
                />
                <label htmlFor="osm-buildings" className="text-xs text-gray-700 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  OpenStreetMap Buildings
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Zoning Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection('zoning')}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2 hover:text-blue-600"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Zoning & Development
            </div>
            {collapsedSections.zoning ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          {!collapsedSections.zoning && (
            <div className="flex flex-col gap-1">
            {zoningOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleZoningChange(option.value)}
                className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border transition-all duration-150 ${filters.zoning.includes(option.value) ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                style={{ minHeight: 28 }}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Economic Indicators Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection('economic')}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2 hover:text-blue-600"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Economic Indicators
            </div>
            {collapsedSections.economic ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          {!collapsedSections.economic && (
            <div className="flex flex-col gap-1">
              {economicOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleEconomicChange(option.value)}
                  className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium border transition-all duration-150 ${filters.economic.includes(option.value) ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'}`}
                  style={{ minHeight: 28 }}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Property Search Section */}
        <div className="mb-3">
          <button
            onClick={() => toggleSection('propertySearch')}
            className="flex items-center justify-between w-full text-xs font-semibold text-gray-700 mb-2 hover:text-blue-600"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Property Search
            </div>
            {collapsedSections.propertySearch ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          {!collapsedSections.propertySearch && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enable-free-search"
                  className="rounded border-gray-300"
                  checked={filters.propertyListingsEnabled}
                  onChange={(e) => {
                    const newFilters = { ...filters, propertyListingsEnabled: e.target.checked }
                    setFilters(newFilters)
                    onFiltersChange?.(newFilters)
                  }}
                />
                <label htmlFor="enable-free-search" className="text-xs text-gray-700">
                  Enable Free Property Search
                </label>
              </div>
              {filters.propertyListingsEnabled && (
                <div className="space-y-2 pl-6">
                  <div className="text-xs text-gray-500">Search domestic and international properties from free sources</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Apply Button */}
      <div className="px-3 py-2 border-t border-gray-100">
        <button
          className="w-full font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow rounded-lg px-3 py-1 text-sm transition-all"
          style={{ minHeight: 32 }}
          onClick={() => onFiltersChange?.(filters)}
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default FiltersPanel 