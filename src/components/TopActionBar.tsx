import React from 'react'
import { MapPin, Building2, Factory, Home, Star, PieChart, FileSpreadsheet, BarChart3 } from 'lucide-react'

interface TopActionBarProps {
  propertyListingsEnabled: boolean
  selectedPropertyTypes: string[]
  onPropertyListingsToggle: (enabled: boolean) => void
  onPropertyTypesChange: (types: string[]) => void
  onRecommendationsClick?: () => void
  onPortfolioClick?: () => void
  onExportClick?: () => void
  onAnalysisClick?: () => void
  workspaceItemCount?: number
}

const propertyTypeOptions = [
  { value: 'commercial', label: 'Commercial', icon: Building2, color: 'text-blue-400' },
  { value: 'industrial', label: 'Industrial', icon: Factory, color: 'text-orange-400' },
  { value: 'multifamily', label: 'Multifamily', icon: Home, color: 'text-green-400' }
]

const TopActionBar: React.FC<TopActionBarProps> = ({
  propertyListingsEnabled,
  selectedPropertyTypes,
  onPropertyListingsToggle,
  onPropertyTypesChange,
  onRecommendationsClick,
  onPortfolioClick,
  onExportClick,
  onAnalysisClick,
  workspaceItemCount = 0
}) => {
  const handlePropertyTypeToggle = (type: string) => {
    if (selectedPropertyTypes.includes(type)) {
      onPropertyTypesChange(selectedPropertyTypes.filter(t => t !== type))
    } else {
      onPropertyTypesChange([...selectedPropertyTypes, type])
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200/40 shadow-sm px-4 py-2 flex items-center justify-between gap-4">
      {/* Section headers and labels */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 text-sm bg-white/90 px-2 py-1 rounded shadow-sm">
          Workspace {workspaceItemCount > 0 && `(${workspaceItemCount})`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onRecommendationsClick}
          className="font-medium text-gray-700 bg-white/90 hover:bg-white shadow-lg rounded border border-gray-300 px-3 py-1 flex items-center gap-1"
        >
          <Star className="w-3 h-3" />
          AI Picks
        </button>
        <button 
          onClick={onAnalysisClick}
          className="font-medium text-gray-700 bg-white/90 hover:bg-white shadow-lg rounded border border-gray-300 px-3 py-1 flex items-center gap-1"
          disabled={workspaceItemCount === 0}
        >
          <BarChart3 className="w-3 h-3" />
          Analyze
        </button>
        <button 
          onClick={onPortfolioClick}
          className="font-medium text-gray-700 bg-white/90 hover:bg-white shadow-lg rounded border border-gray-300 px-3 py-1 flex items-center gap-1"
          disabled={workspaceItemCount === 0}
        >
          <PieChart className="w-3 h-3" />
          Portfolio
        </button>
        <button 
          onClick={onExportClick}
          className="font-medium text-gray-700 bg-white/90 hover:bg-white shadow-lg rounded border border-gray-300 px-3 py-1 flex items-center gap-1"
          disabled={workspaceItemCount === 0}
        >
          <FileSpreadsheet className="w-3 h-3" />
          Export
        </button>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-400" />
          <span className="font-medium text-gray-900 text-xs">Properties</span>
          {/* iOS-Style Rectangular Toggle */}
          <label className="relative inline-flex items-center cursor-pointer ml-1">
            <input
              type="checkbox"
              checked={propertyListingsEnabled}
              onChange={(e) => onPropertyListingsToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-6 h-3 bg-gray-200 peer-focus:outline-none rounded-sm peer peer-checked:after:translate-x-3 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-sm after:h-2 after:w-2 after:transition-all duration-200 peer-checked:bg-blue-500/90 shadow-inner border border-gray-400/40 hover:border-gray-500/60 transition-all"></div>
          </label>
        </div>
        {/* Property Type Filters */}
        {propertyListingsEnabled && (
          <div className="flex items-center gap-1 ml-2">
            {propertyTypeOptions.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedPropertyTypes.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handlePropertyTypeToggle(option.value)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-all duration-200 shadow-sm ${isSelected ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-blue-50'}`}
                  style={{ fontSize: '12px' }}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default TopActionBar 