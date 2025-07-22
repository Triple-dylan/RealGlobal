import React from 'react'
import { 
  PieChart, TrendingUp, Star, Download, BarChart3, 
  Building2, Target, Eye
} from 'lucide-react'
import { useAnimations, AnimatedValue, animationClasses } from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'

interface PortfolioStats {
  totalValue: number
  propertyCount: number
  avgCapRate: number
  occupancyRate: number
  monthlyIncome: number
}

interface PortfolioToolbarProps {
  workspaceItemCount: number
  selectedItemCount: number
  portfolioStats?: PortfolioStats
  onPortfolioView: () => void
  onAnalyze: () => void
  onExport: () => void
  onRecommendations: () => void
}

const PortfolioToolbar: React.FC<PortfolioToolbarProps> = ({
  workspaceItemCount,
  selectedItemCount,
  portfolioStats,
  onPortfolioView,
  onAnalyze,
  onExport,
  onRecommendations
}) => {
  // Initialize animations and glass effects
  useAnimations()
  useGlassEffects()

  // Calculate portfolio performance indicators
  const getPerformanceColor = (rate: number, type: 'cap' | 'occupancy') => {
    if (type === 'cap') {
      return rate >= 8 ? 'text-green-600' : rate >= 6 ? 'text-yellow-600' : 'text-red-600'
    }
    return rate >= 90 ? 'text-green-600' : rate >= 80 ? 'text-yellow-600' : 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-40 ${sleekStyles.glassMorphism.overlay} border-b border-white/30 backdrop-blur-md ${animationClasses.slideDown} ${animationClasses.hoverGlow}`}>
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Portfolio Stats */}
          {portfolioStats && (
            <div className={`flex items-center gap-3 ${animationClasses.slideLeft} ${animationClasses.hoverFloat}`}>
              <div className="text-xs">
                <span className={sleekStyles.text.secondary}>Value:</span>
                <AnimatedValue
                  value={portfolioStats.totalValue}
                  formatter={formatCurrency}
                  className={`ml-1 font-medium ${sleekStyles.text.primary} ${animationClasses.shimmer}`}
                />
              </div>
              <div className="text-xs">
                <span className={sleekStyles.text.secondary}>Properties:</span>
                <AnimatedValue
                  value={portfolioStats.propertyCount}
                  className={`ml-1 font-medium ${sleekStyles.text.primary} ${animationClasses.pulse}`}
                />
              </div>
              <div className="text-xs">
                <span className={sleekStyles.text.secondary}>Cap:</span>
                <AnimatedValue
                  value={portfolioStats.avgCapRate}
                  formatter={(v) => `${v.toFixed(1)}%`}
                  className={`ml-1 font-medium ${getPerformanceColor(portfolioStats.avgCapRate, 'cap')} ${animationClasses.breathe}`}
                />
              </div>
              <div className="text-xs">
                <span className={sleekStyles.text.secondary}>Occ:</span>
                <AnimatedValue
                  value={portfolioStats.occupancyRate}
                  formatter={(v) => `${v.toFixed(0)}%`}
                  className={`ml-1 font-medium ${getPerformanceColor(portfolioStats.occupancyRate, 'occupancy')} ${animationClasses.breathe}`}
                />
              </div>
            </div>
          )}

          {/* Right: Action Buttons */}
          <div className={`flex items-center gap-1 ${animationClasses.slideRight}`}>
            <GlassButton
              onClick={onRecommendations}
              variant="secondary"
              size="sm"
              className={`px-2 py-1.5 text-xs ${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
              icon={<Star className="w-3 h-3" />}
            >
              AI Picks
            </GlassButton>

            {selectedItemCount >= 2 && (
              <GlassButton
                onClick={onAnalyze}
                variant="primary"
                size="sm"
                className={`px-2 py-1.5 text-xs ${animationClasses.hoverFloat} ${animationClasses.buttonPress} ${animationClasses.scaleIn}`}
                icon={<BarChart3 className="w-3 h-3" />}
              >
                Compare {selectedItemCount}
              </GlassButton>
            )}

            <GlassButton
              onClick={onPortfolioView}
              variant="secondary"
              size="sm"
              disabled={workspaceItemCount === 0}
              className={`px-2 py-1.5 text-xs ${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
              icon={<PieChart className="w-3 h-3" />}
            >
              Portfolio
            </GlassButton>

            <GlassButton
              onClick={onExport}
              variant="secondary"
              size="sm"
              disabled={workspaceItemCount === 0}
              className={`px-2 py-1.5 text-xs ${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
              icon={<Download className="w-3 h-3" />}
            >
              Export
            </GlassButton>

          </div>
        </div>

        {/* Performance Bar (when portfolio has properties) */}
        {portfolioStats && portfolioStats.propertyCount > 0 && (
          <div className={`mt-2 pt-2 border-t border-white/20 ${animationClasses.slideUp}`}>
            <div className={`flex items-center justify-between text-xs ${sleekStyles.text.secondary}`}>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>Income: </span>
                  <AnimatedValue
                    value={portfolioStats.monthlyIncome}
                    formatter={formatCurrency}
                    className="font-medium"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-blue-500" />
                  <span>Target: 8.5% Cap</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PortfolioToolbar