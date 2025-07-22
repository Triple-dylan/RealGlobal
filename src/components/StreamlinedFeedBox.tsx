import React, { useState, useEffect } from 'react'
import { 
  ChevronDown, ChevronUp, Building, MapPin, TrendingUp, 
  Calculator, BarChart3, Trash2, CheckSquare, 
  Square, Star, Eye, EyeOff 
} from 'lucide-react'
import { FeedItem } from '../types'
import { 
  useAnimations, 
  animationClasses 
} from './AnimationCSS'
import { GlassButton, sleekStyles, useGlassEffects } from './SleekDesignSystem'

interface StreamlinedFeedBoxProps {
  items: FeedItem[]
  title: string
  onTitleChange: (newTitle: string) => void
  onLocationClick: (location: { lat: number; lng: number; zoom: number }) => void
  onItemUpdate?: (items: FeedItem[]) => void
  onAnalysisRequest?: (items: FeedItem[], analysisType: string) => void
}

const StreamlinedFeedBox: React.FC<StreamlinedFeedBoxProps> = ({
  items,
  title,
  onTitleChange,
  onLocationClick,
  onItemUpdate,
  onAnalysisRequest
}) => {
  const [localItems, setLocalItems] = useState<FeedItem[]>(items)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'workspace' | 'portfolio' | 'analysis'>('workspace')
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Initialize animations and glass effects
  useAnimations()
  useGlassEffects()

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const selectedCount = localItems.filter(item => item.selected).length
  const portfolioItems = localItems.filter(item => item.type === 'property' && item.selected)

  const toggleItemSelection = (itemId: string) => {
    const updatedItems = localItems.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    )
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const removeItem = (itemId: string) => {
    const updatedItems = localItems.filter(item => item.id !== itemId)
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className={`fixed top-[74px] right-4 z-40 ${sleekStyles.glassMorphism.primary} rounded-xl shadow-lg ${animationClasses.slideDown} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth}`}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Building className="w-4 h-4 text-blue-500" />
          <span className={`text-sm font-medium ${sleekStyles.text.primary}`}>{title}</span>
          {localItems.length > 0 && (
            <span className={`${sleekStyles.status.info} text-xs px-2 py-1 rounded-full font-medium ${animationClasses.scaleIn}`}>
              {localItems.length}
            </span>
          )}
          <GlassButton
            onClick={() => setIsMinimized(false)}
            variant="ghost"
            size="sm"
            className={`${animationClasses.hoverScale} ${animationClasses.buttonPress}`}
            icon={<ChevronUp className="w-4 h-4" />}
          >
            Expand
          </GlassButton>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed top-[74px] right-4 z-40 ${sleekStyles.glassMorphism.primary} shadow-xl ${animationClasses.slideLeft} ${animationClasses.hoverGlow} overflow-hidden`} style={{ width: 600, maxHeight: 'calc(100vh - 140px)', borderRadius: '16px 16px 0 0' }}>
      {/* Clean Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-500" />
          <h2 className={`font-medium ${sleekStyles.text.primary} text-sm`}>{title}</h2>
          {localItems.length > 0 && (
            <span className={`${sleekStyles.status.info} text-xs px-2 py-1 rounded-full font-medium ${animationClasses.scaleIn}`}>
              {localItems.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <GlassButton
            onClick={() => setIsMinimized(true)}
            variant="ghost"
            size="sm"
            className={`${animationClasses.hoverScale} ${animationClasses.buttonPress}`}
            icon={<ChevronDown className="w-4 h-4" />}
          >
            Minimize
          </GlassButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/20">
        {[
          { id: 'workspace', label: 'Workspace', icon: Building, count: localItems.length },
          { id: 'portfolio', label: 'Portfolio', icon: Star, count: portfolioItems.length },
          { id: 'analysis', label: 'Analysis', icon: BarChart3, count: selectedCount }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium ${sleekStyles.transitions.smooth} ${sleekStyles.hover.scale} ${animationClasses.clickFeedback} ${
              selectedTab === tab.id 
                ? `${sleekStyles.text.accent} border-b-2 border-blue-500 ${sleekStyles.glassMorphism.secondary}` 
                : `${sleekStyles.text.secondary} hover:${sleekStyles.text.primary} hover:${sleekStyles.glassMorphism.tertiary}`
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedTab === tab.id 
                  ? `${sleekStyles.status.info}` 
                  : `${sleekStyles.glassMorphism.secondary} ${sleekStyles.text.secondary}`
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {localItems.length === 0 ? (
          <div className={`p-6 text-center ${sleekStyles.text.secondary} ${animationClasses.fadeIn}`}>
            <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-2">No items in workspace</p>
            <p className={`text-xs ${sleekStyles.text.muted}`}>
              Search for properties or click on zones to get started
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {localItems.map((item, index) => (
              <div key={item.id} className={`animate-stagger-${Math.min(index + 1, 5)} ${animationClasses.slideUpFade}`}>
                <PropertyCard
                  item={item}
                  isExpanded={expandedItem === item.id}
                  onToggleExpand={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  onToggleSelection={toggleItemSelection}
                  onRemove={removeItem}
                  onLocationClick={onLocationClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Action Bar */}
      {localItems.length > 0 && (
        <div className={`p-3 border-t border-white/20 ${sleekStyles.glassMorphism.secondary}`} style={{ borderRadius: '0 0 16px 16px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedCount > 0 && (
                <span className={`text-xs ${sleekStyles.text.secondary}`}>
                  {selectedCount} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedCount >= 1 && (
                <GlassButton
                  onClick={() => onAnalysisRequest?.(localItems.filter(item => item.selected), 'portfolio_creation')}
                  variant="success"
                  size="sm"
                  className={`${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
                  icon={<Star className="w-3 h-3" />}
                >
                  Add to Portfolio
                </GlassButton>
              )}
              {selectedCount >= 2 && (
                <GlassButton
                  onClick={() => onAnalysisRequest?.(localItems.filter(item => item.selected), 'comparative')}
                  variant="primary"
                  size="sm"
                  className={`${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
                  icon={<Calculator className="w-3 h-3" />}
                >
                  Compare
                </GlassButton>
              )}
              <GlassButton
                onClick={() => onAnalysisRequest?.(localItems, 'summary')}
                variant="secondary"
                size="sm"
                className={`${animationClasses.hoverFloat} ${animationClasses.buttonPress}`}
                icon={<BarChart3 className="w-3 h-3" />}
              >
                Analyze
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Property Card with Progressive Disclosure
const PropertyCard: React.FC<{
  item: FeedItem
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleSelection: (id: string) => void
  onRemove: (id: string) => void
  onLocationClick: (location: { lat: number; lng: number; zoom: number }) => void
}> = ({ item, isExpanded, onToggleExpand, onToggleSelection, onRemove, onLocationClick }) => {
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'property': return <Building className="w-3 h-3 text-green-500" />
      case 'analysis': return <TrendingUp className="w-3 h-3 text-blue-500" />
      case 'address': return <MapPin className="w-3 h-3 text-purple-500" />
      default: return <Building className="w-3 h-3 text-gray-400" />
    }
  }

  return (
    <div className={`rounded-lg border ${sleekStyles.transitions.smooth} ${sleekStyles.hover.lift} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth} ${
      item.selected 
        ? `${sleekStyles.status.info} shadow-sm` 
        : `${sleekStyles.glassMorphism.secondary} hover:${sleekStyles.glassMorphism.primary} hover:shadow-sm`
    }`}>
      {/* Card Header */}
      <div className="flex items-start justify-between p-3">
        <div className="flex items-start gap-3 flex-1">
          <GlassButton
            onClick={() => onToggleSelection(item.id)}
            variant="ghost"
            size="sm"
            className={`mt-0.5 p-1 ${animationClasses.clickFeedback} ${animationClasses.ultraSmooth}`}
            icon={item.selected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          >
            Select
          </GlassButton>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getItemIcon(item.type)}
              <h3 
                className={`text-sm font-medium ${sleekStyles.text.primary} cursor-pointer hover:${sleekStyles.text.accent} ${animationClasses.ultraSmooth} ${animationClasses.hoverFloat} truncate`}
                onClick={() => item.location && onLocationClick(item.location)}
              >
                {item.title}
              </h3>
            </div>
            <p className={`text-xs ${sleekStyles.text.secondary} line-clamp-2`}>{item.content}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-2">
          {item.marketData && (
            <GlassButton
              onClick={onToggleExpand}
              variant="ghost"
              size="sm"
              className={`${animationClasses.hoverScale} ${animationClasses.clickFeedback}`}
              icon={isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </GlassButton>
          )}
          <GlassButton
            onClick={() => onRemove(item.id)}
            variant="ghost"
            size="sm"
            className={`hover:text-red-600 ${animationClasses.hoverScale} ${animationClasses.clickFeedback}`}
            icon={<Trash2 className="w-3 h-3" />}
          >
            Remove
          </GlassButton>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && item.marketData && (
        <div className={`px-3 pb-3 border-t border-white/20 pt-3 mt-3 ${animationClasses.slideDown}`}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {item.marketData.averagePrice && (
              <div className={`${sleekStyles.glassMorphism.tertiary} rounded p-2 ${sleekStyles.hover.scale} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth}`}>
                <span className={`${sleekStyles.text.secondary} block`}>Price</span>
                <span className={`${sleekStyles.text.primary} font-medium`}>
                  ${item.marketData.averagePrice.toLocaleString()}
                </span>
              </div>
            )}
            {item.marketData.capRate && (
              <div className={`${sleekStyles.glassMorphism.tertiary} rounded p-2 ${sleekStyles.hover.scale} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth}`}>
                <span className={`${sleekStyles.text.secondary} block`}>Cap Rate</span>
                <span className="text-green-600 font-medium">{item.marketData.capRate}%</span>
              </div>
            )}
            {item.marketData.vacancy && (
              <div className={`${sleekStyles.glassMorphism.tertiary} rounded p-2 ${sleekStyles.hover.scale} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth}`}>
                <span className={`${sleekStyles.text.secondary} block`}>Vacancy</span>
                <span className="text-orange-600 font-medium">{item.marketData.vacancy}%</span>
              </div>
            )}
            {item.marketData.pricePerSqft && (
              <div className={`${sleekStyles.glassMorphism.tertiary} rounded p-2 ${sleekStyles.hover.scale} ${animationClasses.hoverFloat} ${animationClasses.ultraSmooth}`}>
                <span className={`${sleekStyles.text.secondary} block`}>Price/sqft</span>
                <span className={`${sleekStyles.text.primary} font-medium`}>
                  ${item.marketData.pricePerSqft}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamlinedFeedBox