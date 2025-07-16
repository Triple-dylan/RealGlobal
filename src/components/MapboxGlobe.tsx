import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { FilterState, PropertyType } from '../types'
import { PropertyListing } from '../services/propertyData'
import OpportunityZonesOverlay from './OpportunityZonesOverlay'
import AffordableHousingZonesOverlay from './AffordableHousingZonesOverlay'
import EconomicOverlay from './EconomicOverlay'
import PropertyListingsOverlay from './PropertyListingsOverlay'
import CommercialZonesOverlay from './overlays/CommercialZonesOverlay'
import MultifamilyZonesOverlay from './overlays/MultifamilyZonesOverlay'
import EnhancedPropertyListingsOverlay from './overlays/EnhancedPropertyListingsOverlay'

interface MapboxGlobeProps {
  filters: FilterState
  onReady?: () => void
  onPropertyClick?: (property: PropertyListing) => void
  onZoneClick?: (zone: any) => void
}

// Set Mapbox access token - this would come from environment variables in production
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZHlsYW5kYWhsIiwiYSI6ImNtY2NlMTByODAwZmoyaW9qMjRsbGR1MnAifQ.IZKpxXXap93-osoqR3YsAQ'
// Use provided Mapbox style URL
const MAPBOX_STYLE_URL = 'mapbox://styles/dylandahl/cmcl05lb8002k01sqc22u66wy'

const MapboxGlobe = forwardRef<any, MapboxGlobeProps>((props, ref) => {
  const { filters, onReady, onPropertyClick, onZoneClick } = props
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

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
        // Create Mapbox GL map with transparent canvas
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
          // CRITICAL: This should force transparent canvas
          preserveDrawingBuffer: true,
          antialias: true
        })
        
        mapRef.current = map
        
        map.on('load', () => {
          // CRITICAL: Force canvas transparency immediately
          const canvas = map.getCanvas()
          const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2')
          if (ctx) {
            // Clear to transparent
            ctx.clearColor(0, 0, 0, 0)
            ctx.clear(ctx.COLOR_BUFFER_BIT)
          }
          
          // NO FOG - this creates the white background
          // Disable fog completely
          
          setIsReady(true)
          setMapError(null)
          if (onReady) {
            onReady()
          }
        })

        map.on('style.load', () => {
          setIsReady(true)
        })

        map.on('idle', () => {
          if (!isReady) {
            setIsReady(true)
          }
        })
        
        map.on('error', (e) => {
          console.error('Mapbox error:', e)
          setMapError('Map loading error')
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
      />

      {/* Enhanced Map Controls for Mapbox */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-40">
        {/* Zoom In */}
        <button
          onClick={() => {
            if (mapRef.current) {
              const currentZoom = mapRef.current.getZoom()
              mapRef.current.easeTo({ zoom: currentZoom + 1, duration: 300 })
            }
          }}
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm font-bold"
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
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 flex items-center justify-center text-sm font-bold"
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
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 flex items-center justify-center"
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
          className="w-8 h-8 bg-white/90 hover:bg-white shadow-lg text-gray-700 rounded border border-gray-300 backdrop-blur-sm transition-all duration-200 hover:scale-105 flex items-center justify-center text-xs"
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
      `}</style>
      
      {mapRef.current && isReady && (
        <>
          {/* Legacy overlays - keep for backward compatibility */}
          <OpportunityZonesOverlay 
            map={mapRef.current as any} 
            visible={filters.zoning.includes('opportunity-zones')}
          />
          <AffordableHousingZonesOverlay 
            map={mapRef.current as any} 
            visible={filters.zoning.includes('affordable-housing')}
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <div className="text-white text-lg">Loading Mapbox Globe...</div>
          </div>
        </div>
      )}
      {mapError && (
        <div className="absolute top-4 left-4 z-10 bg-red-900/90 text-white p-4 rounded-lg border border-red-700 max-w-md pointer-events-none">
          <div className="text-sm font-medium">Mapbox Configuration Error</div>
          <div className="text-xs opacity-90 mt-1">{mapError}</div>
          <div className="text-xs opacity-75 mt-2">
            To use Mapbox features, configure your access token in environment variables.<br />
            Falling back to MapTiler in the next update...
          </div>
        </div>
      )}
    </div>
  )
})

MapboxGlobe.displayName = 'MapboxGlobe'

export default MapboxGlobe