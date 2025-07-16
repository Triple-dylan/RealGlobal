import React, { useState, useEffect, useCallback } from 'react'
import { Edit2, Trash2, ExternalLink, FileText, CheckSquare, Square, MapPin, Building, TrendingUp, DollarSign, ChevronDown, ChevronUp, Filter, BarChart3, Download, Lightbulb, Calculator, PieChart, FileSpreadsheet, Share2, BookOpen } from 'lucide-react'
import { FeedItem } from '../types'

interface GroupedItems {
  [key: string]: FeedItem[]
}

interface EnhancedFeedBoxProps {
  items: FeedItem[]
  title: string
  onTitleChange: (newTitle: string) => void
  onLocationClick: (location: { lat: number; lng: number; zoom: number }) => void
  onCleanup?: () => void
  onItemUpdate?: (items: FeedItem[]) => void
  onPropertyAdd?: (property: FeedItem) => void
  onClose?: () => void
  onAnalysisRequest?: (items: FeedItem[], analysisType: string) => void
}

const EnhancedFeedBox: React.FC<EnhancedFeedBoxProps> = ({
  items,
  title,
  onTitleChange,
  onLocationClick,
  onCleanup,
  onItemUpdate,
  onPropertyAdd,
  onClose,
  onAnalysisRequest
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [localItems, setLocalItems] = useState<FeedItem[]>(items)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grouped' | 'analysis'>('grouped')
  const [filterType, setFilterType] = useState<string>('all')
  const [showInsights, setShowInsights] = useState(true)

  // Sync local items with props when items change
  useEffect(() => {
    setLocalItems(items)
  }, [items])

  // Group items intelligently
  const groupedItems: GroupedItems = useCallback(() => {
    const groups: GroupedItems = {}
    
    localItems.forEach(item => {
      let groupKey = 'Other'
      
      switch (item.type) {
        case 'address':
          groupKey = '📍 Locations'
          break
        case 'property':
          groupKey = '🏢 Properties'
          break
        case 'analysis':
          groupKey = '📊 Market Analysis'
          break
        case 'research':
          groupKey = '🔍 Research'
          break
        case 'report':
          groupKey = '📋 Reports'
          break
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })
    
    return groups
  }, [localItems])()

  // Generate insights based on feed items
  const generateInsights = useCallback(() => {
    const insights = []
    const propertyCount = localItems.filter(item => item.type === 'property').length
    const analysisCount = localItems.filter(item => item.type === 'analysis').length
    const avgCapRate = localItems
      .filter(item => item.marketData?.capRate)
      .reduce((sum, item, _, arr) => sum + (item.marketData!.capRate! / arr.length), 0)

    if (propertyCount > 0) {
      insights.push(`${propertyCount} properties tracked`)
    }
    
    if (analysisCount > 1) {
      insights.push(`${analysisCount} market areas analyzed`)
    }
    
    if (avgCapRate > 0) {
      insights.push(`${avgCapRate.toFixed(1)}% average cap rate`)
    }
    
    if (propertyCount >= 3) {
      insights.push('Ready for comparative analysis')
    }

    return insights
  }, [localItems])

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
  const filteredItems = filterType === 'all' ? localItems : localItems.filter(item => item.type === filterType)

  // Enhanced export functionality
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    const dataToExport = localItems.length > 0 ? localItems : []
    
    switch (format) {
      case 'csv':
        exportToCSV(dataToExport)
        break
      case 'json':
        exportToJSON(dataToExport)
        break
      case 'pdf':
        exportToPDF(dataToExport)
        break
    }
  }

  const exportToCSV = (data: FeedItem[]) => {
    const csvHeaders = ['ID', 'Type', 'Title', 'Content', 'Address', 'Price', 'Cap Rate', 'Vacancy', 'Date Added']
    const csvRows = data.map(item => [
      item.id,
      item.type,
      item.title,
      item.content,
      item.location ? `${item.location.lat}, ${item.location.lng}` : '',
      item.marketData?.averagePrice || '',
      item.marketData?.capRate || '',
      item.marketData?.vacancy || '',
      item.timestamp ? item.timestamp.toLocaleDateString() : ''
    ])

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}_workspace_export.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToJSON = (data: FeedItem[]) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}_workspace_export.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportToPDF = (data: FeedItem[]) => {
    // For now, create a simple HTML report that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Property Research Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .property { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
            .property-title { font-weight: bold; color: #333; margin-bottom: 5px; }
            .property-details { color: #666; font-size: 14px; }
            .market-data { background: #f5f5f5; padding: 10px; margin-top: 10px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
            <p>Total Properties: ${data.length}</p>
          </div>
          ${data.map(item => `
            <div class="property">
              <div class="property-title">${item.title}</div>
              <div class="property-details">${item.content}</div>
              ${item.marketData ? `
                <div class="market-data">
                  <strong>Market Data:</strong><br>
                  ${item.marketData.averagePrice ? `Price: $${item.marketData.averagePrice.toLocaleString()}<br>` : ''}
                  ${item.marketData.capRate ? `Cap Rate: ${item.marketData.capRate}%<br>` : ''}
                  ${item.marketData.vacancy ? `Vacancy: ${item.marketData.vacancy}%<br>` : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}_property_report.html`
    link.click()
    URL.revokeObjectURL(url)
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

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return ''
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isCollapsed) {
    return (
      <div className="fixed top-[58px] right-4 z-40 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl shadow-lg p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed top-[58px] right-4 z-40 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl" style={{minWidth: 340, maxWidth: 'calc(100vw - 2rem)', maxHeight: 'calc(100vh - 120px)'}}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyPress={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="bg-gray-50 text-gray-900 px-2 py-1 rounded text-sm font-semibold border border-gray-300 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h2 
              className="text-gray-900 font-semibold cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-1 text-sm"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
              <Edit2 className="w-3 h-3 opacity-60" />
            </h2>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-blue-600"
            title="Toggle Insights"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-blue-600"
            title="Minimize"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-600 hover:text-red-600"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      {showInsights && generateInsights().length > 0 && (
        <div className="p-3 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Workspace Insights</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {generateInsights().map((insight, index) => (
              <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {insight}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Mode Selector */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="grouped">Grouped</option>
            <option value="list">List</option>
            <option value="analysis">Analysis</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
          >
            <option value="all">All Items</option>
            <option value="property">Properties</option>
            <option value="analysis">Analysis</option>
            <option value="address">Locations</option>
          </select>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">{selectedCount} selected</span>
          {selectedCount > 0 && (
            <button
              onClick={() => onAnalysisRequest?.(localItems.filter(item => item.selected), 'comparative')}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
            >
              Analyze
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {localItems.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-2">No items in workspace</p>
            <p className="text-xs opacity-75">
              Search for addresses, click on zones, or add properties to get started
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="p-3">
            {Object.entries(groupedItems).map(([groupName, groupItems]) => (
              <div key={groupName} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2 sticky top-0 bg-white/90 backdrop-blur-sm py-1">
                  {groupName} ({groupItems.length})
                </h3>
                <div className="space-y-2">
                  {groupItems.map((item) => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onToggleSelection={toggleItemSelection}
                      onRemove={removeItem}
                      onLocationClick={onLocationClick}
                      getIcon={getItemIcon}
                      formatTimestamp={formatTimestamp}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onToggleSelection={toggleItemSelection}
                onRemove={removeItem}
                onLocationClick={onLocationClick}
                getIcon={getItemIcon}
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAll}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              Clear
            </button>
          </div>
          
          <div className="flex items-center gap-1">
            {selectedCount >= 2 && (
              <button
                onClick={() => onAnalysisRequest?.(localItems.filter(item => item.selected), 'comparative')}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                title="Compare selected properties"
              >
                <Calculator className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={() => onAnalysisRequest?.(localItems, 'summary')}
              className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
              disabled={localItems.length === 0}
              title="Generate summary report"
            >
              <BookOpen className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate ItemCard component for better organization
const ItemCard: React.FC<{
  item: FeedItem
  onToggleSelection: (id: string) => void
  onRemove: (id: string) => void
  onLocationClick: (location: { lat: number; lng: number; zoom: number }) => void
  getIcon: (type: string) => React.ReactNode
  formatTimestamp: (timestamp?: Date) => string
}> = ({ item, onToggleSelection, onRemove, onLocationClick, getIcon, formatTimestamp }) => {
  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
      item.selected 
        ? 'bg-blue-50 border-blue-200' 
        : 'bg-white border-gray-200 hover:bg-gray-50'
    }`}>
      {/* Item Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={() => onToggleSelection(item.id)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            {item.selected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          
          <div className="flex items-center gap-2">
            {getIcon(item.type)}
            <h3 
              className="text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => item.location && onLocationClick(item.location)}
            >
              {item.title}
            </h3>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {item.timestamp && (
            <span className="text-xs text-gray-400">
              {formatTimestamp(item.timestamp)}
            </span>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Item Content */}
      <p className="text-xs text-gray-600 mb-2">{item.content}</p>

      {/* Market Data */}
      {item.marketData && (
        <div className="bg-gray-50 rounded p-2 mb-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {item.marketData.capRate && (
              <div>
                <span className="text-gray-500">Cap Rate:</span>
                <div className="text-blue-600 font-medium">{item.marketData.capRate}%</div>
              </div>
            )}
            {item.marketData.vacancy && (
              <div>
                <span className="text-gray-500">Vacancy:</span>
                <div className="text-orange-600 font-medium">{item.marketData.vacancy}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* External Links */}
      {item.listingLinks && (
        <div className="flex flex-wrap gap-1">
          {Object.entries(item.listingLinks).map(([platform, url]) => (
            url && (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
              >
                <ExternalLink className="w-2 h-2" />
                {platform}
              </a>
            )
          ))}
        </div>
      )}
    </div>
  )
}

export default EnhancedFeedBox