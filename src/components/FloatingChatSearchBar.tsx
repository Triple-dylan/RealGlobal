import React, { useState, useRef, useEffect } from 'react'
import { Send, Search, Building } from 'lucide-react'
import debounce from 'lodash/debounce'
import { freePropertyDataService, FreePropertyListing } from '../services/freePropertyData'

interface FloatingChatSearchBarProps {
  onSearch?: (query: string) => void
  onAddressDetected: (address: string, coordinates: { lat: number; lng: number }) => void
  onFeedToggle?: () => void
  isFeedVisible?: boolean
  onPropertyFound?: (properties: FreePropertyListing[]) => void
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
  onPropertyFound
}) => {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)
    setSuggestions([])

    const inputValue = input.trim()
    setInput('')

    try {
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
    <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 shadow-lg rounded-lg bg-white/95 backdrop-blur-sm border border-gray-200/80 text-gray-900 font-medium" style={{fontSize: '15px'}}>
      <form 
        onSubmit={handleSubmit}
        className="relative flex flex-col items-center"
      >
        <div className="flex items-center bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-lg shadow-sm overflow-hidden p-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search address or ask about properties..."
            className="w-[285px] bg-gray-50 text-gray-900 font-semibold text-sm px-2 py-1 rounded focus:outline-none border border-gray-300 focus:border-blue-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`ml-2 font-medium text-gray-700 bg-white/90 hover:bg-white shadow-lg rounded border border-gray-300 px-2 py-1 focus:outline-none transition-all ${isLoading ? 'opacity-60' : ''}`}
            disabled={isLoading}
          >
            <Send size={16} className={isLoading ? 'animate-pulse' : ''} />
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute bottom-full mb-2 w-[285px] max-h-[200px] overflow-y-auto bg-white/95 backdrop-blur-sm border border-gray-200/80 rounded-xl shadow-xl text-gray-900 text-sm z-50"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-3 py-2 text-gray-900 hover:bg-blue-50 cursor-pointer text-sm"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.place_name}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}

export default FloatingChatSearchBar