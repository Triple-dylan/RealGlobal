import React, { useState, useEffect } from 'react'
import { 
  BarChart3, TrendingUp, TrendingDown, Building2, MapPin, 
  DollarSign, Users, Square, Calculator, Star, X, 
  ArrowUpRight, ArrowDownRight, Minus, Plus, Eye,
  Target, Shield, Zap, Award, AlertTriangle
} from 'lucide-react'
import { useAnimations, AnimatedValue, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'

interface PropertyForComparison {
  id: string
  address: string
  coordinates: [number, number]
  value?: number
  propertyType?: string
  marketData?: {
    capRate?: number
    appreciation?: number
    occupancyRate?: number
    pricePerSqft?: number
    averagePrice?: number
    cashFlow?: number
    noi?: number
  }
  investmentMetrics?: {
    capRate?: number
    cashFlow?: number
    appreciation?: number
    totalReturn?: number
    paybackPeriod?: number
    irr?: number
    riskScore?: number
    cashOnCash?: number
  }
  propertyDetails?: {
    yearBuilt?: number
    squareFootage?: number
    units?: number
    condition?: 'excellent' | 'good' | 'fair' | 'poor'
  }
  financials?: {
    listingPrice?: number
    estimatedValue?: number
    monthlyPayment?: number
    grossRent?: number
    expenses?: number
  }
}

interface PropertyComparisonPanelProps {
  properties: PropertyForComparison[]
  visible: boolean
  onClose: () => void
  onRemoveProperty: (propertyId: string) => void
  onAddProperty: () => void
}

const PropertyComparisonPanel: React.FC<PropertyComparisonPanelProps> = ({
  properties,
  visible,
  onClose,
  onRemoveProperty,
  onAddProperty
}) => {
  const [activeMetric, setActiveMetric] = useState<'financial' | 'physical' | 'risk' | 'returns'>('financial')
  const [sortBy, setSortBy] = useState<'capRate' | 'cashFlow' | 'value' | 'risk'>('capRate')
  
  useAnimations()
  useGlassEffects()

  if (!visible) return null

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value?: number) => value ? `${value.toFixed(1)}%` : 'N/A'

  const getComparisonIcon = (value1?: number, value2?: number, higherIsBetter = true) => {
    if (!value1 || !value2) return <Minus className="w-4 h-4 text-gray-500" />
    
    const isHigher = value1 > value2
    if ((higherIsBetter && isHigher) || (!higherIsBetter && !isHigher)) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />
    } else {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />
    }
  }

  const getScoreColor = (score?: number, reverse = false) => {
    if (!score) return 'text-gray-500'
    const threshold1 = reverse ? 70 : 30
    const threshold2 = reverse ? 40 : 60
    
    if (reverse) {
      return score < threshold2 ? 'text-green-500' : score < threshold1 ? 'text-orange-500' : 'text-red-500'
    } else {
      return score > threshold2 ? 'text-green-500' : score > threshold1 ? 'text-orange-500' : 'text-red-500'
    }
  }

  const calculateOverallScore = (property: PropertyForComparison) => {
    let score = 0
    let factors = 0

    if (property.investmentMetrics?.capRate) {
      score += Math.min(property.investmentMetrics.capRate * 10, 100)
      factors++
    }
    if (property.investmentMetrics?.cashFlow) {
      score += property.investmentMetrics.cashFlow > 0 ? 80 : 20
      factors++
    }
    if (property.investmentMetrics?.riskScore) {
      score += 100 - property.investmentMetrics.riskScore
      factors++
    }
    if (property.marketData?.occupancyRate) {
      score += property.marketData.occupancyRate
      factors++
    }

    return factors > 0 ? score / factors : 50
  }

  const sortedProperties = [...properties].sort((a, b) => {
    switch (sortBy) {
      case 'capRate':
        return (b.investmentMetrics?.capRate || 0) - (a.investmentMetrics?.capRate || 0)
      case 'cashFlow':
        return (b.investmentMetrics?.cashFlow || 0) - (a.investmentMetrics?.cashFlow || 0)
      case 'value':
        return (b.value || 0) - (a.value || 0)
      case 'risk':
        return (a.investmentMetrics?.riskScore || 50) - (b.investmentMetrics?.riskScore || 50)
      default:
        return 0
    }
  })

  const metrics = [
    { id: 'financial', label: 'Financial', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'physical', label: 'Physical', icon: <Building2 className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk', icon: <Shield className="w-4 h-4" /> },
    { id: 'returns', label: 'Returns', icon: <TrendingUp className="w-4 h-4" /> }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`${sleekStyles.glassMorphism.primary} rounded-xl shadow-2xl border w-full max-w-7xl max-h-[90vh] overflow-hidden ${animationClasses.slideUp}`}>
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${sleekStyles.text.primary}`}>Property Comparison</h2>
              <p className={`text-sm ${sleekStyles.text.secondary}`}>Compare {properties.length} properties side by side</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${sleekStyles.text.secondary}`}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`${sleekStyles.glassMorphism.secondary} border border-white/20 rounded-lg px-3 py-1 text-sm ${sleekStyles.text.primary} bg-transparent`}
                >
                  <option value="capRate" className="bg-gray-800">Cap Rate</option>
                  <option value="cashFlow" className="bg-gray-800">Cash Flow</option>
                  <option value="value" className="bg-gray-800">Property Value</option>
                  <option value="risk" className="bg-gray-800">Risk Score</option>
                </select>
              </div>
              <GlassButton
                onClick={onAddProperty}
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                Add Property
              </GlassButton>
              <GlassButton
                onClick={onClose}
                variant="ghost"
                size="sm"
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Metric Navigation */}
          <div className="flex gap-1 mt-4">
            {metrics.map(metric => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeMetric === metric.id
                    ? `${sleekStyles.status.info} ${sleekStyles.text.accent}`
                    : `${sleekStyles.text.secondary} hover:${sleekStyles.glassMorphism.secondary}`
                }`}
              >
                {metric.icon}
                <span className="text-sm font-medium">{metric.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className={`w-16 h-16 ${sleekStyles.text.muted} mx-auto mb-4`} />
              <h3 className={`text-lg font-semibold ${sleekStyles.text.primary} mb-2`}>No Properties to Compare</h3>
              <p className={`${sleekStyles.text.secondary} mb-4`}>Add properties to start comparing their metrics</p>
              <GlassButton
                onClick={onAddProperty}
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
              >
                Add First Property
              </GlassButton>
            </div>
          ) : (
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(properties.length, 4)}, 1fr)` }}>
              {sortedProperties.slice(0, 4).map((property, index) => (
                <div key={property.id} className={`${sleekStyles.glassMorphism.secondary} rounded-xl p-4 ${animationClasses.slideUp}`} style={{ animationDelay: `${index * 100}ms` }}>
                  {/* Property Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${sleekStyles.text.primary} text-lg mb-1`}>
                        {property.address}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${sleekStyles.status.info} ${sleekStyles.text.accent}`}>
                          #{index + 1}
                        </span>
                        {property.propertyType && (
                          <span className={`text-xs ${sleekStyles.text.muted}`}>
                            {property.propertyType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className={`w-4 h-4 ${getScoreColor(calculateOverallScore(property))}`} />
                        <span className={getScoreColor(calculateOverallScore(property))}>
                          {calculateOverallScore(property).toFixed(0)}/100
                        </span>
                      </div>
                    </div>
                    <GlassButton
                      onClick={() => onRemoveProperty(property.id)}
                      variant="ghost"
                      size="sm"
                      icon={<X className="w-4 h-4" />}
                    />
                  </div>

                  {/* Financial Metrics */}
                  {activeMetric === 'financial' && (
                    <div className="space-y-3">
                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Property Value</span>
                          {index > 0 && getComparisonIcon(property.value, sortedProperties[0].value)}
                        </div>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {formatCurrency(property.value)}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Cap Rate</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.capRate, sortedProperties[0].investmentMetrics?.capRate)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.capRate)}`}>
                          {formatPercentage(property.investmentMetrics?.capRate)}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Cash Flow</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.cashFlow, sortedProperties[0].investmentMetrics?.cashFlow)}
                        </div>
                        <div className={`text-lg font-bold ${property.investmentMetrics?.cashFlow && property.investmentMetrics.cashFlow > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {property.investmentMetrics?.cashFlow ? formatCurrency(property.investmentMetrics.cashFlow) + '/mo' : 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Price/sqft</span>
                          {index > 0 && getComparisonIcon(property.marketData?.pricePerSqft, sortedProperties[0].marketData?.pricePerSqft, false)}
                        </div>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.marketData?.pricePerSqft ? `$${property.marketData.pricePerSqft.toFixed(0)}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Physical Metrics */}
                  {activeMetric === 'physical' && (
                    <div className="space-y-3">
                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Year Built</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.propertyDetails?.yearBuilt || 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Square Footage</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.propertyDetails?.squareFootage ? property.propertyDetails.squareFootage.toLocaleString() : 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Units</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.propertyDetails?.units || 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Condition</span>
                        <div className={`text-sm font-medium ${
                          property.propertyDetails?.condition === 'excellent' ? 'text-green-500' :
                          property.propertyDetails?.condition === 'good' ? 'text-blue-500' :
                          property.propertyDetails?.condition === 'fair' ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {property.propertyDetails?.condition?.charAt(0).toUpperCase() + property.propertyDetails?.condition?.slice(1) || 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Occupancy Rate</span>
                        <div className={`text-lg font-bold ${getScoreColor(property.marketData?.occupancyRate)}`}>
                          {formatPercentage(property.marketData?.occupancyRate)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risk Metrics */}
                  {activeMetric === 'risk' && (
                    <div className="space-y-3">
                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Risk Score</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.riskScore, sortedProperties[0].investmentMetrics?.riskScore, false)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.riskScore, true)}`}>
                          {property.investmentMetrics?.riskScore ? `${property.investmentMetrics.riskScore.toFixed(0)}/100` : 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Market Risk</span>
                        <div className={`text-sm font-medium ${
                          (property.investmentMetrics?.riskScore || 50) < 30 ? 'text-green-500' :
                          (property.investmentMetrics?.riskScore || 50) < 60 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {(property.investmentMetrics?.riskScore || 50) < 30 ? 'Low' :
                           (property.investmentMetrics?.riskScore || 50) < 60 ? 'Medium' : 'High'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Liquidity</span>
                        <div className={`text-sm font-medium ${
                          property.propertyType === 'residential' ? 'text-green-500' :
                          property.propertyType === 'multifamily' ? 'text-blue-500' : 'text-orange-500'
                        }`}>
                          {property.propertyType === 'residential' ? 'High' :
                           property.propertyType === 'multifamily' ? 'Medium' : 'Low'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Vacancy Risk</span>
                        <div className={`text-sm font-medium ${
                          (property.marketData?.occupancyRate || 85) > 90 ? 'text-green-500' :
                          (property.marketData?.occupancyRate || 85) > 80 ? 'text-orange-500' : 'text-red-500'
                        }`}>
                          {(property.marketData?.occupancyRate || 85) > 90 ? 'Low' :
                           (property.marketData?.occupancyRate || 85) > 80 ? 'Medium' : 'High'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Returns Metrics */}
                  {activeMetric === 'returns' && (
                    <div className="space-y-3">
                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Total Return</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.totalReturn, sortedProperties[0].investmentMetrics?.totalReturn)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.totalReturn)}`}>
                          {formatPercentage(property.investmentMetrics?.totalReturn)}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Cash-on-Cash</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.cashOnCash, sortedProperties[0].investmentMetrics?.cashOnCash)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.cashOnCash)}`}>
                          {formatPercentage(property.investmentMetrics?.cashOnCash)}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>IRR</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.irr, sortedProperties[0].investmentMetrics?.irr)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.irr)}`}>
                          {formatPercentage(property.investmentMetrics?.irr)}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Payback Period</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.investmentMetrics?.paybackPeriod ? `${property.investmentMetrics.paybackPeriod.toFixed(1)} yrs` : 'N/A'}
                        </div>
                      </div>

                      <div className={`${sleekStyles.glassMorphism.primary} p-3 rounded-lg`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs ${sleekStyles.text.secondary}`}>Appreciation</span>
                          {index > 0 && getComparisonIcon(property.investmentMetrics?.appreciation, sortedProperties[0].investmentMetrics?.appreciation)}
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(property.investmentMetrics?.appreciation)}`}>
                          {formatPercentage(property.investmentMetrics?.appreciation)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex gap-2">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs"
                        icon={<Eye className="w-3 h-3" />}
                      >
                        View Details
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs"
                        icon={<Calculator className="w-3 h-3" />}
                      >
                        Analyze
                      </GlassButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Summary */}
          {properties.length > 1 && (
            <div className={`mt-8 ${sleekStyles.glassMorphism.secondary} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${sleekStyles.text.primary} mb-4`}>Comparison Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${sleekStyles.glassMorphism.primary} p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-green-500" />
                    <span className={`font-semibold ${sleekStyles.text.primary}`}>Best Investment</span>
                  </div>
                  <p className={`text-sm ${sleekStyles.text.secondary}`}>
                    {sortedProperties[0]?.address} with {calculateOverallScore(sortedProperties[0]).toFixed(0)}/100 score
                  </p>
                </div>

                <div className={`${sleekStyles.glassMorphism.primary} p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <span className={`font-semibold ${sleekStyles.text.primary}`}>Highest Cash Flow</span>
                  </div>
                  <p className={`text-sm ${sleekStyles.text.secondary}`}>
                    {sortedProperties.sort((a, b) => (b.investmentMetrics?.cashFlow || 0) - (a.investmentMetrics?.cashFlow || 0))[0]?.address}
                  </p>
                </div>

                <div className={`${sleekStyles.glassMorphism.primary} p-4 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <span className={`font-semibold ${sleekStyles.text.primary}`}>Lowest Risk</span>
                  </div>
                  <p className={`text-sm ${sleekStyles.text.secondary}`}>
                    {sortedProperties.sort((a, b) => (a.investmentMetrics?.riskScore || 50) - (b.investmentMetrics?.riskScore || 50))[0]?.address}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PropertyComparisonPanel