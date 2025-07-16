import React, { useRef, useState, useEffect } from 'react'
import { FilterState, FeedItem } from './types'
import FiltersPanel from './components/FiltersPanel'
import FloatingChatSearchBar from './components/FloatingChatSearchBar'
import ErrorBoundary from './components/ErrorBoundary'
import MapboxGlobe from './components/MapboxGlobe'
import TopActionBar from './components/TopActionBar'
import EnhancedFeedBox from './components/EnhancedFeedBox'
import PropertyRecommendations from './components/PropertyRecommendations'
import { propertyAPI } from './services/api'
import { PropertyListing } from './services/propertyData'
import { marketAnalysisService } from './services/marketAnalysis'
import { FreePropertyListing } from './services/freePropertyData'



const App: React.FC = () => {
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
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [feedTitle, setFeedTitle] = useState('New Research')
  const [isFeedVisible, setIsFeedVisible] = useState(true)
  const [isMapReady, setIsMapReady] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // Ref to access MapboxGlobe's map
  const mapboxGlobeRef = useRef<any>(null)

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handlePropertyListingsToggle = (enabled: boolean) => {
    setFilters(prev => ({
      ...prev,
      propertyListingsEnabled: enabled,
      propertyTypes: enabled && prev.propertyTypes.length === 0 
        ? ['commercial', 'industrial', 'multifamily'] 
        : prev.propertyTypes
    }))
  }

  const handlePropertyTypesChange = (types: string[]) => {
    setFilters(prev => ({ ...prev, propertyTypes: types }))
  }



  // Function to clean up duplicate feed items
  const cleanupDuplicateFeeds = () => {
    setFeedItems(prev => {
      const seen = new Set();
      return prev.filter(item => {
        const key = `${item.type}-${item.title}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    });
  };

  // Clean up duplicates on mount
  useEffect(() => {
    cleanupDuplicateFeeds();
  }, []);

  const searchPropertiesAtAddress = async (address: string, coordinates: { lat: number; lng: number }) => {
    try {
      // First, try to find properties at the exact address
      const exactProperties = await propertyAPI.getPropertiesByAddress(address);
      
      if (exactProperties.length > 0) {
        console.log('Found exact properties at address:', exactProperties);
        return exactProperties;
      }
      
      // If no exact properties, search in a small radius around the coordinates
      const radiusSearch = await propertyAPI.getPropertiesByLocation(coordinates, 0.01); // ~1km radius
      
      if (radiusSearch.length > 0) {
        console.log('Found nearby properties:', radiusSearch);
        return radiusSearch;
      }
      
      // If still no properties, return empty array
      return [];
    } catch (error) {
      console.error('Error searching for properties:', error);
      return [];
    }
  };

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
      
      // Add both items to feed using functional update to ensure proper state management
      setFeedItems(prev => {
        const newItems = [addressItem, analysisItem, ...prev];
        console.log('Updated feed items:', newItems);
        return newItems;
      });
      
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
      
      setFeedItems(prev => [addressItem, analysisItem, ...prev]);
      setIsFeedVisible(true);
    }
  }

  const handleLocationClick = (location: { lat: number; lng: number; zoom: number }) => {
    console.log('handleLocationClick called with:', location);
    console.log('Map ready?', isMapReady);
    console.log('Map ref exists?', !!mapboxGlobeRef.current);
    console.log('FlyToLocation method exists?', !!mapboxGlobeRef.current?.flyToLocation);
    
    if (mapboxGlobeRef.current?.flyToLocation && isMapReady) {
      console.log('Flying to clicked location:', location)
      const success = mapboxGlobeRef.current.flyToLocation(location, location.zoom)
      console.log('FlyTo success:', success);
    } else {
      console.warn('Map not ready for flyToLocation', {
        hasMapRef: !!mapboxGlobeRef.current,
        hasFlyToMethod: !!mapboxGlobeRef.current?.flyToLocation,
        isMapReady: isMapReady
      })
    }
  }

  const handleMapReady = () => {
    console.log('Map is ready')
    setIsMapReady(true)
  }

  const handlePropertyClick = (property: PropertyListing) => {
    console.log('Property clicked:', property);
    
    // Create property item for the feed
    const propertyItem: FeedItem = {
      id: `property-${property.id}-${Date.now()}`,
      type: 'property',
      title: property.address,
      content: `${property.type} property - ${property.source}`,
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
    
    // Add property to feed using functional update
    setFeedItems(prev => {
      const newItems = [propertyItem, ...prev];
      console.log('Updated feed items with property:', newItems);
      return newItems;
    });
    
    // Show the feed if it's not visible
    if (!isFeedVisible) {
      console.log('Showing feed box for property');
      setIsFeedVisible(true);
    }
  }

  const handleFeedItemUpdate = (updatedItems: FeedItem[]) => {
    console.log('Feed items updated:', updatedItems);
    setFeedItems(updatedItems);
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
    
    // Add to feed
    setFeedItems(prev => [zoneItem, ...prev])
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
        source: property.source
      }
    }))
    
    // Add all found properties to the feed
    setFeedItems(prev => [...propertyItems, ...prev])
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
      case 'comparative':
        reportTitle = 'Property Comparison Analysis'
        reportContent = `Comparative analysis of ${items.length} selected properties. Includes price analysis, market trends, location comparison, and investment potential.`
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
    
    setFeedItems(prev => [reportItem, ...prev])
    
    // Could trigger AI analysis here in the future
    console.log('Generated analysis report for items:', items)
  }

  // CRITICAL: Force transparency on all possible elements
  useEffect(() => {
    const forceAppTransparency = () => {
      // Force all divs to be transparent except UI components
      const allDivs = document.querySelectorAll('div:not(.bg-white):not(.bg-gray-50):not(.bg-blue-50):not([class*="bg-"])')
      allDivs.forEach((div: any) => {
        const computedStyle = window.getComputedStyle(div)
        if (computedStyle.backgroundColor === 'rgb(255, 255, 255)' || 
            computedStyle.backgroundColor === 'white') {
          div.style.setProperty('background-color', 'transparent', 'important')
          div.style.setProperty('background', 'transparent', 'important')
        }
      })
    }
    
    // Run immediately and then every 500ms for 3 seconds
    forceAppTransparency()
    const interval = setInterval(forceAppTransparency, 500)
    setTimeout(() => clearInterval(interval), 3000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Top Action Bar */}
        <TopActionBar
          propertyListingsEnabled={filters.propertyListingsEnabled}
          selectedPropertyTypes={filters.propertyTypes}
          onPropertyListingsToggle={handlePropertyListingsToggle}
          onPropertyTypesChange={handlePropertyTypesChange}
          onRecommendationsClick={() => setShowRecommendations(true)}
          onPortfolioClick={() => handleAnalysisRequest(feedItems, 'portfolio')}
          onExportClick={() => {
            // Create a CSV export of all workspace items
            const csvHeaders = ['ID', 'Type', 'Title', 'Content', 'Address', 'Price', 'Cap Rate', 'Vacancy', 'Date Added']
            const csvRows = feedItems.map(item => [
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
            link.download = `${feedTitle.replace(/\s+/g, '_')}_workspace_export.csv`
            link.click()
            URL.revokeObjectURL(url)
          }}
          onAnalysisClick={() => handleAnalysisRequest(feedItems, 'comparative')}
          workspaceItemCount={feedItems.length}
        />

        {/* Main content with top spacing for fixed action bar */}
        <div className="pt-6 h-full">
          <MapboxGlobe 
            ref={mapboxGlobeRef} 
            filters={filters} 
            onReady={handleMapReady}
            onPropertyClick={handlePropertyClick}
            onZoneClick={handleZoneClick}
          />
          <FiltersPanel 
            onFiltersChange={handleFiltersChange} 
            initialFilters={filters} 
            map={mapboxGlobeRef.current?.map}
            loading={loading}
          />
          {isFeedVisible && (
            <EnhancedFeedBox
              items={feedItems}
              title={feedTitle}
              onTitleChange={setFeedTitle}
              onLocationClick={handleLocationClick}
              onClose={() => setIsFeedVisible(false)}
              onCleanup={cleanupDuplicateFeeds}
              onItemUpdate={handleFeedItemUpdate}
              onAnalysisRequest={handleAnalysisRequest}
            />
          )}
          
          {/* Property Recommendations Modal */}
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
              
              setFeedItems(prev => [propertyItem, ...prev])
              setIsFeedVisible(true)
              setShowRecommendations(false)
            }}
            onLocationClick={handleLocationClick}
          />
          <FloatingChatSearchBar 
            onAddressDetected={handleAddressDetected}
            onFeedToggle={() => setIsFeedVisible(!isFeedVisible)}
            isFeedVisible={isFeedVisible}
            onPropertyFound={handlePropertySearchResults}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App 