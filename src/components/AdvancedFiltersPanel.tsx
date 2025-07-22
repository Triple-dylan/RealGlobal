import React, { useState, useEffect, useCallback } from 'react'
import { 
  Filter, MapPin, TrendingUp, Building2, Home, Store, ChevronDown, ChevronUp, 
  Users, FileText, DollarSign, Calendar, X, Plus, Sliders, Search, Star,
  Clock, Target, Zap, Save, Download, Upload, Settings, Eye, EyeOff
} from 'lucide-react'
import { useAnimations, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'
import { FilterState } from '../types'

interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
}

interface RangeFilter {
  min: number
  max: number
  step: number
  unit: string
  format?: (value: number) => string
}

interface SavedFilterPreset {
  id: string
  name: string
  filters: FilterState
  createdAt: Date
  usageCount: number
  isPublic?: boolean
}

interface AdvancedFiltersPanelProps {
  onFiltersChange?: (filters: FilterState) => void
  initialFilters?: FilterState
  resultCount?: number
  loading?: boolean
  onSavePreset?: (name: string, filters: FilterState) => void
  onLoadPreset?: (preset: SavedFilterPreset) => void
  savedPresets?: SavedFilterPreset[]
}

const AdvancedFiltersPanel: React.FC<AdvancedFiltersPanelProps> = ({
  onFiltersChange,
  initialFilters,
  resultCount = 0,
  loading = false,
  onSavePreset,
  onLoadPreset,
  savedPresets = []
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    zoning: [],
    economic: [],
    opportunityScore: 50,
    economicIndicator: 'gdp-growth' as const,
    economicOverlayEnabled: false,
    propertyTypes: [],
    propertyListingsEnabled: false
  })
  
  const [isMinimized, setIsMinimized] = useState(false)
  const [activeFilterGroup, setActiveFilterGroup] = useState<string | null>('location')
  const [showPresets, setShowPresets] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Range filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000000 })
  const [capRateRange, setCapRateRange] = useState({ min: 0, max: 15 })
  const [cashFlowRange, setCashFlowRange] = useState({ min: -2000, max: 10000 })
  const [squareFootageRange, setSquareFootageRange] = useState({ min: 0, max: 50000 })
  const [yearBuiltRange, setYearBuiltRange] = useState({ min: 1900, max: 2024 })
  const [occupancyRange, setOccupancyRange] = useState({ min: 0, max: 100 })
  
  // Multi-select states with chips
  const [selectedZones, setSelectedZones] = useState<string[]>([])
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([])
  
  useAnimations()
  useGlassEffects()

  // Filter options
  const zoningOptions: FilterOption[] = [
    { value: 'opportunity-zones', label: 'Opportunity Zones', icon: <MapPin className="w-4 h-4" />, count: 45 },
    { value: 'affordable-housing', label: 'Tax Credit Zones', icon: <Home className="w-4 h-4" />, count: 23 },
    { value: 'commercial-zones', label: 'Commercial Zones', icon: <Store className="w-4 h-4" />, count: 67 },
    { value: 'multifamily-zones', label: 'Multifamily Zones', icon: <Building2 className="w-4 h-4" />, count: 34 },
    { value: 'industrial-zones', label: 'Industrial Zones', icon: <Building2 className="w-4 h-4" />, count: 19 },
    { value: 'mixed-use-zones', label: 'Mixed Use Zones', icon: <Building2 className="w-4 h-4" />, count: 28 }
  ]

  const propertyTypeOptions: FilterOption[] = [
    { value: 'residential', label: 'Residential', icon: <Home className="w-4 h-4" />, count: 156 },
    { value: 'commercial', label: 'Commercial', icon: <Store className="w-4 h-4" />, count: 89 },
    { value: 'multifamily', label: 'Multifamily', icon: <Building2 className="w-4 h-4" />, count: 78 },
    { value: 'industrial', label: 'Industrial', icon: <Building2 className="w-4 h-4" />, count: 34 },
    { value: 'office', label: 'Office', icon: <Building2 className="w-4 h-4" />, count: 67 },
    { value: 'retail', label: 'Retail', icon: <Store className="w-4 h-4" />, count: 45 },
    { value: 'warehouse', label: 'Warehouse', icon: <Building2 className="w-4 h-4" />, count: 23 },
    { value: 'land', label: 'Development Land', icon: <MapPin className="w-4 h-4" />, count: 12 }
  ]

  const amenityOptions: FilterOption[] = [
    { value: 'parking', label: 'Parking Available', count: 234 },
    { value: 'elevator', label: 'Elevator Access', count: 156 },
    { value: 'ac', label: 'Air Conditioning', count: 189 },
    { value: 'security', label: 'Security System', count: 145 },
    { value: 'gym', label: 'Fitness Center', count: 67 },
    { value: 'pool', label: 'Swimming Pool', count: 89 },
    { value: 'balcony', label: 'Balcony/Terrace', count: 123 },
    { value: 'laundry', label: 'Laundry Facilities', count: 178 }
  ]

  const riskLevelOptions: FilterOption[] = [
    { value: 'low', label: 'Low Risk (0-30)', count: 89 },
    { value: 'medium', label: 'Medium Risk (31-60)', count: 156 },
    { value: 'high', label: 'High Risk (61-100)', count: 45 }
  ]

  // Range filter configurations
  const rangeFilters = {
    price: {
      min: 0,
      max: 10000000,
      step: 50000,
      unit: '$',
      format: (value: number) => `$${(value / 1000000).toFixed(1)}M`
    },
    capRate: {
      min: 0,
      max: 20,
      step: 0.1,
      unit: '%',
      format: (value: number) => `${value.toFixed(1)}%`
    },
    cashFlow: {
      min: -5000,
      max: 20000,
      step: 100,
      unit: '$',
      format: (value: number) => `$${value.toLocaleString()}`
    },
    squareFootage: {
      min: 0,
      max: 100000,
      step: 500,
      unit: 'sq ft',
      format: (value: number) => `${(value / 1000).toFixed(0)}K sq ft`
    },
    yearBuilt: {
      min: 1900,
      max: 2024,
      step: 1,
      unit: 'year',
      format: (value: number) => value.toString()
    },
    occupancy: {
      min: 0,
      max: 100,
      step: 1,
      unit: '%',
      format: (value: number) => `${value}%`
    }
  }

  // Filter groups
  const filterGroups = [
    { 
      id: 'location', 
      label: 'Location & Zoning', 
      icon: <MapPin className="w-4 h-4" />,
      count: selectedZones.length
    },
    { 
      id: 'property', 
      label: 'Property Type', 
      icon: <Building2 className="w-4 h-4" />,
      count: selectedPropertyTypes.length
    },
    { 
      id: 'financial', 
      label: 'Financial Metrics', 
      icon: <DollarSign className="w-4 h-4" />,
      count: 0 // Will be calculated based on active ranges
    },
    { 
      id: 'features', 
      label: 'Features & Amenities', 
      icon: <Star className="w-4 h-4" />,
      count: selectedAmenities.length
    },
    { 
      id: 'risk', 
      label: 'Risk & Performance', 
      icon: <Target className="w-4 h-4" />,
      count: selectedRiskLevels.length
    },
    { 
      id: 'timeline', 
      label: 'Timeline & Dates', 
      icon: <Calendar className="w-4 h-4" />,
      count: 0
    }
  ]

  // Debounced filter updates
  const debouncedFiltersChange = useCallback(
    (newFilters: FilterState) => {
      onFiltersChange?.(newFilters)
    },
    [onFiltersChange]
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedFiltersChange({
        ...filters,
        zoning: selectedZones,
        propertyTypes: selectedPropertyTypes,
        // Add range filters to the filter state
        priceRange,
        capRateRange,
        cashFlowRange,
        squareFootageRange,
        yearBuiltRange,
        occupancyRange,
        amenities: selectedAmenities,
        riskLevels: selectedRiskLevels
      } as any)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [selectedZones, selectedPropertyTypes, selectedAmenities, selectedRiskLevels, 
      priceRange, capRateRange, cashFlowRange, squareFootageRange, yearBuiltRange, occupancyRange])

  // Chip component for multi-select filters
  const FilterChip: React.FC<{ 
    label: string
    onRemove: () => void
    icon?: React.ReactNode
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }> = ({ label, onRemove, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      green: 'bg-green-500/20 text-green-300 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    }

    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${colorClasses[color]} ${animationClasses.slideUp}`}>
        {icon}
        <span>{label}</span>
        <button
          onClick={onRemove}
          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // Range slider component
  const RangeSlider: React.FC<{
    label: string
    value: { min: number; max: number }
    onChange: (value: { min: number; max: number }) => void
    config: RangeFilter
  }> = ({ label, value, onChange, config }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>{label}</span>
          <span className={`text-xs ${sleekStyles.text.secondary}`}>
            {config.format ? config.format(value.min) : `${value.min}${config.unit}`} - {config.format ? config.format(value.max) : `${value.max}${config.unit}`}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value.min}
            onChange={(e) => onChange({ ...value, min: Number(e.target.value) })}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-thumb"
          />
          <input
            type="range"
            min={config.min}
            max={config.max}
            step={config.step}
            value={value.max}
            onChange={(e) => onChange({ ...value, max: Number(e.target.value) })}
            className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer range-slider-thumb"
          />
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div 
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{
                left: `${((value.min - config.min) / (config.max - config.min)) * 100}%`,
                width: `${((value.max - value.min) / (config.max - config.min)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  // Quick preset buttons
  const quickPresets = [
    { name: 'High Cash Flow', filters: { capRateRange: { min: 8, max: 20 }, cashFlowRange: { min: 2000, max: 20000 } } },
    { name: 'Low Risk', filters: { riskLevels: ['low'], occupancyRange: { min: 90, max: 100 } } },
    { name: 'Value Add', filters: { yearBuiltRange: { min: 1960, max: 1990 }, priceRange: { min: 200000, max: 800000 } } },
    { name: 'New Construction', filters: { yearBuiltRange: { min: 2020, max: 2024 } } }
  ]

  const clearAllFilters = () => {
    setSelectedZones([])
    setSelectedPropertyTypes([])
    setSelectedAmenities([])
    setSelectedRiskLevels([])
    setPriceRange({ min: 0, max: 5000000 })
    setCapRateRange({ min: 0, max: 15 })
    setCashFlowRange({ min: -2000, max: 10000 })
    setSquareFootageRange({ min: 0, max: 50000 })
    setYearBuiltRange({ min: 1900, max: 2024 })
    setOccupancyRange({ min: 0, max: 100 })
  }

  const getTotalActiveFilters = () => {
    return selectedZones.length + selectedPropertyTypes.length + selectedAmenities.length + selectedRiskLevels.length
  }

  if (isMinimized) {
    return (
      <div className={`fixed top-[74px] left-4 z-40 ${sleekStyles.glassMorphism.primary} rounded-xl shadow-lg ${animationClasses.slideUp}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Filter className="w-4 h-4 text-blue-500" />
          <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>
            Filters {getTotalActiveFilters() > 0 && `(${getTotalActiveFilters()})`}
          </span>
          {resultCount > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${sleekStyles.status.info} ${sleekStyles.text.accent}`}>
              {resultCount} results
            </span>
          )}
          <GlassButton
            onClick={() => setIsMinimized(false)}
            variant="ghost"
            size="sm"
            icon={<ChevronDown className="w-4 h-4" />}
          >
            <ChevronDown className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed top-[74px] left-4 z-40 ${sleekStyles.glassMorphism.primary} rounded-xl shadow-xl ${animationClasses.slideRight}`} style={{ width: 320, maxHeight: 'calc(100vh - 100px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-500" />
          <h2 className={`font-medium ${sleekStyles.text.primary} text-sm`}>Advanced Filters</h2>
          {getTotalActiveFilters() > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${sleekStyles.status.info} ${sleekStyles.text.accent}`}>
              {getTotalActiveFilters()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <GlassButton
            onClick={() => setShowPresets(!showPresets)}
            variant="ghost"
            size="sm"
            icon={<Save className="w-4 h-4" />}
          >
            <Save className="w-4 h-4" />
          </GlassButton>
          <GlassButton
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            icon={<ChevronUp className="w-4 h-4" />}
          >
            <ChevronUp className="w-4 h-4" />
          </GlassButton>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/20">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${sleekStyles.text.muted}`} />
          <input
            type="text"
            placeholder="Search locations, property types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg ${sleekStyles.glassMorphism.secondary} border border-white/20 ${sleekStyles.text.primary} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>
      </div>

      {/* Result Count & Quick Actions */}
      <div className="px-4 py-2 border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className={`text-xs ${sleekStyles.text.secondary}`}>Searching...</span>
            </div>
          ) : (
            <span className={`text-xs ${sleekStyles.text.secondary}`}>
              {resultCount.toLocaleString()} results found
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-xs px-2 py-1 rounded ${showAdvanced ? sleekStyles.status.info : sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary}`}
          >
            {showAdvanced ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          {getTotalActiveFilters() > 0 && (
            <button
              onClick={clearAllFilters}
              className={`text-xs px-2 py-1 rounded ${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary} hover:${sleekStyles.status.warning}`}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      {showPresets && (
        <div className="p-4 border-b border-white/20">
          <div className="space-y-2">
            <h3 className={`text-xs font-medium ${sleekStyles.text.secondary} mb-2`}>Quick Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickPresets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => {
                    // Apply preset filters
                    if (preset.filters.capRateRange) setCapRateRange(preset.filters.capRateRange as any)
                    if (preset.filters.cashFlowRange) setCashFlowRange(preset.filters.cashFlowRange as any)
                    if (preset.filters.priceRange) setPriceRange(preset.filters.priceRange as any)
                    if (preset.filters.yearBuiltRange) setYearBuiltRange(preset.filters.yearBuiltRange as any)
                    if (preset.filters.riskLevels) setSelectedRiskLevels(preset.filters.riskLevels as any)
                    if (preset.filters.occupancyRange) setOccupancyRange(preset.filters.occupancyRange as any)
                  }}
                  className={`text-xs p-2 rounded-lg ${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary} hover:${sleekStyles.status.info} transition-all`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {getTotalActiveFilters() > 0 && (
        <div className="p-4 border-b border-white/20">
          <div className="flex flex-wrap gap-2">
            {selectedZones.map(zone => (
              <FilterChip
                key={zone}
                label={zoningOptions.find(z => z.value === zone)?.label || zone}
                onRemove={() => setSelectedZones(prev => prev.filter(z => z !== zone))}
                color="blue"
              />
            ))}
            {selectedPropertyTypes.map(type => (
              <FilterChip
                key={type}
                label={propertyTypeOptions.find(t => t.value === type)?.label || type}
                onRemove={() => setSelectedPropertyTypes(prev => prev.filter(t => t !== type))}
                color="green"
              />
            ))}
            {selectedAmenities.map(amenity => (
              <FilterChip
                key={amenity}
                label={amenityOptions.find(a => a.value === amenity)?.label || amenity}
                onRemove={() => setSelectedAmenities(prev => prev.filter(a => a !== amenity))}
                color="purple"
              />
            ))}
            {selectedRiskLevels.map(risk => (
              <FilterChip
                key={risk}
                label={riskLevelOptions.find(r => r.value === risk)?.label || risk}
                onRemove={() => setSelectedRiskLevels(prev => prev.filter(r => r !== risk))}
                color="orange"
              />
            ))}
          </div>
        </div>
      )}

      {/* Filter Groups */}
      <div className="overflow-y-auto flex-1">
        <div className="p-4 space-y-3">
          {filterGroups.map(group => (
            <div key={group.id} className="space-y-2">
              <button
                onClick={() => setActiveFilterGroup(activeFilterGroup === group.id ? null : group.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg border ${sleekStyles.transitions.smooth} ${sleekStyles.hover.lift} ${
                  activeFilterGroup === group.id 
                    ? `${sleekStyles.status.info} ${sleekStyles.text.accent}` 
                    : `${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.primary} hover:${sleekStyles.glassMorphism.primary}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${activeFilterGroup === group.id ? 'text-blue-500' : 'text-gray-500'}`}>
                    {group.icon}
                  </div>
                  <span className="text-sm font-medium">{group.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {group.count > 0 && (
                    <span className={`${sleekStyles.status.info} text-xs px-2 py-1 rounded-full font-medium`}>
                      {group.count}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 ${sleekStyles.text.muted} transition-transform ${activeFilterGroup === group.id ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {/* Filter Group Content */}
              {activeFilterGroup === group.id && (
                <div className={`pl-4 pr-2 space-y-3 border-l border-white/20 ${animationClasses.slideDown}`}>
                  
                  {/* Location & Zoning */}
                  {group.id === 'location' && (
                    <div className="space-y-2">
                      {zoningOptions.map(option => (
                        <label key={option.value} className={`flex items-center justify-between p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedZones.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedZones(prev => [...prev, option.value])
                                } else {
                                  setSelectedZones(prev => prev.filter(z => z !== option.value))
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {option.icon}
                            <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                          </div>
                          {option.count && (
                            <span className={`text-xs ${sleekStyles.text.muted}`}>{option.count}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Property Types */}
                  {group.id === 'property' && (
                    <div className="space-y-2">
                      {propertyTypeOptions.map(option => (
                        <label key={option.value} className={`flex items-center justify-between p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedPropertyTypes.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPropertyTypes(prev => [...prev, option.value])
                                } else {
                                  setSelectedPropertyTypes(prev => prev.filter(t => t !== option.value))
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {option.icon}
                            <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                          </div>
                          {option.count && (
                            <span className={`text-xs ${sleekStyles.text.muted}`}>{option.count}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Financial Metrics */}
                  {group.id === 'financial' && (
                    <div className="space-y-4">
                      <RangeSlider
                        label="Price Range"
                        value={priceRange}
                        onChange={setPriceRange}
                        config={rangeFilters.price}
                      />
                      <RangeSlider
                        label="Cap Rate"
                        value={capRateRange}
                        onChange={setCapRateRange}
                        config={rangeFilters.capRate}
                      />
                      <RangeSlider
                        label="Monthly Cash Flow"
                        value={cashFlowRange}
                        onChange={setCashFlowRange}
                        config={rangeFilters.cashFlow}
                      />
                      {showAdvanced && (
                        <>
                          <RangeSlider
                            label="Square Footage"
                            value={squareFootageRange}
                            onChange={setSquareFootageRange}
                            config={rangeFilters.squareFootage}
                          />
                          <RangeSlider
                            label="Occupancy Rate"
                            value={occupancyRange}
                            onChange={setOccupancyRange}
                            config={rangeFilters.occupancy}
                          />
                        </>
                      )}
                    </div>
                  )}

                  {/* Features & Amenities */}
                  {group.id === 'features' && (
                    <div className="space-y-2">
                      {amenityOptions.map(option => (
                        <label key={option.value} className={`flex items-center justify-between p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedAmenities.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAmenities(prev => [...prev, option.value])
                                } else {
                                  setSelectedAmenities(prev => prev.filter(a => a !== option.value))
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                          </div>
                          {option.count && (
                            <span className={`text-xs ${sleekStyles.text.muted}`}>{option.count}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Risk & Performance */}
                  {group.id === 'risk' && (
                    <div className="space-y-2">
                      {riskLevelOptions.map(option => (
                        <label key={option.value} className={`flex items-center justify-between p-2 hover:${sleekStyles.glassMorphism.secondary} rounded cursor-pointer ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale}`}>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedRiskLevels.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRiskLevels(prev => [...prev, option.value])
                                } else {
                                  setSelectedRiskLevels(prev => prev.filter(r => r !== option.value))
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${sleekStyles.text.primary}`}>{option.label}</span>
                          </div>
                          {option.count && (
                            <span className={`text-xs ${sleekStyles.text.muted}`}>{option.count}</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Timeline & Dates */}
                  {group.id === 'timeline' && (
                    <div className="space-y-4">
                      <RangeSlider
                        label="Year Built"
                        value={yearBuiltRange}
                        onChange={setYearBuiltRange}
                        config={rangeFilters.yearBuilt}
                      />
                      
                      <div className="space-y-2">
                        <label className={`text-sm font-medium ${sleekStyles.text.primary}`}>Listed Date</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className={`px-3 py-2 rounded-lg ${sleekStyles.glassMorphism.secondary} border border-white/20 ${sleekStyles.text.primary} text-sm`}
                          />
                          <input
                            type="date"
                            className={`px-3 py-2 rounded-lg ${sleekStyles.glassMorphism.secondary} border border-white/20 ${sleekStyles.text.primary} text-sm`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Preset Section */}
      {showPresets && getTotalActiveFilters() > 0 && (
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg ${sleekStyles.glassMorphism.secondary} border border-white/20 ${sleekStyles.text.primary} placeholder-gray-400 text-sm`}
            />
            <GlassButton
              onClick={() => {
                if (presetName.trim() && onSavePreset) {
                  onSavePreset(presetName, filters)
                  setPresetName('')
                }
              }}
              variant="primary"
              size="sm"
              icon={<Save className="w-4 h-4" />}
            >
              Save
            </GlassButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFiltersPanel