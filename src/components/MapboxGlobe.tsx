import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { FilterState } from '../types'
import { PropertyListing } from '../services/propertyData'
import OpportunityZonesOverlay from './OpportunityZonesOverlay'
import EconomicOverlay from './EconomicOverlay'
// Removed unused PropertyListingsOverlay
import CommercialZonesOverlay from './overlays/CommercialZonesOverlay'
import MultifamilyZonesOverlay from './overlays/MultifamilyZonesOverlay'
import EnhancedPropertyListingsOverlay from './overlays/EnhancedPropertyListingsOverlay'
import { animationClasses, useAnimations } from './AnimationCSS'

interface MapboxGlobeProps {
  filters: FilterState
  onReady?: () => void
  onPropertyClick?: (property: PropertyListing) => void
  onZoneClick?: (zone: any) => void
  onMapRightClick?: (coordinates: { lat: number; lng: number }, address: string) => void
}

// Set Mapbox access token - this would come from environment variables in production
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZHlsYW5kYWhsIiwiYSI6ImNtY2NlMTByODAwZmoyaW9qMjRsbGR1MnAifQ.IZKpxXXap93-osoqR3YsAQ'

// Use the user's custom Mapbox style for globe projection
const MAPBOX_STYLE_URL = 'mapbox://styles/dylandahl/cmcfaemjf01zf01r7bimd68uq'
const FALLBACK_STYLE = 'mapbox://styles/mapbox/satellite-v9'

