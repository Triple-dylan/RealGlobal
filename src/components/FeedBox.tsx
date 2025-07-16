import React, { useState, useEffect } from 'react'
import { FeedItem } from '../types'
import { Edit2, Trash2, ExternalLink, FileText, CheckSquare, Square, MapPin, Building, TrendingUp, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'


interface FeedBoxProps {
  items: FeedItem[]
  title: string
  onTitleChange: (newTitle: string) => void
  onLocationClick: (location: { lat: number; lng: number; zoom: number }) => void
  onCleanup?: () => void
  onItemUpdate?: (items: FeedItem[]) => void
  onPropertyAdd?: (property: FeedItem) => void
}

const FeedBox: React.FC<FeedBoxProps> = ({
  items,
  title,
  onTitleChange,
  onLocationClick,
  onCleanup,
  onItemUpdate,
  onPropertyAdd
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [localItems, setLocalItems] = useState<FeedItem[]>(items)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Sync local items with props when items change
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const handleTitleSubmit = () => {
    onTitleChange(editedTitle)
    setIsEditingTitle(false)
  }

  const toggleItemSelection = (itemId: string) => {
    const updatedItems = localItems.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    )
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank')
  }

  const generateReport = () => {
    const selectedItems = localItems.filter(item => item.selected)
    if (selectedItems.length === 0) {
      console.log('No items selected for report generation')
      return
    }
    
    console.log('Generating report for selected items:', selectedItems)
    
    const reportItem: FeedItem = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'report',
      title: `Commercial Property Report - ${selectedItems.length} Properties`,
      content: `Investment analysis for ${selectedItems.length} commercial properties including cap rates, NOI projections, and market comparables. Properties analyzed: ${selectedItems.map(item => item.title).join(', ')}.`,
      selected: false,
      marketData: {
        averagePrice: selectedItems.reduce((sum, item) => sum + (item.marketData?.averagePrice || 0), 0) / selectedItems.length,
        capRate: selectedItems.reduce((sum, item) => sum + (item.marketData?.capRate || 0), 0) / selectedItems.length,
        vacancy: selectedItems.reduce((sum, item) => sum + (item.marketData?.vacancy || 0), 0) / selectedItems.length
      }
    }
    
    const updatedItems = [...localItems, reportItem]
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'address':
        return <MapPin className="w-3 h-3 text-blue-400" />
      case 'property':
        return <Building className="w-3 h-3 text-green-400" />
      case 'analysis':
        return <TrendingUp className="w-3 h-3 text-purple-400" />
      case 'research':
        return <FileText className="w-3 h-3 text-orange-400" />
      case 'report':
        return <FileText className="w-3 h-3 text-yellow-400" />
      default:
        return <Building className="w-3 h-3 text-gray-400" />
    }
  }

  const removeItem = (itemId: string) => {
    const updatedItems = localItems.filter(item => item.id !== itemId)
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const selectAll = () => {
    const updatedItems = localItems.map(item => ({ ...item, selected: true }))
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const clearSelection = () => {
    const updatedItems = localItems.map(item => ({ ...item, selected: false }))
    setLocalItems(updatedItems)
    onItemUpdate?.(updatedItems)
  }

  const selectedCount = localItems.filter(item => item.selected).length

  const formatMarketData = (marketData: FeedItem['marketData']) => {
    if (!marketData) return null
    
    const dataPoints = []
    
    if (marketData.averagePrice) {
      dataPoints.push({
        icon: <DollarSign className="w-2.5 h-2.5 text-green-400" />,
        label: 'Price',
        value: `$${marketData.averagePrice.toLocaleString()}`
      })
    }
    
    if (marketData.pricePerSqft) {
      dataPoints.push({
        icon: <Building className="w-2.5 h-2.5 text-blue-400" />,
        label: 'PSF',
        value: `$${marketData.pricePerSqft}/sqft`
      })
    }
    
    if (marketData.capRate) {
      dataPoints.push({
        icon: <TrendingUp className="w-2.5 h-2.5 text-purple-400" />,
        label: 'Cap Rate',
        value: `${marketData.capRate.toFixed(1)}%`
      })
    }
    
    if (marketData.vacancy) {
      dataPoints.push({
        icon: <Building className="w-2.5 h-2.5 text-orange-400" />,
        label: 'Vacancy',
        value: `${marketData.vacancy.toFixed(1)}%`
      })
    }
    
    return dataPoints
  }

  const formatContent = (content: string, type: string) => {
    if (type === 'analysis') {
      // Parse and format analysis content
      const sections = content.split(/(?=DEMOGRAPHICS:|COMMERCIAL REAL ESTATE:|INVESTMENT METRICS:|INFRASTRUCTURE:|ZONING:)/)
      
      return sections.map((section, index) => {
        if (section.trim() === '') return null
        
        const lines = section.trim().split('\n').filter(line => line.trim())
        if (lines.length === 0) return null
        
        const header = lines[0]
        const details = lines.slice(1)
        
        return (
          <div key={index} className="mb-2">
            <div className="text-white font-semibold text-[6px] mb-1 flex items-center gap-1">
              {header.includes('DEMOGRAPHICS') && <MapPin className="w-2 h-2" />}
              {header.includes('COMMERCIAL') && <Building className="w-2 h-2" />}
              {header.includes('INVESTMENT') && <TrendingUp className="w-2 h-2" />}
              {header.includes('INFRASTRUCTURE') && <MapPin className="w-2 h-2" />}
              {header.includes('ZONING') && <Building className="w-2 h-2" />}
              {header.replace(':', '')}
            </div>
            <div className="text-gray-300 text-[5px] leading-relaxed pl-3">
              {details.map((detail, i) => (
                <div key={i} className="mb-0.5">
                  {detail.replace(/^• /, '').trim()}
                </div>
              ))}
            </div>
          </div>
        )
      }).filter(Boolean)
    }
    
    return content
  }

  return (
    <div 
      className="fixed top-7 right-3 z-40 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl"
      style={{ 
        width: '340px',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: isCollapsed ? 'auto' : 'calc(100vh - 120px)',
        minHeight: isCollapsed ? 'auto' : '220px',
        padding: '10px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        borderRadius: '18px'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-gray-800/60 text-white px-2 py-1 rounded text-sm font-semibold border border-gray-600/50 focus:outline-none focus:border-blue-500/50"
              style={{ fontSize: '8px' }}
              autoFocus
            />
          ) : (
            <h2 
              className="text-white font-semibold cursor-pointer hover:text-blue-300 transition-colors flex items-center gap-1"
              style={{ fontSize: '8px' }}
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
              <Edit2 className="w-2.5 h-2.5 opacity-60" />
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-800/60 rounded transition-colors text-gray-400 hover:text-blue-400"
            title={isCollapsed ? "Expand" : "Minimize"}
          >
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button
            onClick={generateReport}
            className="p-1 hover:bg-gray-800/60 rounded transition-colors text-green-400 hover:text-green-300"
            title="Generate Report"
          >
            <FileText className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <>
          {/* Action Bar */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700/30 bg-gray-800/30">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs px-2 py-1 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded transition-colors"
                style={{ fontSize: '6px' }}
              >
                Select All
              </button>
              <button
                onClick={clearSelection}
                className="text-xs px-2 py-1 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded transition-colors"
                style={{ fontSize: '6px' }}
              >
                Clear
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-xs" style={{ fontSize: '6px' }}>
                {selectedCount} selected
              </span>
              {selectedCount > 0 && (
                <button
                  onClick={generateReport}
                  className="text-xs px-2 py-1 bg-green-600/80 hover:bg-green-500/80 text-white rounded transition-colors"
                  style={{ fontSize: '6px' }}
                >
                  Generate Report
                </button>
              )}
            </div>
          </div>

          {/* Feed Items */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 240px)' }}>
        {localItems.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-1" style={{ fontSize: '7px' }}>No items in feed</p>
            <p className="text-xs opacity-75" style={{ fontSize: '6px' }}>
              Search for addresses or click on properties to add them here
            </p>
          </div>
        ) : (
          <div className="space-y-2 p-2">
            {localItems.map((item, index) => (
              <div
                key={item.id}
                className={`p-2 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  item.selected 
                    ? 'bg-blue-900/40 border-blue-500/60' 
                    : 'bg-gray-800/60 border-gray-600/40 hover:bg-gray-700/60'
                }`}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleItemSelection(item.id)
                      }}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      {item.selected ? (
                        <CheckSquare className="w-3 h-3 text-blue-400" />
                      ) : (
                        <Square className="w-3 h-3" />
                      )}
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {getItemIcon(item.type)}
                      <h3 
                        className="text-white font-semibold cursor-pointer hover:text-blue-300 transition-colors"
                        style={{ fontSize: '7px' }}
                        onClick={() => item.location && onLocationClick(item.location)}
                      >
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.id)
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Item Content */}
                <div className="ml-5">
                  <p className="text-gray-300 text-xs mb-2" style={{ fontSize: '6px' }}>
                    {item.content}
                  </p>

                  {/* Market Data */}
                  {item.marketData && (
                    <div className="bg-gray-800/50 rounded p-2 mb-2">
                      <h4 className="text-blue-300 font-medium mb-1" style={{ fontSize: '6px' }}>
                        <TrendingUp className="w-2.5 h-2.5 inline mr-1" />
                        Market Data
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {item.marketData.averagePrice && (
                          <div>
                            <span className="text-gray-400" style={{ fontSize: '5px' }}>Avg Price:</span>
                            <div className="text-green-400 font-medium" style={{ fontSize: '6px' }}>
                              ${item.marketData.averagePrice.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {item.marketData.capRate && (
                          <div>
                            <span className="text-gray-400" style={{ fontSize: '5px' }}>Cap Rate:</span>
                            <div className="text-blue-400 font-medium" style={{ fontSize: '6px' }}>
                              {item.marketData.capRate}%
                            </div>
                          </div>
                        )}
                        {item.marketData.vacancy && (
                          <div>
                            <span className="text-gray-400" style={{ fontSize: '5px' }}>Vacancy:</span>
                            <div className="text-orange-400 font-medium" style={{ fontSize: '6px' }}>
                              {item.marketData.vacancy}%
                            </div>
                          </div>
                        )}
                        {item.marketData.occupancyRate && (
                          <div>
                            <span className="text-gray-400" style={{ fontSize: '5px' }}>Occupancy:</span>
                            <div className="text-green-400 font-medium" style={{ fontSize: '6px' }}>
                              {item.marketData.occupancyRate}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* External Links */}
                  {item.listingLinks && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.listingLinks.loopnet && (
                        <a
                          href={item.listingLinks.loopnet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded transition-colors"
                          style={{ fontSize: '5px' }}
                        >
                          <ExternalLink className="w-2 h-2" />
                          LoopNet
                        </a>
                      )}
                      {item.listingLinks.costar && (
                        <a
                          href={item.listingLinks.costar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-600/80 hover:bg-purple-500/80 text-white rounded transition-colors"
                          style={{ fontSize: '5px' }}
                        >
                          <ExternalLink className="w-2 h-2" />
                          CoStar
                        </a>
                      )}
                      {item.listingLinks.crexi && (
                        <a
                          href={item.listingLinks.crexi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-600/80 hover:bg-green-500/80 text-white rounded transition-colors"
                          style={{ fontSize: '5px' }}
                        >
                          <ExternalLink className="w-2 h-2" />
                          CREXI
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

export default FeedBox 