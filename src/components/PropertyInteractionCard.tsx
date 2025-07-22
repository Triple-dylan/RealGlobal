import React, { useState, useEffect } from 'react'
import { 
  Building2, MapPin, DollarSign, TrendingUp, TrendingDown, 
  Calendar, Users, Square, Zap, Star, Heart, Eye, 
  ArrowUpRight, ArrowDownRight, Info, X, ChevronRight,
  Bookmark, Calculator, PieChart, AlertTriangle, CheckCircle,
  Clock, Phone, Mail, ExternalLink
} from 'lucide-react'
import { useAnimations, AnimatedValue, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'
import { usePortfolio } from './PortfolioSystem'

interface PropertyData {
  id: string
  address: string
  coordinates: [number, number]
  value?: number
  type: 'portfolio' | 'potential' | 'analysis' | 'risk'
  status: 'owned' | 'watching' | 'analyzing' | 'avoid'
  propertyType?: string
  marketData?: {
    capRate?: number
    appreciation?: number
    risk?: number
    occupancyRate?: number
    vacancy?: number
    pricePerSqft?: number
    averagePrice?: number
    cashFlow?: number
    noi?: number
  }
  propertyDetails?: {
    yearBuilt?: number
    squareFootage?: number
    units?: number
    parking?: number
    amenities?: string[]
    condition?: 'excellent' | 'good' | 'fair' | 'poor'
    lastRenovated?: number
  }
  financials?: {
    listingPrice?: number
    estimatedValue?: number
    downPayment?: number
    loanAmount?: number
    monthlyPayment?: number
    grossRent?: number
    expenses?: number
    cashOnCash?: number
    totalReturn?: number
  }
  investmentMetrics?: {
    capRate?: number
    cashFlow?: number
    appreciation?: number
    totalReturn?: number
    paybackPeriod?: number
    irr?: number
    riskScore?: number
  }
  contact?: {
    broker?: string
    phone?: string
    email?: string
    listingAgent?: string
  }
  timeline?: {
    listed?: Date
    lastViewed?: Date
    offerDeadline?: Date
    closingDate?: Date
  }
}

interface PropertyInteractionCardProps {
  property: PropertyData | null
  visible: boolean
  position?: { x: number; y: number }
  onClose: () => void
  onAddToPortfolio?: (property: PropertyData) => void
  onAddToWatchlist?: (property: PropertyData) => void
  onScheduleViewing?: (property: PropertyData) => void
  onCompare?: (property: PropertyData) => void
}

const PropertyInteractionCard: React.FC<PropertyInteractionCardProps> = ({
  property,
  visible,
  position,
  onClose,
  onAddToPortfolio,
  onAddToWatchlist,
  onScheduleViewing,
  onCompare
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'details' | 'analysis'>('overview')
  const [isExpanded, setIsExpanded] = useState(false)
  const { addToPortfolio, addToWorkspace } = usePortfolio()
  
  useAnimations()
  useGlassEffects()

  if (!property || !visible) return null

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'owned': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'watching': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'analyzing': return 'text-orange-500 bg-orange-500/10 border-orange-500/20'
      case 'avoid': return 'text-red-500 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getInvestmentGrade = (metrics?: PropertyData['investmentMetrics']) => {
    if (!metrics) return { grade: 'N/A', color: 'gray' }
    
    const { capRate = 0, cashFlow = 0, riskScore = 50 } = metrics
    let score = 0
    
    // Cap rate scoring (0-40 points)
    if (capRate >= 8) score += 40
    else if (capRate >= 6) score += 30
    else if (capRate >= 4) score += 20
    else score += 10
    
    // Cash flow scoring (0-30 points)
    if (cashFlow >= 500) score += 30
    else if (cashFlow >= 200) score += 20
    else if (cashFlow >= 0) score += 10
    
    // Risk scoring (0-30 points)
    if (riskScore <= 30) score += 30
    else if (riskScore <= 50) score += 20
    else if (riskScore <= 70) score += 10
    
    if (score >= 85) return { grade: 'A+', color: 'green' }
    if (score >= 75) return { grade: 'A', color: 'green' }
    if (score >= 65) return { grade: 'B+', color: 'blue' }
    if (score >= 55) return { grade: 'B', color: 'blue' }
    if (score >= 45) return { grade: 'C+', color: 'orange' }
    if (score >= 35) return { grade: 'C', color: 'orange' }
    return { grade: 'D', color: 'red' }
  }

  const investmentGrade = getInvestmentGrade(property.investmentMetrics)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Building2 className="w-4 h-4" /> },
    { id: 'financials', label: 'Financials', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> },
    { id: 'analysis', label: 'Analysis', icon: <PieChart className="w-4 h-4" /> }
  ]

  return (
    <div 
      className={`fixed z-50 ${animationClasses.slideUp}`}
      style={{
        left: position?.x ? `${Math.min(position.x, window.innerWidth - 400)}px` : '50%',
        top: position?.y ? `${Math.max(position.y - 200, 20)}px` : '50%',
        transform: position ? 'none' : 'translate(-50%, -50%)',
        width: isExpanded ? '600px' : '400px',
        maxHeight: '80vh',
        maxWidth: '90vw'
      }}
    >
      <div className={`${sleekStyles.glassMorphism.primary} rounded-xl shadow-2xl border backdrop-blur-md overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${getStatusColor(property.status)}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-semibold ${sleekStyles.text.primary} text-lg`}>
                    {property.address}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full border ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                    {property.propertyType && (
                      <span className={`text-xs ${sleekStyles.text.muted}`}>
                        {property.propertyType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Quick Metrics */}
              <div className="flex items-center gap-4 text-sm">
                {property.value && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <AnimatedValue value={property.value} formatter={formatCurrency} />
                  </div>
                )}
                {property.marketData?.capRate && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>{formatPercentage(property.marketData.capRate)} Cap</span>
                  </div>
                )}
                <div className={`flex items-center gap-1 px-2 py-1 rounded border text-${investmentGrade.color}-500 bg-${investmentGrade.color}-500/10 border-${investmentGrade.color}-500/20`}>
                  <Star className="w-3 h-3" />
                  <span className="text-xs font-bold">{investmentGrade.grade}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <GlassButton
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                icon={isExpanded ? <Eye className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              />
              <GlassButton
                onClick={onClose}
                variant="ghost" 
                size="sm"
                icon={<X className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white/5 border-b border-white/10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 flex-1 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `${sleekStyles.status.info} ${sleekStyles.text.accent} border-b-2 border-blue-500`
                  : `${sleekStyles.text.secondary} hover:${sleekStyles.glassMorphism.secondary}`
              }`}
            >
              {tab.icon}
              <span className={isExpanded ? 'block' : 'hidden sm:block'}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-3">
                {property.marketData?.capRate && (
                  <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Cap Rate</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                      {formatPercentage(property.marketData.capRate)}
                    </div>
                  </div>
                )}
                
                {property.investmentMetrics?.cashFlow && (
                  <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Cash Flow</span>
                      <DollarSign className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className={`text-lg font-bold ${property.investmentMetrics.cashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(property.investmentMetrics.cashFlow)}/mo
                    </div>
                  </div>
                )}
                
                {property.marketData?.occupancyRate && (
                  <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Occupancy</span>
                      <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                      {formatPercentage(property.marketData.occupancyRate)}
                    </div>
                  </div>
                )}
                
                {property.investmentMetrics?.riskScore && (
                  <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Risk Score</span>
                      <AlertTriangle className={`w-4 h-4 ${property.investmentMetrics.riskScore > 70 ? 'text-red-500' : property.investmentMetrics.riskScore > 40 ? 'text-orange-500' : 'text-green-500'}`} />
                    </div>
                    <div className={`text-lg font-bold ${property.investmentMetrics.riskScore > 70 ? 'text-red-500' : property.investmentMetrics.riskScore > 40 ? 'text-orange-500' : 'text-green-500'}`}>
                      {property.investmentMetrics.riskScore.toFixed(0)}/100
                    </div>
                  </div>
                )}
              </div>

              {/* Location Info */}
              <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>Location</span>
                </div>
                <p className={`text-sm ${sleekStyles.text.secondary}`}>
                  {property.coordinates[1].toFixed(4)}, {property.coordinates[0].toFixed(4)}
                </p>
              </div>

              {/* Timeline */}
              {property.timeline && (
                <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>Timeline</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    {property.timeline.listed && (
                      <div className="flex justify-between">
                        <span className={sleekStyles.text.secondary}>Listed:</span>
                        <span className={sleekStyles.text.primary}>{property.timeline.listed.toLocaleDateString()}</span>
                      </div>
                    )}
                    {property.timeline.offerDeadline && (
                      <div className="flex justify-between">
                        <span className={sleekStyles.text.secondary}>Offer Deadline:</span>
                        <span className="text-red-500">{property.timeline.offerDeadline.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-4">
              {property.financials && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>List Price</span>
                      <div className={`text-lg font-bold text-blue-500`}>
                        {property.financials.listingPrice ? formatCurrency(property.financials.listingPrice) : 'N/A'}
                      </div>
                    </div>
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Est. Value</span>
                      <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                        {property.financials.estimatedValue ? formatCurrency(property.financials.estimatedValue) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Monthly Payment</span>
                      <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                        {property.financials.monthlyPayment ? formatCurrency(property.financials.monthlyPayment) : 'N/A'}
                      </div>
                    </div>
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Gross Rent</span>
                      <div className={`text-lg font-bold text-green-500`}>
                        {property.financials.grossRent ? formatCurrency(property.financials.grossRent) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Cash-on-Cash</span>
                      <div className={`text-lg font-bold ${property.financials.cashOnCash && property.financials.cashOnCash > 8 ? 'text-green-500' : 'text-orange-500'}`}>
                        {property.financials.cashOnCash ? formatPercentage(property.financials.cashOnCash) : 'N/A'}
                      </div>
                    </div>
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Total Return</span>
                      <div className={`text-lg font-bold ${property.financials.totalReturn && property.financials.totalReturn > 12 ? 'text-green-500' : 'text-orange-500'}`}>
                        {property.financials.totalReturn ? formatPercentage(property.financials.totalReturn) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              {property.propertyDetails && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Year Built</span>
                      <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                        {property.propertyDetails.yearBuilt || 'N/A'}
                      </div>
                    </div>
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Square Footage</span>
                      <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                        {property.propertyDetails.squareFootage ? property.propertyDetails.squareFootage.toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {property.propertyDetails.units && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Units</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.propertyDetails.units}
                        </div>
                      </div>
                      <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                        <span className={`text-xs ${sleekStyles.text.secondary}`}>Parking</span>
                        <div className={`text-lg font-bold ${sleekStyles.text.primary}`}>
                          {property.propertyDetails.parking || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {property.propertyDetails.condition && (
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary}`}>Condition</span>
                      <div className={`text-sm font-medium ${
                        property.propertyDetails.condition === 'excellent' ? 'text-green-500' :
                        property.propertyDetails.condition === 'good' ? 'text-blue-500' :
                        property.propertyDetails.condition === 'fair' ? 'text-orange-500' : 'text-red-500'
                      }`}>
                        {property.propertyDetails.condition.charAt(0).toUpperCase() + property.propertyDetails.condition.slice(1)}
                      </div>
                    </div>
                  )}

                  {property.propertyDetails.amenities && property.propertyDetails.amenities.length > 0 && (
                    <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                      <span className={`text-xs ${sleekStyles.text.secondary} mb-2 block`}>Amenities</span>
                      <div className="flex flex-wrap gap-1">
                        {property.propertyDetails.amenities.map((amenity, index) => (
                          <span key={index} className={`text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300`}>
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Contact Information */}
              {property.contact && (
                <div className={`${sleekStyles.glassMorphism.secondary} p-3 rounded-lg`}>
                  <span className={`text-xs ${sleekStyles.text.secondary} mb-2 block`}>Contact</span>
                  <div className="space-y-2">
                    {property.contact.broker && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className={`text-sm ${sleekStyles.text.primary}`}>{property.contact.broker}</span>
                      </div>
                    )}
                    {property.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-500" />
                        <span className={`text-sm ${sleekStyles.text.primary}`}>{property.contact.phone}</span>
                      </div>
                    )}
                    {property.contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <span className={`text-sm ${sleekStyles.text.primary}`}>{property.contact.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className={`${sleekStyles.glassMorphism.secondary} p-4 rounded-lg`}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className={`w-5 h-5 text-${investmentGrade.color}-500`} />
                  <span className={`font-semibold ${sleekStyles.text.primary}`}>Investment Grade: {investmentGrade.grade}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${sleekStyles.text.secondary}`}>Return Potential</span>
                    <div className="flex items-center gap-1">
                      {(property.investmentMetrics?.totalReturn || 0) > 10 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm font-medium ${(property.investmentMetrics?.totalReturn || 0) > 10 ? 'text-green-500' : 'text-red-500'}`}>
                        {property.investmentMetrics?.totalReturn ? formatPercentage(property.investmentMetrics.totalReturn) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${sleekStyles.text.secondary}`}>Cash Flow Quality</span>
                    <span className={`text-sm font-medium ${(property.investmentMetrics?.cashFlow || 0) > 200 ? 'text-green-500' : (property.investmentMetrics?.cashFlow || 0) > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                      {(property.investmentMetrics?.cashFlow || 0) > 200 ? 'Strong' : (property.investmentMetrics?.cashFlow || 0) > 0 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${sleekStyles.text.secondary}`}>Risk Assessment</span>
                    <span className={`text-sm font-medium ${(property.investmentMetrics?.riskScore || 50) < 30 ? 'text-green-500' : (property.investmentMetrics?.riskScore || 50) < 60 ? 'text-orange-500' : 'text-red-500'}`}>
                      {(property.investmentMetrics?.riskScore || 50) < 30 ? 'Low Risk' : (property.investmentMetrics?.riskScore || 50) < 60 ? 'Medium Risk' : 'High Risk'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Investment Recommendations */}
              <div className={`${sleekStyles.glassMorphism.secondary} p-4 rounded-lg`}>
                <h4 className={`font-semibold ${sleekStyles.text.primary} mb-3`}>AI Recommendations</h4>
                <div className="space-y-2">
                  {property.investmentMetrics?.capRate && property.investmentMetrics.capRate > 7 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${sleekStyles.text.primary}`}>Strong cap rate indicates good income potential</span>
                    </div>
                  )}
                  {property.investmentMetrics?.cashFlow && property.investmentMetrics.cashFlow > 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className={`text-sm ${sleekStyles.text.primary}`}>Positive cash flow from day one</span>
                    </div>
                  )}
                  {property.investmentMetrics?.riskScore && property.investmentMetrics.riskScore > 70 && (
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className={`text-sm ${sleekStyles.text.primary}`}>Consider additional due diligence due to higher risk</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            {property.status !== 'owned' && (
              <GlassButton
                onClick={() => {
                  addToPortfolio({
                    id: property.id,
                    type: 'property',
                    title: property.address,
                    content: `${property.propertyType || 'Property'} - ${property.status}`,
                    location: {
                      lat: property.coordinates[1],
                      lng: property.coordinates[0],
                      zoom: 16
                    },
                    marketData: property.marketData,
                    timestamp: new Date(),
                    selected: false
                  })
                  onAddToPortfolio?.(property)
                }}
                variant="success"
                size="sm"
                icon={<Building2 className="w-4 h-4" />}
                className="flex-1"
              >
                Add to Portfolio
              </GlassButton>
            )}
            
            <GlassButton
              onClick={() => {
                addToWorkspace({
                  id: property.id + '-workspace',
                  type: 'property',
                  title: property.address,
                  content: `${property.propertyType || 'Property'} - ${property.status}`,
                  location: {
                    lat: property.coordinates[1],
                    lng: property.coordinates[0],
                    zoom: 16
                  },
                  marketData: property.marketData,
                  timestamp: new Date(),
                  selected: false
                })
                onAddToWatchlist?.(property)
              }}
              variant="secondary"
              size="sm"
              icon={<Heart className="w-4 h-4" />}
              className="flex-1"
            >
              Watch
            </GlassButton>
            
            <GlassButton
              onClick={() => onCompare?.(property)}
              variant="secondary"
              size="sm"
              icon={<Calculator className="w-4 h-4" />}
              className="flex-1"
            >
              Compare
            </GlassButton>
            
            {onScheduleViewing && (
              <GlassButton
                onClick={() => onScheduleViewing(property)}
                variant="primary"
                size="sm"
                icon={<Calendar className="w-4 h-4" />}
                className="flex-1"
              >
                Schedule
              </GlassButton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PropertyInteractionCard