const MapboxGlobe = forwardRef<any, MapboxGlobeProps>((props, ref) => {
  const { filters, onReady, onPropertyClick, onZoneClick, onMapRightClick } = props
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Initialize animations
  useAnimations()

  useImperativeHandle(ref, () => ({
    map: mapRef.current,
    flyToLocation: (coordinates: { lat: number; lng: number }, zoom: number = 8) => {
      if (!mapRef.current || !isReady) {
        return false
      }
      
      const map = mapRef.current
      const lat = parseFloat(coordinates.lat.toString())
      const lng = parseFloat(coordinates.lng.toString())
      
      if (isNaN(lat) || isNaN(lng)) {
        return false
      }
      
      try {
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(zoom, 12),
          duration: 2000,
          essential: true
        })
        return true
      } catch (error) {
        console.error('flyTo failed:', error)
        return false
      }
    }
  }), [isReady])

  useEffect(() => {
    if (mapRef.current || !mapContainer.current) return

    // Check if Mapbox token is available
    if (!mapboxgl.accessToken || mapboxgl.accessToken.includes('placeholder_token_for_demo')) {
      setMapError('Mapbox access token not configured. Please set VITE_MAPBOX_ACCESS_TOKEN environment variable.')
      return
    }
    
    const initMap = async () => {
      const container = mapContainer.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(initMap, 100)
        return
      }
      
      try {
        // Create Mapbox GL map with proper globe projection and satellite style
        const map = new mapboxgl.Map({
          container: container,
          style: MAPBOX_STYLE_URL,
          center: [0, 20],
          zoom: 1.5,
          projection: 'globe',
          pitch: 0,
          bearing: 0,
          attributionControl: false,
          interactive: true,
          dragPan: true,
          dragRotate: true,
          scrollZoom: true,
          doubleClickZoom: true,
          touchZoomRotate: true,
          renderWorldCopies: false,
          maxPitch: 85,
          maxZoom: 20,
          minZoom: 0.5,
          preserveDrawingBuffer: true,
          antialias: true
        })
        
        mapRef.current = map
        
        map.on('load', () => {
          console.log('Mapbox map loaded successfully')
          console.log('Map projection:', map.getProjection())
          console.log('Map style:', map.getStyle())
          
          // Ensure the globe projection is properly set
          if (map.getProjection().name !== 'globe') {
            console.log('Setting globe projection...')
            map.setProjection({ name: 'globe' } as any)
          }
          
          setIsReady(true)
          setMapError(null)
          if (onReady) {
            onReady()
          }
        })

        map.on('style.load', () => {
          console.log('Mapbox style loaded')
          console.log('Style URL:', map.getStyle().sprite)
          setIsReady(true)
        })

        map.on('idle', () => {
          console.log('Map is idle')
          if (!isReady) {
            setIsReady(true)
          }
        })

        // Add right-click handler for property addition
        map.on('contextmenu', async (e) => {
          if (onMapRightClick) {
            const { lng, lat } = e.lngLat
            
            // Reverse geocode to get address
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
              )
              const data = await response.json()
              const address = data.features[0]?.place_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
              
              onMapRightClick({ lat, lng }, address)
            } catch (error) {
              console.error('Error reverse geocoding:', error)
              onMapRightClick({ lat, lng }, `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            }
          }
        })
        
        map.on('error', (e) => {
          console.error('Mapbox error:', e)
          console.error('Error details:', e.error)
          
          // Try fallback style if satellite style fails
          if (e.error && e.error.message && e.error.message.includes('style')) {
            console.log('Trying fallback style...')
            map.setStyle(FALLBACK_STYLE)
          } else {
            setMapError('Map loading error: ' + (e.error?.message || 'Unknown error'))
          }
        })
        
      } catch (err: any) {
        console.error('Mapbox initialization failed:', err)
        setMapError('Failed to initialize Mapbox. Check your access token.')
      }
    }
    
    initMap()
    
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove()
        } catch (e) {
          console.warn('Error during cleanup:', e)
        }
        mapRef.current = null
      }
      setIsReady(false)
    }
  }, [])

  return (
    <div className="professional-globe-container">
      <div 
        ref={mapContainer} 
        className="map-container"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          backgroundColor: 'transparent'
        }}
      />

      {/* Enhanced Map Controls for Mapbox */}
      <div className={`absolute bottom-4 right-4 flex flex-col gap-1 z-40 ${animationClasses.slideInRight}`}>
        {/* Zoom In */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom()
              mapRef.current.easeTo({ zoom: currentZoom + 1, duration: 300 })
            }
          }}
          className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm ${animationClasses.ultraSmooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress} ${animationClasses.focusRing} flex items-center justify-center text-sm font-bold`}
          title="Zoom In"
        >
          +
        </button>

        {/* Zoom Out */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom()
              mapRef.current.easeTo({ zoom: currentZoom - 1, duration: 300 })
            }
          }}
          className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm ${animationClasses.ultraSmooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress} ${animationClasses.focusRing} flex items-center justify-center text-sm font-bold`}
          title="Zoom Out"
        >
          −
        </button>

        {/* Compass/Reset */}
        <button
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.easeTo({ 
                center: [0, 20], 
                zoom: 1.5, 
                bearing: 0, 
                pitch: 0, 
                duration: 1000 
              })
            }
          }}
          className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm ${animationClasses.ultraSmooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress} ${animationClasses.focusRing} flex items-center justify-center`}
          title="Reset View"
        >
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <polygon points="3,11 22,2 13,21 11,13 3,11" />
          </svg>
        </button>

        {/* Globe Mode Toggle */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentProjection = mapRef.current.getProjection()
              const newProjection = currentProjection.name === 'globe' ? 'mercator' : 'globe'
              mapRef.current.setProjection({ name: newProjection } as any)
            }
          }}
          className={`w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm ${animationClasses.ultraSmooth} ${animationClasses.hoverScale} ${animationClasses.buttonPress} ${animationClasses.focusRing} flex items-center justify-center text-xs`}
          title="Toggle Globe/Flat"
        >
          🌍
        </button>
      </div>

      {/* Hide Mapbox attribution for clean UI */}
      <style>{`
        .mapboxgl-ctrl-attrib,
        .mapboxgl-ctrl-logo,
        .mapboxgl-ctrl-bottom-left,
        .mapboxgl-ctrl-bottom-right {
          display: none !important;
        }
        
        .mapboxgl-ctrl {
          display: none !important;
        }
        
        /* Ensure Mapbox canvas is visible and properly positioned */
        .mapboxgl-canvas {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 0 !important;
        }
      `}</style>
      
      {mapRef.current && isReady && (
        <>
          {/* Legacy overlays - keep for backward compatibility */}
          <OpportunityZonesOverlay 
            map={mapRef.current as any} 
            visible={filters.zoning.includes('opportunity-zones')}
          />

          
          {/* Enhanced commercial-focused overlays */}
          <CommercialZonesOverlay
            map={mapRef.current as any}
            visible={filters.zoning.includes('commercial-zones') || filters.propertyListingsEnabled}
            propertyTypes={filters.propertyTypes.filter(type => 
              ['office', 'retail', 'industrial', 'mixed-use'].includes(type)
            )}
            onZoneClick={(zone) => {
              console.log('Commercial zone clicked:', zone)
              onZoneClick?.(zone)
            }}
          />
          
          <MultifamilyZonesOverlay
            map={mapRef.current as any}
            visible={filters.zoning.includes('multifamily-zones') || 
                     filters.propertyTypes.includes('multifamily')}
            densityTypes={['low-density', 'mid-density', 'high-density', 'mixed-income']}
            onZoneClick={(zone) => {
              console.log('Multifamily zone clicked:', zone)
              onZoneClick?.(zone)
            }}
          />
          
          <EconomicOverlay 
            map={mapRef.current as any}
            visible={filters.economicOverlayEnabled}
            indicator={filters.economicIndicator}
          />
          
          {/* Enhanced Property Listings with Mapbox clustering */}
          <EnhancedPropertyListingsOverlay 
            map={mapRef.current as any}
            visible={filters.propertyListingsEnabled}
            propertyTypes={filters.propertyTypes as any}
            onPropertyClick={onPropertyClick as any}
          />
        </>
      )}

      {/* Move loading and error overlays below overlays/UI panels, above map */}
      {!isReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className={`text-center ${animationClasses.slideUpFade}`}>
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4 ${animationClasses.pulse}`}></div>
            <div className={`text-white text-lg ${animationClasses.shimmer}`}>Loading Mapbox Globe...</div>
            <div className="text-white text-sm opacity-75 mt-2">Style: {MAPBOX_STYLE_URL}</div>
          </div>
        </div>
      )}
      {mapError && (
        <div className={`absolute top-4 left-4 z-10 bg-red-900/90 text-white p-4 rounded-lg border border-red-700 max-w-md pointer-events-none ${animationClasses.slideDown} ${animationClasses.hoverGlow}`}>
          <div className="text-sm font-medium">Mapbox Configuration Error</div>
          <div className="text-xs opacity-90 mt-1">{mapError}</div>
          <div className="text-xs opacity-75 mt-2">
            To use Mapbox features, configure your access token in environment variables.<br />
            Falling back to MapTiler in the next update...
          </div>
        </div>
      )}
      {isReady && !mapError && (
        <div className={`absolute top-4 right-4 z-10 bg-green-900/90 text-white p-2 rounded-lg border border-green-700 text-xs pointer-events-none ${animationClasses.slideDown} ${animationClasses.pulse}`}>
          Mapbox Globe Ready ✓
        </div>
      )}
    </div>
  )
})

MapboxGlobe.displayName = 'MapboxGlobe'

export default MapboxGlobe