import React, { useState, useEffect } from 'react'
import { TrendingUp, Target, AlertTriangle, CheckCircle, MapPin, DollarSign, Percent, Calendar, Building, Star, ArrowRight, RefreshCw } from 'lucide-react'
import { PropertyRecommendationEngine, UserPreferences, PropertyRecommendation, RecommendationReport } from '../services/ai/property-recommendation-engine'

interface PropertyRecommendationsProps {
  onPropertySelect?: (property: any) => void
  onLocationClick?: (location: { lat: number; lng: number; zoom: number }) => void
  visible: boolean
  onClose?: () => void
}

const PropertyRecommendations: React.FC<PropertyRecommendationsProps> = ({
  onPropertySelect,
  onLocationClick,
  visible,
  onClose
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    investmentStrategy: 'cash-flow',
    riskTolerance: 'moderate',
    budgetRange: { min: 500000, max: 2000000 },
    preferredPropertyTypes: ['office', 'multifamily'],
    investmentCriteria: {
      minCapRate: 5,
      minOccupancy: 80,
      maxDaysOnMarket: 120
    },
    timeline: {
      acquisitionTimeframe: '3-6months',
      holdPeriod: '5-10years'
    },
    marketPreferences: {
      growthMarkets: true,
      establishedMarkets: true
    }
  })

  const [recommendations, setRecommendations] = useState<RecommendationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPreferences, setShowPreferences] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recommendationEngine = new PropertyRecommendationEngine()

  const generateRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const report = await recommendationEngine.generateRecommendations(preferences, 8)
      setRecommendations(report)
      setShowPreferences(false)
    } catch (err) {
      console.error('Failed to generate recommendations:', err)
      setError('Failed to generate recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'cash-flow': return <DollarSign className="w-4 h-4" />
      case 'appreciation': return <TrendingUp className="w-4 h-4" />
      case 'value-add': return <Target className="w-4 h-4" />
      default: return <Building className="w-4 h-4" />
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6" />
              <h2 className="text-xl font-semibold">AI Property Recommendations</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
          {recommendations && (
            <p className="text-blue-100 mt-2">
              Found {recommendations.recommendations.length} properties matching your criteria
            </p>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {showPreferences ? (
            // Preferences Form
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Investment Preferences</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investment Strategy */}
                <div>
                  <label className="block text-sm font-medium mb-2">Investment Strategy</label>
                  <select
                    value={preferences.investmentStrategy}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      investmentStrategy: e.target.value as any
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="cash-flow">Cash Flow</option>
                    <option value="appreciation">Appreciation</option>
                    <option value="value-add">Value Add</option>
                    <option value="development">Development</option>
                    <option value="core">Core</option>
                    <option value="opportunistic">Opportunistic</option>
                  </select>
                </div>

                {/* Risk Tolerance */}
                <div>
                  <label className="block text-sm font-medium mb-2">Risk Tolerance</label>
                  <select
                    value={preferences.riskTolerance}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      riskTolerance: e.target.value as any
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="moderate">Moderate</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={preferences.budgetRange.min}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        budgetRange: { ...prev.budgetRange, min: Number(e.target.value) }
                      }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={preferences.budgetRange.max}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        budgetRange: { ...prev.budgetRange, max: Number(e.target.value) }
                      }))}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Max"
                    />
                  </div>
                </div>

                {/* Property Types */}
                <div>
                  <label className="block text-sm font-medium mb-2">Property Types</label>
                  <div className="flex flex-wrap gap-2">
                    {['office', 'retail', 'industrial', 'multifamily', 'mixed-use', 'land'].map(type => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={preferences.preferredPropertyTypes.includes(type as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferences(prev => ({
                                ...prev,
                                preferredPropertyTypes: [...prev.preferredPropertyTypes, type as any]
                              }))
                            } else {
                              setPreferences(prev => ({
                                ...prev,
                                preferredPropertyTypes: prev.preferredPropertyTypes.filter(t => t !== type)
                              }))
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Investment Criteria */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Investment Criteria</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Cap Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={preferences.investmentCriteria.minCapRate || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          investmentCriteria: {
                            ...prev.investmentCriteria,
                            minCapRate: Number(e.target.value) || undefined
                          }
                        }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Occupancy (%)</label>
                      <input
                        type="number"
                        value={preferences.investmentCriteria.minOccupancy || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          investmentCriteria: {
                            ...prev.investmentCriteria,
                            minOccupancy: Number(e.target.value) || undefined
                          }
                        }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Max Days on Market</label>
                      <input
                        type="number"
                        value={preferences.investmentCriteria.maxDaysOnMarket || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          investmentCriteria: {
                            ...prev.investmentCriteria,
                            maxDaysOnMarket: Number(e.target.value) || undefined
                          }
                        }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Min Square Footage</label>
                      <input
                        type="number"
                        value={preferences.investmentCriteria.minSquareFootage || ''}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          investmentCriteria: {
                            ...prev.investmentCriteria,
                            minSquareFootage: Number(e.target.value) || undefined
                          }
                        }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={generateRecommendations}
                  disabled={loading || preferences.preferredPropertyTypes.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Generate Recommendations
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}
            </div>
          ) : recommendations ? (
            // Recommendations Display
            <div className="p-6 space-y-6">
              {/* AI Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI Investment Summary
                </h3>
                <p className="text-blue-800">{recommendations.aiSummary}</p>
              </div>

              {/* Portfolio Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Portfolio Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Diversification:</span>
                      <span className="font-medium">{recommendations.portfolioAnalysis.diversificationScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Return:</span>
                      <span className="font-medium">{recommendations.portfolioAnalysis.expectedPortfolioReturn.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Hot Markets</h4>
                  <div className="space-y-1">
                    {recommendations.marketInsights.hotMarkets.map((market, idx) => (
                      <div key={idx} className="text-sm text-gray-600">• {market}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Market Timing</h4>
                  <div className="text-sm">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      recommendations.marketInsights.timing === 'excellent' ? 'bg-green-100 text-green-800' :
                      recommendations.marketInsights.timing === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recommendations.marketInsights.timing.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Property Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recommended Properties</h3>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Adjust Preferences
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {recommendations.recommendations.map((rec) => (
                    <PropertyRecommendationCard
                      key={rec.property.id}
                      recommendation={rec}
                      onPropertySelect={onPropertySelect}
                      onLocationClick={onLocationClick}
                      formatCurrency={formatCurrency}
                      getConfidenceColor={getConfidenceColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Separate component for property recommendation cards
const PropertyRecommendationCard: React.FC<{
  recommendation: PropertyRecommendation
  onPropertySelect?: (property: any) => void
  onLocationClick?: (location: { lat: number; lng: number; zoom: number }) => void
  formatCurrency: (amount: number) => string
  getConfidenceColor: (confidence: string) => string
}> = ({ recommendation, onPropertySelect, onLocationClick, formatCurrency, getConfidenceColor }) => {
  const { property, score, matchReasons, opportunityHighlights, projectedReturns, confidence } = recommendation

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-lg">{property.address.street}</h4>
          <p className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {property.address.city}, {property.address.state}
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">{score}/100</div>
          <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(confidence)}`}>
            {confidence.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Price:</span>
          <div className="font-medium">{formatCurrency(property.listingDetails.listPrice)}</div>
        </div>
        <div>
          <span className="text-gray-600">Cap Rate:</span>
          <div className="font-medium">{property.listingDetails.capRate}%</div>
        </div>
        <div>
          <span className="text-gray-600">Type:</span>
          <div className="font-medium capitalize">{property.propertyType}</div>
        </div>
        <div>
          <span className="text-gray-600">Est. ROI:</span>
          <div className="font-medium text-green-600">{projectedReturns.estimatedROI}%</div>
        </div>
      </div>

      {/* Match Reasons */}
      {matchReasons.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium text-gray-700 mb-1">Why This Matches:</h5>
          <div className="space-y-1">
            {matchReasons.slice(0, 2).map((reason, idx) => (
              <div key={idx} className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {reason}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Highlights */}
      {opportunityHighlights.length > 0 && (
        <div className="mb-3">
          <h5 className="text-xs font-medium text-gray-700 mb-1">Opportunities:</h5>
          <div className="space-y-1">
            {opportunityHighlights.slice(0, 2).map((highlight, idx) => (
              <div key={idx} className="text-xs text-blue-700 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {highlight}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onLocationClick?.({
            lat: property.coordinates.lat,
            lng: property.coordinates.lng,
            zoom: 16
          })}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition-colors"
        >
          <MapPin className="w-3 h-3" />
          View on Map
        </button>
        <button
          onClick={() => onPropertySelect?.(property)}
          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded text-sm flex items-center justify-center gap-1 transition-colors"
        >
          <ArrowRight className="w-3 h-3" />
          Details
        </button>
      </div>
    </div>
  )
}

export default PropertyRecommendations