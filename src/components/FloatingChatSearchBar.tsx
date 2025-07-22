import React, { useState, useRef, useEffect } from 'react'
import { Send, Search, Building } from 'lucide-react'
import debounce from 'lodash/debounce'
import { freePropertyDataService, FreePropertyListing } from '../services/freePropertyData'
import { animationClasses, useAnimations } from './AnimationCSS'
import { FeedItem } from '../types'

interface FloatingChatSearchBarProps {
  onSearch?: (query: string) => void
  onAddressDetected: (address: string, coordinates: { lat: number; lng: number }) => void
  onFeedToggle?: () => void
  isFeedVisible?: boolean
  onPropertyFound?: (properties: FreePropertyListing[]) => void
  workspaceItemCount?: number
  selectedItemCount?: number
}

interface Suggestion {
  place_name: string
  center: [number, number]
}

const FloatingChatSearchBar: React.FC<FloatingChatSearchBarProps> = ({
  onSearch,
  onAddressDetected,
  onFeedToggle,
  isFeedVisible = true,
  onPropertyFound,
  workspaceItemCount = 0,
  selectedItemCount = 0
}) => {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [mode, setMode] = useState<'search' | 'command'>('search')
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Initialize animations
  useAnimations()

  // Smart contextual suggestions based on workspace state
  const getContextualSuggestions = () => {
    const suggestions = []
    
    if (workspaceItemCount === 0) {
      suggestions.push(
        "Find commercial properties in Austin",
        "Show opportunity zones in Denver", 
        "Search multifamily properties near downtown"
      )
    }
    
    return suggestions
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    try {
      const encodedQuery = encodeURIComponent(query)
      const url = `https://api.maptiler.com/geocoding/${encodedQuery}.json?key=sv3rWFwpQy2TinWkmW24`
      const response = await fetch(url)
      const data = await response.json()

      if (data.features) {
        const newSuggestions = data.features.map((feature: any) => ({
          place_name: feature.place_name || feature.text,
          center: feature.center
        }))
        setSuggestions(newSuggestions)
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    }
  }

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInput(value)
    debouncedFetchSuggestions(value)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput('')
    setShowSuggestions(false)
    setSuggestions([])
    const [lng, lat] = suggestion.center
    onAddressDetected(suggestion.place_name, { lat, lng })
  }

  const handlePropertyUrlImport = async (url: string) => {
    try {
      setIsLoading(true)
      
      // Parse property data from URL
      const propertyData = await parsePropertyUrl(url)
      
      if (propertyData) {
        // Add to portfolio as owned property
        const portfolioProperty: FeedItem = {
          id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'property',
          title: propertyData.address,
          content: `✅ **PORTFOLIO PROPERTY**

📊 **Property Details:**
• Type: ${propertyData.propertyType}
• Price: $${propertyData.price?.toLocaleString() || 'N/A'}
• Size: ${propertyData.sqft?.toLocaleString() || 'N/A'} sq ft
• Status: Owned

🎯 **Added to Portfolio**
This property is now tracked in your portfolio for performance monitoring and AI analysis.`,
          location: {
            lat: propertyData.coordinates.lat,
            lng: propertyData.coordinates.lng,
            zoom: 16
          },
          marketData: {
            averagePrice: propertyData.price,
            pricePerSqft: propertyData.pricePerSqft,
            capRate: propertyData.capRate,
            occupancyRate: propertyData.occupancyRate
          },
          listingLinks: {
            original: url
          },
          portfolioStatus: 'owned'
        }
        
        onAddressDetected(propertyData.address, propertyData.coordinates)
        
        // Show success message
        console.log('Successfully imported property from URL:', url)
      } else {
        throw new Error('Could not parse property data from URL')
      }
    } catch (error) {
      console.error('Error importing property URL:', error)
      
      // Fallback: treat as address search
      const fallbackAddress = extractAddressFromUrl(url)
      if (fallbackAddress) {
        onAddressDetected(fallbackAddress, { lat: 0, lng: 0 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const parsePropertyUrl = async (url: string): Promise<any> => {
    // Simulate property data extraction from URL
    // In production, this would use web scraping or API integration
    
    if (url.includes('zillow.com')) {
      return {
        address: '123 Main St, Austin, TX',
        propertyType: 'Residential',
        price: 650000,
        sqft: 2400,
        pricePerSqft: 271,
        capRate: 5.2,
        occupancyRate: 100,
        coordinates: { lat: 30.2672, lng: -97.7431 }
      }
    } else if (url.includes('loopnet.com')) {
      return {
        address: '456 Commerce Dr, Austin, TX',
        propertyType: 'Commercial Office',
        price: 2400000,
        sqft: 15000,
        pricePerSqft: 160,
        capRate: 6.8,
        occupancyRate: 95,
        coordinates: { lat: 30.2672, lng: -97.7431 }
      }
    }
    
    return null
  }

  const extractAddressFromUrl = (url: string): string => {
    // Simple address extraction fallback
    if (url.includes('zillow.com') || url.includes('loopnet.com')) {
      return 'Property Location from ' + new URL(url).hostname
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)
    setSuggestions([])

    const inputValue = input.trim()
    setInput('')

    try {
      // Check if this is a URL (property listing import)
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlMatch = inputValue.match(urlRegex);
      
      if (urlMatch) {
        const url = urlMatch[0];
        await handlePropertyUrlImport(url);
        return;
      }
      
      // Check if this is a property search query
      const isPropertySearch = inputValue.toLowerCase().includes('properties') || 
                              inputValue.toLowerCase().includes('property') ||
                              inputValue.toLowerCase().includes('real estate') ||
                              inputValue.toLowerCase().includes('houses') ||
                              inputValue.toLowerCase().includes('commercial')

      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0]
        const [lng, lat] = firstSuggestion.center
        onAddressDetected(firstSuggestion.place_name, { lat, lng })
        
        // If it's a property search, also search for properties in that area
        if (isPropertySearch && onPropertyFound) {
          console.log('Searching for properties near:', firstSuggestion.place_name)
          const properties = await freePropertyDataService.searchDomesticProperties({
            location: { lat, lng },
            radius: 5, // 5km radius
            country: 'US'
          })
          
          if (properties.length > 0) {
            onPropertyFound(properties)
            console.log(`Found ${properties.length} properties`)
          }
        }
      } else {
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(inputValue)}.json?key=sv3rWFwpQy2TinWkmW24&limit=1`
        )
        const data = await response.json()
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0]
          const [lng, lat] = feature.center
          onAddressDetected(feature.place_name || feature.text, { lat, lng })
          
          // Search for properties if this is a property query
          if (isPropertySearch && onPropertyFound) {
            console.log('Searching for properties near:', feature.place_name)
            const properties = await freePropertyDataService.searchDomesticProperties({
              location: { lat, lng },
              radius: 5, // 5km radius
              country: 'US'
            })
            
            if (properties.length > 0) {
              onPropertyFound(properties)
              console.log(`Found ${properties.length} properties`)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during address search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 ${animationClasses.slideUpFade}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Main Search Bar */}
        <div className={`flex items-center bg-white/90 backdrop-blur-md border border-white/30 rounded-xl shadow-xl overflow-hidden ${animationClasses.hoverLift} ${animationClasses.ultraSmooth}`}>
          <div className="flex items-center px-4 py-3 gap-3">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder={
                mode === 'command' 
                  ? "Ask me about your properties..." 
                  : "Search properties, paste Zillow/LoopNet links, or ask questions..."
              }
              className="w-80 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-sm"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className={`mr-3 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg ${animationClasses.ultraSmooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress} ${animationClasses.focusRing} ${isLoading ? 'opacity-60' : ''}`}
            disabled={isLoading}
          >
            <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Smart Suggestions */}
        {showSuggestions && (
          <div 
            ref={suggestionsRef}
            className={`absolute bottom-full mb-2 w-full bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl overflow-hidden ${animationClasses.slideUpFade} ${animationClasses.hoverGlow}`}
          >
            {/* Contextual AI Suggestions */}
            {input.length === 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggested actions</div>
                {getContextualSuggestions().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion)
                      setShowSuggestions(false)
                      // Auto-submit contextual suggestions
                      setTimeout(() => handleSubmit(new Event('submit') as any), 100)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded ${animationClasses.smooth} ${animationClasses.hoverFloat} ${animationClasses.clickFeedback} ${index === 0 ? animationClasses.staggerDelay1 : index === 1 ? animationClasses.staggerDelay2 : animationClasses.staggerDelay3}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Location Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 px-3 py-2">Locations</div>
                {suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded ${animationClasses.smooth} ${animationClasses.hoverFloat} ${animationClasses.clickFeedback} flex items-center gap-2 ${index < 2 ? animationClasses.staggerDelay1 : animationClasses.staggerDelay2}`}
                  >
                    <Building className="w-3 h-3 text-gray-400" />
                    {suggestion.place_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </form>
    </div>
  )
}

export default FloatingChatSearchBar