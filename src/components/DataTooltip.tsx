import React from 'react'
import { TrendingUp, TrendingDown, Users, Building, DollarSign, MapPin } from 'lucide-react'

interface DataTooltipProps {
  country?: string
  region?: string
  data: {
    gdpGrowth?: number
    propertyAppreciation?: number
    employmentGrowth?: number
    populationGrowth?: number
    permitActivity?: number
    constructionCostIndex?: number
    opportunityZones?: number
    taxCreditZones?: boolean
  }
  position: { x: number; y: number }
  visible: boolean
}

const DataTooltip: React.FC<DataTooltipProps> = ({ country, region, data, position, visible }) => {
  if (!visible) return null

  const formatPercentage = (value?: number) => {
    if (value === undefined || value === null) return 'N/A'
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return 'N/A'
    return value.toLocaleString()
  }

  const getTrendIcon = (value?: number) => {
    if (value === undefined || value === null) return null
    return value > 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />
  }

  const getGrowthColor = (value?: number) => {
    if (value === undefined || value === null) return 'text-gray-400'
    if (value > 2) return 'text-green-400'
    if (value > 0) return 'text-blue-400'
    return 'text-red-400'
  }

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y - 10,
        transform: position.x > window.innerWidth - 300 ? 'translateX(-100%)' : 'none'
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl p-4 max-w-xs">
        {/* Header */}
        <div className="mb-2 pb-2 border-b border-gray-700/50">
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="font-semibold text-white text-sm">
              {region || country || 'Unknown Region'}
            </span>
          </div>
        </div>

        {/* Economic Indicators */}
        <div className="space-y-1.5">
          {/* GDP Growth */}
          {data.gdpGrowth !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-gray-300">GDP Growth</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.gdpGrowth)}
                <span className={`text-xs font-medium ${getGrowthColor(data.gdpGrowth)}`}>
                  {formatPercentage(data.gdpGrowth)} YoY
                </span>
              </div>
            </div>
          )}

          {/* Property Appreciation */}
          {data.propertyAppreciation !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-green-400" />
                <span className="text-xs text-gray-300">Property Appreciation</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.propertyAppreciation)}
                <span className={`text-xs font-medium ${getGrowthColor(data.propertyAppreciation)}`}>
                  {formatPercentage(data.propertyAppreciation)}
                </span>
              </div>
            </div>
          )}

          {/* Employment Growth */}
          {data.employmentGrowth !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-300">Employment Growth</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.employmentGrowth)}
                <span className={`text-xs font-medium ${getGrowthColor(data.employmentGrowth)}`}>
                  {formatPercentage(data.employmentGrowth)}
                </span>
              </div>
            </div>
          )}

          {/* Population Growth */}
          {data.populationGrowth !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-gray-300">Population Growth</span>
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(data.populationGrowth)}
                <span className={`text-xs font-medium ${getGrowthColor(data.populationGrowth)}`}>
                  {formatPercentage(data.populationGrowth)}
                </span>
              </div>
            </div>
          )}

          {/* Building Permits */}
          {data.permitActivity !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-gray-300">Annual Permits</span>
              </div>
              <span className="text-xs font-medium text-orange-400">
                {formatNumber(data.permitActivity)}
              </span>
            </div>
          )}

          {/* Construction Costs */}
          {data.constructionCostIndex !== undefined && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-gray-300">Construction Index</span>
              </div>
              <span className={`text-xs font-medium ${
                data.constructionCostIndex > 120 ? 'text-red-400' : 
                data.constructionCostIndex > 110 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {data.constructionCostIndex}
              </span>
            </div>
          )}

          {/* Opportunity Zones */}
          {data.opportunityZones !== undefined && data.opportunityZones > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-400" />
                <span className="text-xs text-gray-300">Opportunity Zones</span>
              </div>
              <span className="text-xs font-medium text-orange-400">
                {data.opportunityZones} zones
              </span>
            </div>
          )}

          {/* Tax Credit Zones */}
          {data.taxCreditZones && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Building className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-gray-300">Tax Credits</span>
              </div>
              <span className="text-xs font-medium text-green-400">
                +30% Available
              </span>
            </div>
          )}
        </div>

        {/* Investment Summary */}
        <div className="mt-2 pt-2 border-t border-gray-700/50">
          <div className="text-xs text-gray-400">
            Investment Climate: {
              (data.gdpGrowth || 0) > 2 && (data.employmentGrowth || 0) > 1.5 ? (
                <span className="text-green-400 font-medium">Strong</span>
              ) : (data.gdpGrowth || 0) > 1 && (data.employmentGrowth || 0) > 0.5 ? (
                <span className="text-blue-400 font-medium">Moderate</span>
              ) : (
                <span className="text-yellow-400 font-medium">Cautious</span>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataTooltip 