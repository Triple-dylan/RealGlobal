import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, Target, PieChart, BarChart3, 
  AlertTriangle, Shield, DollarSign, MapPin, ArrowUpRight, ArrowDownRight,
  Info, Zap, Award, Eye, ChevronRight
} from 'lucide-react'
import { useAnimations, AnimatedValue, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'
import { usePortfolio } from './PortfolioSystem'

interface MetricCardProps {
  title: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  color: 'green' | 'blue' | 'orange' | 'red' | 'purple'
  size?: 'sm' | 'md' | 'lg'
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  trend,
  trendValue,
  icon,
  color,
  size = 'md'
}) => {
  const colorClasses = {
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
  }

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  }

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-3 h-3 text-green-500" />
    if (trend === 'down') return <ArrowDownRight className="w-3 h-3 text-red-500" />
    return null
  }

  return (
    <div className={`${sleekStyles.glassMorphism.primary} ${sizeClasses[size]} rounded-xl border ${sleekStyles.transitions.smooth} ${sleekStyles.hover.lift} ${animationClasses.slideUp}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className={`text-xs font-medium ${sleekStyles.text.secondary}`}>{title}</h3>
        <div className={`text-xl font-bold ${sleekStyles.text.primary}`}>
          {typeof value === 'number' ? (
            <AnimatedValue value={value} />
          ) : (
            value
          )}
        </div>
        {subValue && (
          <p className={`text-xs ${sleekStyles.text.muted}`}>{subValue}</p>
        )}
      </div>
    </div>
  )
}

interface RiskGaugeProps {
  score: number
  title: string
  max?: number
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ score, title, max = 100 }) => {
  const percentage = Math.min((score / max) * 100, 100)
  const getRiskColor = () => {
    if (percentage < 30) return 'text-green-500 border-green-500'
    if (percentage < 60) return 'text-orange-500 border-orange-500'
    return 'text-red-500 border-red-500'
  }

  const getRiskLevel = () => {
    if (percentage < 30) return 'Low'
    if (percentage < 60) return 'Medium'
    return 'High'
  }

  return (
    <div className={`${sleekStyles.glassMorphism.secondary} p-4 rounded-lg ${animationClasses.slideUp}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm font-medium ${sleekStyles.text.primary}`}>{title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor()}`}>
          {getRiskLevel()}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              percentage < 30 ? 'bg-green-500' : 
              percentage < 60 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-2">
          <span className={sleekStyles.text.muted}>0</span>
          <span className={`font-medium ${sleekStyles.text.primary}`}>
            {score.toFixed(1)}
          </span>
          <span className={sleekStyles.text.muted}>{max}</span>
        </div>
      </div>
    </div>
  )
}

const PortfolioAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'performance' | 'diversification'>('overview')
  const { portfolioStats, generatePortfolioReport } = usePortfolio()
  
  useAnimations()
  useGlassEffects()

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <PieChart className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'risk', label: 'Risk Analysis', icon: <Shield className="w-4 h-4" /> },
    { id: 'diversification', label: 'Diversification', icon: <MapPin className="w-4 h-4" /> }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${sleekStyles.text.primary}`}>Portfolio Analytics</h1>
          <p className={`text-sm ${sleekStyles.text.secondary}`}>Advanced performance and risk analysis</p>
        </div>
        <GlassButton
          onClick={() => {
            const report = generatePortfolioReport()
            navigator.clipboard.writeText(report)
          }}
          variant="primary"
          icon={<BarChart3 className="w-4 h-4" />}
        >
          Export Report
        </GlassButton>
      </div>

      {/* Tab Navigation */}
      <div className={`${sleekStyles.glassMorphism.primary} p-1 rounded-xl ${animationClasses.slideDown}`}>
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? `${sleekStyles.status.info} ${sleekStyles.text.accent}`
                  : `${sleekStyles.text.secondary} hover:${sleekStyles.glassMorphism.secondary}`
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Value"
            value={formatCurrency(portfolioStats.totalValue)}
            subValue={`${portfolioStats.propertyCount} properties`}
            trend="up"
            trendValue="+5.2%"
            icon={<DollarSign className="w-5 h-5" />}
            color="green"
            size="lg"
          />
          
          <MetricCard
            title="Monthly Income"
            value={formatCurrency(portfolioStats.monthlyIncome)}
            subValue={`${formatCurrency(portfolioStats.totalIncome)}/year`}
            trend="up"
            trendValue="+3.1%"
            icon={<TrendingUp className="w-5 h-5" />}
            color="blue"
          />
          
          <MetricCard
            title="Average Cap Rate"
            value={formatPercentage(portfolioStats.avgCapRate)}
            subValue="vs 6.5% market avg"
            trend={portfolioStats.avgCapRate > 6.5 ? 'up' : 'down'}
            trendValue={`${portfolioStats.avgCapRate > 6.5 ? '+' : ''}${(portfolioStats.avgCapRate - 6.5).toFixed(1)}%`}
            icon={<Target className="w-5 h-5" />}
            color="purple"
          />
          
          <MetricCard
            title="Occupancy Rate"
            value={formatPercentage(portfolioStats.occupancyRate)}
            subValue="vs 90% target"
            trend={portfolioStats.occupancyRate > 90 ? 'up' : 'down'}
            trendValue={`${portfolioStats.occupancyRate > 90 ? '+' : ''}${(portfolioStats.occupancyRate - 90).toFixed(1)}%`}
            icon={<Activity className="w-5 h-5" />}
            color="orange"
          />
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Annualized Return"
                value={formatPercentage(portfolioStats.annualizedReturn)}
                subValue="Total return on investment"
                trend={portfolioStats.annualizedReturn > 8 ? 'up' : 'down'}
                trendValue={`vs 8% target`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="green"
              />
              
              <MetricCard
                title="Risk-Adjusted Return"
                value={formatPercentage(portfolioStats.riskAdjustedReturn)}
                subValue="Alpha generation"
                trend={portfolioStats.riskAdjustedReturn > 0 ? 'up' : 'down'}
                trendValue={portfolioStats.riskAdjustedReturn > 0 ? 'Positive α' : 'Negative α'}
                icon={<Award className="w-5 h-5" />}
                color="blue"
              />
              
              <MetricCard
                title="Sharpe Ratio"
                value={portfolioStats.sharpeRatio.toFixed(2)}
                subValue="Risk-adjusted performance"
                trend={portfolioStats.sharpeRatio > 0.5 ? 'up' : 'down'}
                trendValue={portfolioStats.sharpeRatio > 0.5 ? 'Excellent' : 'Below avg'}
                icon={<Zap className="w-5 h-5" />}
                color="purple"
              />
              
              <MetricCard
                title="Portfolio Beta"
                value={portfolioStats.portfolioBeta.toFixed(2)}
                subValue="Market sensitivity"
                trend={portfolioStats.portfolioBeta < 1.2 ? 'up' : 'down'}
                trendValue={portfolioStats.portfolioBeta < 1 ? 'Defensive' : 'Aggressive'}
                icon={<Activity className="w-5 h-5" />}
                color="orange"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className={`${sleekStyles.glassMorphism.primary} p-6 rounded-xl ${animationClasses.slideLeft}`}>
              <h3 className={`text-lg font-semibold ${sleekStyles.text.primary} mb-4`}>Performance Benchmarks</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${sleekStyles.text.secondary}`}>vs REIT Index</span>
                  <span className={`font-medium ${portfolioStats.annualizedReturn > 8.5 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolioStats.annualizedReturn > 8.5 ? '+' : ''}{(portfolioStats.annualizedReturn - 8.5).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${sleekStyles.text.secondary}`}>vs Treasury Bills</span>
                  <span className="font-medium text-green-500">
                    +{(portfolioStats.annualizedReturn - 4.5).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${sleekStyles.text.secondary}`}>Risk Premium</span>
                  <span className={`font-medium ${portfolioStats.sharpeRatio > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {portfolioStats.sharpeRatio.toFixed(2)}x
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Analysis Tab */}
      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${sleekStyles.text.primary}`}>Risk Metrics</h3>
            
            <RiskGauge
              score={portfolioStats.riskMetrics.overallRiskScore}
              title="Overall Risk Score"
            />
            
            <RiskGauge
              score={portfolioStats.riskMetrics.concentrationRisk}
              title="Concentration Risk"
            />
            
            <RiskGauge
              score={portfolioStats.riskMetrics.liquidityRisk}
              title="Liquidity Risk"
            />
            
            <RiskGauge
              score={portfolioStats.volatility}
              title="Portfolio Volatility"
              max={25}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${sleekStyles.text.primary}`}>Risk Breakdown</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <MetricCard
                title="Maximum Drawdown"
                value={formatPercentage(portfolioStats.maxDrawdown)}
                subValue="Worst-case scenario"
                trend={portfolioStats.maxDrawdown < 20 ? 'up' : 'down'}
                trendValue={portfolioStats.maxDrawdown < 20 ? 'Acceptable' : 'High risk'}
                icon={<AlertTriangle className="w-5 h-5" />}
                color={portfolioStats.maxDrawdown < 20 ? 'green' : 'red'}
              />
              
              <MetricCard
                title="Market Risk"
                value={portfolioStats.riskMetrics.marketRisk.toFixed(1)}
                subValue="Beta-adjusted exposure"
                icon={<TrendingDown className="w-5 h-5" />}
                color="orange"
              />
            </div>
            
            <div className={`${sleekStyles.glassMorphism.secondary} p-4 rounded-lg ${animationClasses.slideUp}`}>
              <h4 className={`text-sm font-medium ${sleekStyles.text.primary} mb-3`}>Risk Assessment</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${portfolioStats.riskMetrics.overallRiskScore < 40 ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className={`text-xs ${sleekStyles.text.secondary}`}>
                    {portfolioStats.riskMetrics.overallRiskScore < 40 ? 'Low to moderate risk profile' : 'Elevated risk requires attention'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${portfolioStats.sharpeRatio > 0.3 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-xs ${sleekStyles.text.secondary}`}>
                    {portfolioStats.sharpeRatio > 0.3 ? 'Adequate risk compensation' : 'Insufficient risk premium'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diversification Tab */}
      {activeTab === 'diversification' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${sleekStyles.text.primary}`}>Geographic Distribution</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="Cities"
                value={portfolioStats.geographicDiversification.citiesCount}
                subValue="Geographic spread"
                icon={<MapPin className="w-5 h-5" />}
                color="blue"
                size="sm"
              />
              
              <MetricCard
                title="Regions"
                value={portfolioStats.geographicDiversification.statesCount}
                subValue="Regional diversity"
                icon={<MapPin className="w-5 h-5" />}
                color="purple"
                size="sm"
              />
            </div>
            
            <RiskGauge
              score={portfolioStats.geographicDiversification.herfindahlIndex}
              title="Geographic Diversification"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${sleekStyles.text.primary}`}>Property Type Mix</h3>
            
            <MetricCard
              title="Property Types"
              value={portfolioStats.propertyTypeDiversification.typesCount}
              subValue="Asset class diversity"
              icon={<PieChart className="w-5 h-5" />}
              color="green"
              size="sm"
            />
            
            <RiskGauge
              score={portfolioStats.propertyTypeDiversification.distributionBalance}
              title="Type Distribution Balance"
            />
            
            <div className={`${sleekStyles.glassMorphism.secondary} p-4 rounded-lg ${animationClasses.slideUp}`}>
              <h4 className={`text-sm font-medium ${sleekStyles.text.primary} mb-3`}>Diversification Score</h4>
              <div className="text-center">
                <div className={`text-3xl font-bold ${sleekStyles.text.primary}`}>
                  {portfolioStats.diversificationScore.toFixed(0)}/100
                </div>
                <p className={`text-xs ${sleekStyles.text.muted}`}>
                  {portfolioStats.diversificationScore > 70 ? 'Well diversified' : 
                   portfolioStats.diversificationScore > 40 ? 'Moderately diversified' : 'Concentration risk'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PortfolioAnalyticsDashboard