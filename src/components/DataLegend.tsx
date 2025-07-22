import React from 'react'
import { TrendingUp, Users, Building, DollarSign, Globe } from 'lucide-react'

interface DataLegendProps {
  activeOverlays: string[]
  visible: boolean
}

const DataLegend: React.FC<DataLegendProps> = ({ activeOverlays, visible }) => {
  if (!visible || activeOverlays.length === 0) return null

  const getLegendConfig = (overlay: string) => {
    switch (overlay) {
      case 'employment-growth':
        return {
          title: 'Employment Growth',
          icon: <Users className="w-4 h-4" />,
          unit: '% YoY',
          ranges: [
            { label: '4%+', color: '#064e3b', description: 'Exceptional growth' },
            { label: '2-4%', color: '#047857', description: 'Strong growth' },
            { label: '1-2%', color: '#059669', description: 'Good growth' },
            { label: '0-1%', color: '#6b7280', description: 'Slow growth' },
            { label: 'Negative', color: '#dc2626', description: 'Declining' }
          ],
          globalContext: 'Based on World Bank employment-to-population ratios and BLS data'
        }
      
      case 'population-growth':
        return {
          title: 'Population Growth',
          icon: <TrendingUp className="w-4 h-4" />,
          unit: '% Annual',
          ranges: [
            { label: '3%+', color: '#064e3b', description: 'Very high growth' },
            { label: '2-3%', color: '#047857', description: 'High growth' },
            { label: '1-2%', color: '#059669', description: 'Moderate growth' },
            { label: '0-1%', color: '#6b7280', description: 'Low growth' },
            { label: 'Negative', color: '#dc2626', description: 'Declining' }
          ],
          globalContext: 'UN World Population Prospects and national census data'
        }
      
      case 'construction-cost-index':
        return {
          title: 'Construction Cost Index',
          icon: <DollarSign className="w-4 h-4" />,
          unit: 'Index (100 = baseline)',
          ranges: [
            { label: '150+', color: '#b91c1c', description: 'Very expensive' },
            { label: '120-150', color: '#dc2626', description: 'Expensive' },
            { label: '90-120', color: '#6b7280', description: 'Moderate' },
            { label: '60-90', color: '#059669', description: 'Affordable' },
            { label: '<60', color: '#064e3b', description: 'Very affordable' }
          ],
          globalContext: 'Turner & Townsend International Construction Market Survey'
        }
      
      case 'building-permit-activity':
        return {
          title: 'Special Economic Zones',
          icon: <Building className="w-4 h-4" />,
          unit: 'Number of zones',
          ranges: [
            { label: '2000+', color: '#1e40af', description: 'Massive program' },
            { label: '500-2000', color: '#0369a1', description: 'Large program' },
            { label: '200-500', color: '#0284c7', description: 'Active program' },
            { label: '50-200', color: '#0891b2', description: 'Growing program' },
            { label: '<50', color: '#6b7280', description: 'Limited zones' }
          ],
          globalContext: 'UNCTAD World Investment Report and national SEZ authorities'
        }
      
      case 'gdp-growth':
        return {
          title: 'GDP Growth',
          icon: <TrendingUp className="w-4 h-4" />,
          unit: '% YoY',
          ranges: [
            { label: '6%+', color: '#064e3b', description: 'Exceptional' },
            { label: '3-6%', color: '#047857', description: 'Strong' },
            { label: '1-3%', color: '#059669', description: 'Moderate' },
            { label: '0-1%', color: '#6b7280', description: 'Weak' },
            { label: 'Negative', color: '#dc2626', description: 'Recession' }
          ],
          globalContext: 'World Bank national accounts data'
        }
      
      case 'property-appreciation':
        return {
          title: 'Property Appreciation',
          icon: <Building className="w-4 h-4" />,
          unit: '% Annual',
          ranges: [
            { label: '10%+', color: '#064e3b', description: 'Hot market' },
            { label: '5-10%', color: '#047857', description: 'Strong' },
            { label: '2-5%', color: '#059669', description: 'Healthy' },
            { label: '0-2%', color: '#6b7280', description: 'Flat' },
            { label: 'Negative', color: '#dc2626', description: 'Declining' }
          ],
          globalContext: 'FHFA House Price Index and international property indices'
        }
      
      default:
        return null
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-2xl shadow-2xl p-6 max-w-sm z-30">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700/50">
        <Globe className="w-4 h-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Global Data Overlays</h3>
      </div>
      
      <div className="space-y-4">
        {activeOverlays.map(overlay => {
          const config = getLegendConfig(overlay)
          if (!config) return null
          
          return (
            <div key={overlay} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-blue-400">{config.icon}</div>
                <div>
                  <div className="text-xs font-medium text-white">{config.title}</div>
                  <div className="text-xs text-gray-400">{config.unit}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                {config.ranges.map((range, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: range.color }}
                      />
                      <span className="text-xs text-gray-300">{range.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{range.description}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 italic">
                {config.globalContext}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700/50">
        <div className="text-xs text-gray-500">
          Hover over regions for detailed metrics
        </div>
      </div>
    </div>
  )
}

export default DataLegend 