import React, { useRef, useState, useEffect, useCallback } from 'react'
import { FilterState, FeedItem } from './types'
import FiltersPanel from './components/FiltersPanel'
import FloatingChatSearchBar from './components/FloatingChatSearchBar'
import ErrorBoundary from './components/ErrorBoundary'
import MapboxGlobe from './components/MapboxGlobe'
import PortfolioToolbar from './components/PortfolioToolbar'
import StreamlinedFeedBox from './components/StreamlinedFeedBox'
import PropertyRecommendations from './components/PropertyRecommendations'
import { PortfolioProvider, usePortfolio } from './components/PortfolioSystem'
import PropertyPillarOverlay from './components/PropertyPillarOverlay'
import { PropertyListing } from './services/propertyData'
import { marketAnalysisService } from './services/marketAnalysis'
import { FreePropertyListing } from './services/freePropertyData'



// Main App component wrapped with portfolio context  
const AppContent: React.FC = React.memo(() => {
  const [filters, setFilters] = useState<FilterState>({
    zoning: [],
    economic: [],
    opportunityScore: 0,
    economicIndicator: 'gdp-growth',
    economicOverlayEnabled: true,
    propertyTypes: [],
    propertyListingsEnabled: false
  })
  const [loading] = useState(false)
  const [feedTitle, setFeedTitle] = useState('New Research')
  const [isFeedVisible, setIsFeedVisible] = useState(true)
  const [isMapReady, setIsMapReady] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showFilters] = useState(true)
  
  // Use portfolio context
  const {
    workspaceItems,
    portfolioItems,
    portfolioStats,
    addToWorkspace,
    addToPortfolio,
    removeFromWorkspace,
    getPortfolioPillars,
    generatePortfolioReport
  } = usePortfolio()

  // Ref to access MapboxGlobe's map
  const mapboxGlobeRef = useRef<any>(null)

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])





  // Function to clean up duplicate feed items
  const cleanupDuplicateFeeds = () => {
    // Use workspaceItems from portfolio context instead of local state
    const seen = new Set();
    const uniqueItems = workspaceItems.filter(item => {
      const key = `${item.type}-${item.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    
    // Update workspace items if there were duplicates
    if (uniqueItems.length !== workspaceItems.length) {
      // This would need to be handled by the portfolio context
      console.log('Cleaned up duplicate feed items');
    }
  };

  // Clean up duplicates on mount
  useEffect(() => {
    cleanupDuplicateFeeds();
  }, [workspaceItems]);


  const handleAddressDetected = async (address: string, coordinates: { lat: number; lng: number }) => {
    console.log('Address detected:', address, coordinates);
    
    try {
      // Get real market analysis data
      const marketAnalysis = await marketAnalysisService.getMarketAnalysis(address, coordinates);
      const analysisContent = marketAnalysisService.formatAnalysisContent(marketAnalysis);
      
      // Create address item for the search with real coordinates
      const addressItem: FeedItem = {
        id: `address-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'address',
        title: address,
        content: `Click to navigate to ${address}`,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: 14
        }
      };
      
      // Create market analysis item with real data
      const analysisItem: FeedItem = {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'analysis',
        title: `${address} Market Analysis`,
        content: analysisContent,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: 12
        },
        marketData: {
          averagePrice: marketAnalysis.realEstate.averageCommercialRent * 1000, // Convert to rough property price
          pricePerSqft: marketAnalysis.realEstate.averageCommercialRent,
          capRate: marketAnalysis.investment.averageCapRate,
          occupancyRate: 100 - marketAnalysis.realEstate.vacancyRate,
          vacancy: marketAnalysis.realEstate.vacancyRate
        }
      };
      
      // Update feed title to reflect the location for workspace organization
      const newTitle = `${address.split(',')[0]} Research`;
      setFeedTitle(newTitle);
      
      // Add both items to workspace using portfolio context
      addToWorkspace(addressItem);
      addToWorkspace(analysisItem);
      console.log('Added items to workspace');
      
      // Always show the feed when a search is made to create workspace tab effect
      console.log('Showing feed box for workspace tab');
      setIsFeedVisible(true);

      // Fly to the location
      if (mapboxGlobeRef.current?.flyToLocation && isMapReady) {
        try {
          const success = mapboxGlobeRef.current.flyToLocation(coordinates, 14);
          if (!success) {
            console.error('Failed to fly to location');
          }
        } catch (error) {
          console.error('Error during flyTo:', error);
        }
      } else {
        console.error('Map not ready for flyTo');
      }
    } catch (error) {
      console.error('Error getting market analysis:', error);
      
      // Fallback to basic items if market analysis fails
      const addressItem: FeedItem = {
        id: `address-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'address',
        title: address,
        content: `Click to navigate to ${address}`,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: 14
        }
      };
      
      const analysisItem: FeedItem = {
        id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'analysis',
        title: `${address} Market Analysis`,
        content: `Market analysis for ${address} is being prepared. Please check back later for detailed commercial real estate insights.`,
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: 12
        }
      };
      
      addToWorkspace(addressItem);
      addToWorkspace(analysisItem);
      setIsFeedVisible(true);
    }
  }

  const handleLocationClick = useCallback((location: { lat: number; lng: number; zoom: number }) => {
    if (mapboxGlobeRef.current?.flyToLocation && isMapReady) {
      mapboxGlobeRef.current.flyToLocation(location, location.zoom)
    }
  }, [isMapReady])

  const handleMapReady = useCallback(() => {
    setIsMapReady(true)
  }, [])

  const handleMapRightClick = useCallback(async (coordinates: { lat: number; lng: number }, address: string) => {
    const propertyData = {
      address,
      propertyType: 'Unknown',
      coordinates,
      price: null,
      sqft: null,
      pricePerSqft: null,
      capRate: null,
      occupancyRate: null
    }

    // Create portfolio property item
    const portfolioProperty: FeedItem = {
      id: `map-portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'property',
      title: address,
      content: `🎯 **MANUALLY ADDED PROPERTY**

📍 **Location:**
• Address: ${address}
• Coordinates: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}
• Status: Owned

✏️ **Next Steps:**
• Add property details (price, type, size)
• Upload property documents
• Set performance tracking alerts

Added via map interaction - right-click to add more properties.`,
      location: {
        lat: coordinates.lat,
        lng: coordinates.lng,
        zoom: 16
      },
      portfolioStatus: 'owned'
    }

    // Add to portfolio through context
    addToPortfolio(portfolioProperty)
    addToWorkspace(portfolioProperty)
    
    // Show the feed
    setIsFeedVisible(true)
    setFeedTitle(`${address.split(',')[0]} Property`)
    
    console.log('Added property from map click:', address)
  }, [addToPortfolio, addToWorkspace])

  const handlePropertyClick = async (property: PropertyListing) => {
    console.log('Property clicked:', property);
    
    // Generate comprehensive property analysis
    const generatePropertyAnalysis = (prop: PropertyListing) => {
      const capRate = prop.capRate || 0;
      const pricePerSqft = prop.pricePerSqft || 0;
      const occupancy = prop.occupancyRate || 90;
      
      const investmentGrade = capRate > 7 ? 'Excellent' : capRate > 5 ? 'Good' : capRate > 3 ? 'Fair' : 'Poor';
      const marketPosition = pricePerSqft > 200 ? 'Premium' : pricePerSqft > 100 ? 'Mid-Market' : 'Value';
      
      const riskLevel = occupancy > 95 ? 'Low' : occupancy > 85 ? 'Medium' : 'High';
      const cashFlowProjection = prop.price ? (prop.price * (capRate / 100)) / 12 : 0;
      
      return `
📊 **INVESTMENT ANALYSIS**

🏢 **Property Overview:**
• Type: ${prop.type} • Size: ${prop.squareFootage || 'N/A'} sq ft
• Price: $${prop.price?.toLocaleString() || 'N/A'} • Cap Rate: ${capRate}%
• Occupancy: ${occupancy}% • Price/sqft: $${pricePerSqft}

💰 **Financial Metrics:**
• Investment Grade: ${investmentGrade}
• Market Position: ${marketPosition}  
• Risk Level: ${riskLevel}
• Est. Monthly Cash Flow: $${cashFlowProjection.toLocaleString()}
• Annual NOI: $${(cashFlowProjection * 12).toLocaleString()}

📈 **Market Analysis:**
• Neighborhood demand trending ${Math.random() > 0.5 ? 'upward' : 'stable'}
• Comparable properties: $${(pricePerSqft * 0.9).toFixed(0)}-$${(pricePerSqft * 1.1).toFixed(0)}/sqft
• Market velocity: ${Math.random() > 0.7 ? 'Fast' : Math.random() > 0.4 ? 'Moderate' : 'Slow'}

🎯 **Investment Recommendation:**
${capRate > 6 && occupancy > 90 ? '✅ STRONG BUY - Excellent fundamentals' : 
  capRate > 4 && occupancy > 80 ? '👍 CONSIDER - Good potential with manageable risk' : 
  '⚠️ CAUTION - Review carefully before proceeding'}
      `;
    };
    
    // Create property item for the feed with comprehensive analysis
    const propertyItem: FeedItem = {
      id: `property-${property.id}-${Date.now()}`,
      type: 'property',
      title: property.address,
      content: generatePropertyAnalysis(property),
      location: {
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
        zoom: 16
      },
      listingLinks: {
        loopnet: property.listingUrl,
        costar: property.listingUrl,
        crexi: property.listingUrl
      },
      marketData: {
        averagePrice: property.price,
        pricePerSqft: property.pricePerSqft,
        capRate: property.capRate,
        occupancyRate: property.occupancyRate
      }
    }
    
    // Add property to workspace
    addToWorkspace(propertyItem);
    console.log('Added property analysis to workspace');
    
    // Show the feed if it's not visible
    if (!isFeedVisible) {
      console.log('Showing feed box for property');
      setIsFeedVisible(true);
    }
  }



  // Handle zone clicks from overlays
  const handleZoneClick = async (zone: any) => {
    console.log('Zone clicked in App:', zone)
    
    // Create zone analysis feed item
    const zoneItem: FeedItem = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'analysis',
      title: `${zone.name} - ${zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone`,
      content: `Commercial zone analysis: ${zone.properties.zoning} zoning with ${zone.properties.vacancy}% vacancy and $${zone.properties.averageRent}/sqft average rent. Market trend: ${zone.market.demandTrend}.`,
      location: {
        lat: zone.geometry.coordinates[0][0][1],
        lng: zone.geometry.coordinates[0][0][0],
        zoom: 14
      },
      marketData: {
        averagePrice: zone.market.pricePerSqft * 1000, // Rough estimate
        pricePerSqft: zone.market.pricePerSqft,
        capRate: zone.market.averageCapRate,
        vacancy: zone.properties.vacancy
      }
    }
    
    // Add to workspace
    addToWorkspace(zoneItem)
    setIsFeedVisible(true)
    
    // Update feed title to reflect the zone
    setFeedTitle(`${zone.name} Research`)
  }

  // Handle free property search results
  const handlePropertySearchResults = (properties: FreePropertyListing[]) => {
    console.log('Processing property search results:', properties)
    
    const propertyItems: FeedItem[] = properties.map(property => ({
      id: `free-property-${property.id}-${Date.now()}`,
      type: 'property',
      title: property.address,
      content: `${property.propertyType} property from ${property.source} • ${property.country}`,
      location: {
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
        zoom: 16
      },
      marketData: {
        averagePrice: property.price,
        pricePerSqft: property.price && property.sqft ? Math.round(property.price / property.sqft) : undefined,
        zestimate: property.zestimate,
        lastSoldPrice: property.lastSoldPrice
      },
      timestamp: new Date(),
      selected: false,
      listingLinks: {
        zillow: property.source === 'zillow' ? `https://zillow.com/property/${property.id}` : undefined
      }
    }))
    
    // Add all found properties to workspace via portfolio system
    propertyItems.forEach(item => addToWorkspace(item))
    setIsFeedVisible(true)
    
    // Update feed title to reflect the search
    setFeedTitle(`Property Search Results (${properties.length} found)`)
    
    console.log(`Added ${propertyItems.length} properties to workspace`)
  }

  // Handle analysis requests from enhanced feed
  const handleAnalysisRequest = async (items: FeedItem[], analysisType: string) => {
    console.log('Analysis requested:', analysisType, items)
    
    let reportContent = ''
    let reportTitle = ''
    
    switch (analysisType) {
      case 'portfolio_creation':
        // Add selected properties to portfolio
        items.forEach(item => {
          if (item.type === 'property') {
            addToPortfolio(item);
          }
        });
        
        reportTitle = '✅ Portfolio Updated'
        reportContent = `Successfully added ${items.length} properties to your portfolio!

📊 **Portfolio Summary:**
• Total properties: ${portfolioItems.length + items.length}
• New additions: ${items.length}
• Investment value: $${items.reduce((sum, item) => sum + (item.marketData?.averagePrice || 0), 0).toLocaleString()}

🎯 **Next Steps:**
• Review portfolio diversification
• Set up performance tracking
• Configure alerts for market changes
• Generate detailed portfolio report

Your properties are now being tracked for performance metrics and market analysis.`
        break
      case 'comparative':
        reportTitle = 'Property Comparison Analysis'
        reportContent = `
📊 **COMPARATIVE ANALYSIS**

Analyzed ${items.length} properties for investment comparison:

${items.map((item, index) => `
**Property ${index + 1}: ${item.title}**
• Cap Rate: ${item.marketData?.capRate || 'N/A'}%
• Price: $${item.marketData?.averagePrice?.toLocaleString() || 'N/A'}
• Price/sqft: $${item.marketData?.pricePerSqft || 'N/A'}
• Risk Level: ${item.marketData?.occupancyRate && item.marketData.occupancyRate > 90 ? 'Low' : 'Medium'}
`).join('')}

🏆 **Recommendation:**
${items.length > 0 ? `Property with highest cap rate: ${items.sort((a, b) => (b.marketData?.capRate || 0) - (a.marketData?.capRate || 0))[0]?.title}` : 'No properties to compare'}

💡 **Key Insights:**
• Average cap rate: ${items.length > 0 ? (items.reduce((sum, item) => sum + (item.marketData?.capRate || 0), 0) / items.length).toFixed(2) : 0}%
• Price range: $${Math.min(...items.map(item => item.marketData?.averagePrice || 0)).toLocaleString()} - $${Math.max(...items.map(item => item.marketData?.averagePrice || 0)).toLocaleString()}
• Geographic spread: ${new Set(items.map(item => item.title.split(',').pop()?.trim())).size} different areas`
        break
      case 'portfolio':
        reportTitle = 'Portfolio Analysis Report'
        reportContent = `Portfolio analysis of ${items.length} properties. Includes diversification analysis, risk assessment, cash flow projections, and optimization recommendations.`
        break
      case 'summary':
        reportTitle = 'Workspace Summary Report'
        reportContent = `Summary analysis of ${items.length} items including properties, zones, and market data. Generated comprehensive report with insights and recommendations.`
        break
      default:
        reportTitle = 'Analysis Report'
        reportContent = `Analysis of ${items.length} items with detailed insights and recommendations.`
    }
    
    // Create analysis report feed item
    const reportItem: FeedItem = {
      id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'report',
      title: reportTitle,
      content: reportContent,
      selected: false,
      timestamp: new Date()
    }
    
    addToWorkspace(reportItem)
    
    // Could trigger AI analysis here in the future
    console.log('Generated analysis report for items:', items)
  }


  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Portfolio-Focused Toolbar */}
        <PortfolioToolbar
          workspaceItemCount={workspaceItems.length}
          selectedItemCount={workspaceItems.filter(item => item.selected).length}
          portfolioStats={portfolioStats}
          onPortfolioView={() => handleAnalysisRequest(workspaceItems, 'portfolio')}
          onAnalyze={() => handleAnalysisRequest(workspaceItems.filter(item => item.selected), 'comparative')}
          onExport={() => {
            // Generate and download portfolio report
            const report = generatePortfolioReport()
            const blob = new Blob([report], { type: 'text/markdown' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `portfolio_report_${new Date().toISOString().split('T')[0]}.md`
            link.click()
            URL.revokeObjectURL(url)
          }}
          onRecommendations={() => setShowRecommendations(true)}
        />

        {/* Mapbox Globe as full background */}
        <MapboxGlobe 
          ref={mapboxGlobeRef} 
          filters={filters} 
          onReady={handleMapReady}
          onPropertyClick={handlePropertyClick}
          onZoneClick={handleZoneClick}
          onMapRightClick={handleMapRightClick}
        />
        
        {/* Main content with top spacing for fixed action bar */}
        <div className="absolute inset-0 pt-20 h-full pointer-events-none"> {/* Increased spacing for new toolbar */}
          
          {/* Property Pillar Overlay */}
          {isMapReady && mapboxGlobeRef.current?.map && (
            <PropertyPillarOverlay
              map={mapboxGlobeRef.current.map}
              properties={getPortfolioPillars()}
              visible={true}
              onPropertyClick={(pillar) => {
                // Find the corresponding portfolio item
                const portfolioItem = portfolioItems.find(item => item.id === pillar.id)
                if (portfolioItem && portfolioItem.location) {
                  handleLocationClick(portfolioItem.location)
                }
              }}
            />
          )}
          
          {showFilters && (
            <div className="pointer-events-auto">
              <FiltersPanel 
                onFiltersChange={handleFiltersChange} 
                initialFilters={filters} 
                map={mapboxGlobeRef.current?.map}
                loading={loading}
              />
            </div>
          )}
          
          {isFeedVisible && (
            <div className="pointer-events-auto">
              <StreamlinedFeedBox
                items={workspaceItems}
                title={feedTitle}
                onTitleChange={setFeedTitle}
                onLocationClick={handleLocationClick}
                onItemUpdate={(updatedItems) => {
                // Update workspace items through portfolio system
                const currentIds = new Set(workspaceItems.map(item => item.id))
                const newIds = new Set(updatedItems.map(item => item.id))
                
                // Remove items that are no longer in the list
                currentIds.forEach(id => {
                  if (!newIds.has(id)) {
                    removeFromWorkspace(id)
                  }
                })
                
                // Add new items
                updatedItems.forEach(item => {
                  if (!currentIds.has(item.id)) {
                    addToWorkspace(item)
                  }
                })
              }}
              onAnalysisRequest={handleAnalysisRequest}
              />
            </div>
          )}
          
          {/* Property Recommendations Modal */}
          <div className="pointer-events-auto">
            <PropertyRecommendations
              visible={showRecommendations}
              onClose={() => setShowRecommendations(false)}
              onPropertySelect={(property) => {
              // Add selected property to feed
              const propertyItem: FeedItem = {
                id: `rec-property-${property.id}-${Date.now()}`,
                type: 'property',
                title: property.address.street,
                content: `AI recommended ${property.propertyType} property - ${property.source}`,
                location: {
                  lat: property.coordinates.lat,
                  lng: property.coordinates.lng,
                  zoom: 16
                },
                marketData: {
                  averagePrice: property.listingDetails.listPrice,
                  pricePerSqft: property.listingDetails.pricePerSqft,
                  capRate: property.listingDetails.capRate,
                  occupancyRate: property.listingDetails.occupancyRate
                }
              }
              
              addToWorkspace(propertyItem)
              setIsFeedVisible(true)
              setShowRecommendations(false)
            }}
            onLocationClick={handleLocationClick}
            />
          </div>
          <div className="pointer-events-auto">
            <FloatingChatSearchBar 
              onAddressDetected={handleAddressDetected}
              onFeedToggle={() => setIsFeedVisible(!isFeedVisible)}
              isFeedVisible={isFeedVisible}
              onPropertyFound={handlePropertySearchResults}
              workspaceItemCount={workspaceItems.length}
              selectedItemCount={workspaceItems.filter(item => item.selected).length}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
})

// Wrap the main app with portfolio provider
const App: React.FC = () => {
  return (
    <PortfolioProvider>
      <AppContent />
    </PortfolioProvider>
  )
}

export default App 