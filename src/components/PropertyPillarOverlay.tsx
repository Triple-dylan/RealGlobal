import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { animationClasses, useAnimations } from './AnimationCSS'

interface PropertyPillar {
  id: string
  coordinates: [number, number] // [lng, lat]
  height: number // Relative height (0-1)
  color: string
  value?: number
  type: 'portfolio' | 'potential' | 'analysis' | 'risk'
  status: 'owned' | 'watching' | 'analyzing' | 'avoid'
}

interface PropertyPillarOverlayProps {
  map: mapboxgl.Map
  properties: PropertyPillar[]
  visible: boolean
  onPropertyClick?: (property: PropertyPillar) => void
  onPropertyHover?: (property: PropertyPillar | null) => void
}

const PropertyPillarOverlay: React.FC<PropertyPillarOverlayProps> = ({
  map,
  properties,
  visible,
  onPropertyClick,
  onPropertyHover
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const sourceId = 'property-pillars'
  const layerId = 'property-pillars-layer'

  // Initialize animations
  useAnimations()

  // Enhanced color mapping for different property types
  const getColorByType = (type: string, status: string) => {
    switch (status) {
      case 'owned': return '#059669' // Rich emerald for owned portfolio properties
      case 'watching': return '#2563EB' // Deep blue for potential
      case 'analyzing': return '#D97706' // Orange for analysis
      case 'avoid': return '#DC2626' // Red for high risk
      default: return '#6B7280' // Gray for unknown
    }
  }

  // Get enhanced properties for portfolio items
  const getEnhancedProperties = (property: PropertyPillar) => {
    const isPortfolio = property.status === 'owned'
    return {
      color: getColorByType(property.type, property.status),
      height: isPortfolio ? Math.max(property.height * 1500, 100) : Math.max(property.height * 1000, 50), // Taller for portfolio
      radius: isPortfolio ? 30 : 20, // Wider for portfolio
      opacity: isPortfolio ? 0.9 : 0.7,
      glowIntensity: isPortfolio ? 2.0 : 1.0 // Enhanced glow for portfolio
    }
  }

  // Create pillar geometry
  const createPillarGeometry = (property: PropertyPillar) => {
    const enhanced = getEnhancedProperties(property)
    const height = enhanced.height
    const radius = enhanced.radius
    
    return {
      type: 'Feature' as const,
      properties: {
        id: property.id,
        height,
        color: property.color || getColorByType(property.type, property.status),
        type: property.type,
        status: property.status,
        value: property.value
      },
      geometry: {
        type: 'Point' as const,
        coordinates: property.coordinates
      }
    }
  }

  // Create glowing base circle
  const createBaseCircle = (property: PropertyPillar): HTMLElement => {
    const el = document.createElement('div')
    el.className = 'property-pillar-base'
    el.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${property.color || getColorByType(property.type, property.status)};
      box-shadow: 0 0 20px ${property.color || getColorByType(property.type, property.status)}40;
      border: 2px solid white;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      z-index: 10;
      animation: pillarEntrance 0.6s ease-out;
    `
    
    // Enhanced hover effects with better animations
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.3) translateY(-2px)'
      el.style.boxShadow = `0 4px 40px ${property.color || getColorByType(property.type, property.status)}80, 0 0 60px ${property.color || getColorByType(property.type, property.status)}40`
      el.style.borderWidth = '3px'
      onPropertyHover?.(property)
    })
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1) translateY(0px)'
      el.style.boxShadow = `0 0 20px ${property.color || getColorByType(property.type, property.status)}40`
      el.style.borderWidth = '2px'
      onPropertyHover?.(null)
    })
    
    el.addEventListener('click', () => {
      // Add click animation
      el.style.transform = 'scale(0.9) translateY(1px)'
      setTimeout(() => {
        el.style.transform = 'scale(1.1) translateY(-1px)'
        setTimeout(() => {
          el.style.transform = 'scale(1) translateY(0px)'
        }, 150)
      }, 100)
      onPropertyClick?.(property)
    })
    
    return el
  }

  // Helper function: Cluster nearby properties
  const clusterNearbyProperties = (properties: PropertyPillar[], threshold = 0.001): PropertyPillar[][] => {
    const clusters: PropertyPillar[][] = []
    const processed = new Set<string>()
    
    properties.forEach(property => {
      if (processed.has(property.id)) return
      
      const cluster = [property]
      processed.add(property.id)
      
      // Find nearby properties
      properties.forEach(other => {
        if (processed.has(other.id)) return
        
        const distance = Math.sqrt(
          Math.pow(property.coordinates[0] - other.coordinates[0], 2) +
          Math.pow(property.coordinates[1] - other.coordinates[1], 2)
        )
        
        if (distance < threshold) {
          cluster.push(other)
          processed.add(other.id)
        }
      })
      
      clusters.push(cluster)
    })
    
    return clusters
  }
  
  // Helper function: Calculate cluster center
  const calculateClusterCenter = (properties: PropertyPillar[]): [number, number] => {
    const avgLng = properties.reduce((sum, p) => sum + p.coordinates[0], 0) / properties.length
    const avgLat = properties.reduce((sum, p) => sum + p.coordinates[1], 0) / properties.length
    return [avgLng, avgLat]
  }
  
  // Helper function: Create cluster marker
  const createClusterMarker = (properties: PropertyPillar[], index: number): HTMLElement => {
    const el = document.createElement('div')
    const totalValue = properties.reduce((sum, p) => sum + (p.value || 0), 0)
    const avgColor = properties[0].color || getColorByType(properties[0].type, properties[0].status)
    const size = Math.max(24, Math.min(48, properties.length * 8))
    
    el.className = 'property-cluster-marker'
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${avgColor}, ${avgColor}CC);
      border: 3px solid rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: ${Math.max(10, size / 4)}px;
      cursor: pointer;
      box-shadow: 0 4px 20px ${avgColor}44, 0 0 30px ${avgColor}33;
      animation: clusterEntrance 0.8s ease-out, clusterPulse 3s ease-in-out infinite;
      animation-delay: ${index * 150}ms, ${index * 150 + 800}ms;
      position: relative;
      z-index: 15;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    `
    
    el.textContent = properties.length.toString()
    
    // Enhanced cluster hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.4) translateY(-3px) rotate(5deg)'
      el.style.boxShadow = `0 8px 40px ${avgColor}77, 0 0 60px ${avgColor}55`
      el.style.borderWidth = '4px'
    })
    
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1) translateY(0px) rotate(0deg)'
      el.style.boxShadow = `0 4px 20px ${avgColor}44, 0 0 30px ${avgColor}33`
      el.style.borderWidth = '3px'
    })
    
    el.addEventListener('click', () => {
      // Zoom to cluster bounds
      const bounds = new mapboxgl.LngLatBounds()
      properties.forEach(p => bounds.extend(p.coordinates))
      map.fitBounds(bounds, { padding: 50, maxZoom: 16 })
    })
    
    return el
  }

  useEffect(() => {
    if (!map || !visible) {
      // Clean up existing pillars
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []
      
      if (map.getSource(sourceId)) {
        map.removeLayer(layerId)
        map.removeSource(sourceId)
      }
      return
    }

    // Add 3D pillar extrusions
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: properties.map(createPillarGeometry)
        }
      })

      // Enhanced 3D pillar layer with dynamic properties
      map.addLayer({
        id: layerId,
        type: 'fill-extrusion',
        source: sourceId,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, ['get', 'color'],
            16, [
              'case',
              ['==', ['get', 'status'], 'owned'], '#10B981',
              ['==', ['get', 'status'], 'watching'], '#3B82F6', 
              ['==', ['get', 'status'], 'analyzing'], '#F59E0B',
              ['get', 'color']
            ]
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, ['*', ['get', 'height'], 0.5],
            12, ['get', 'height'],
            16, ['*', ['get', 'height'], 1.5]
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.6,
            12, 0.8,
            16, 0.95
          ],
          'fill-extrusion-vertical-gradient': true
        }
      })
      
      // Add glow effect layer for enhanced pillars
      map.addLayer({
        id: `${layerId}-glow`,
        type: 'fill-extrusion',
        source: sourceId,
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, ['*', ['get', 'height'], 0.6],
            12, ['*', ['get', 'height'], 1.1],
            16, ['*', ['get', 'height'], 1.6]
          ],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0.2,
            12, 0.4,
            16, 0.6
          ]
        }
      }, layerId) // Insert below main layer
    } else {
      // Update existing source
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
      source.setData({
        type: 'FeatureCollection',
        features: properties.map(createPillarGeometry)
      })
    }

    // Enhanced markers with clustering and animations
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Group nearby properties for clustering
    const clusteredProperties = clusterNearbyProperties(properties)
    
    clusteredProperties.forEach((propertyGroup, index) => {
      if (propertyGroup.length === 1) {
        // Single property marker
        const property = propertyGroup[0]
        const marker = new mapboxgl.Marker({
          element: createBaseCircle(property),
          anchor: 'center'
        })
          .setLngLat(property.coordinates)
          .addTo(map)
        
        markersRef.current.push(marker)
      } else {
        // Cluster marker
        const clusterCenter = calculateClusterCenter(propertyGroup)
        const clusterMarker = createClusterMarker(propertyGroup, index)
        
        const marker = new mapboxgl.Marker({
          element: clusterMarker,
          anchor: 'center'
        })
          .setLngLat(clusterCenter)
          .addTo(map)
        
        markersRef.current.push(marker)
      }
    })

    // Add hover interactions for 3D pillars
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = ''
    })

    map.on('click', layerId, (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0]
        const propertyId = feature.properties?.id
        const property = properties.find(p => p.id === propertyId)
        if (property) {
          onPropertyClick?.(property)
        }
      }
    })

    return () => {
      markersRef.current.forEach(marker => marker.remove())
      const allLayerIds = [layerId, `${layerId}-glow`]
      allLayerIds.forEach(id => {
        if (map.getLayer(id)) {
          map.removeLayer(id)
        }
      })
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
    }
  }, [map, properties, visible])

  // Enhanced CSS animations and effects
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .property-pillar-base {
        animation: pillarBreathing 3s ease-in-out infinite;
      }
      
      @keyframes pillarEntrance {
        0% {
          opacity: 0;
          transform: scale(0) translateY(20px);
          box-shadow: 0 0 0 0 transparent;
        }
        50% {
          opacity: 0.8;
          transform: scale(1.2) translateY(-5px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0px);
        }
      }
      
      @keyframes clusterEntrance {
        0% {
          opacity: 0;
          transform: scale(0) rotate(-180deg);
        }
        60% {
          opacity: 0.9;
          transform: scale(1.1) rotate(10deg);
        }
        100% {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }
      }
      
      @keyframes pillarBreathing {
        0%, 100% {
          box-shadow: 0 0 0 0 currentColor;
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 8px transparent;
          transform: scale(1.05);
        }
      }
      
      @keyframes clusterPulse {
        0%, 100% {
          box-shadow: 0 4px 20px currentColor44, 0 0 30px currentColor33;
        }
        50% {
          box-shadow: 0 6px 30px currentColor66, 0 0 50px currentColor44;
        }
      }
      
      .property-pillar-base:hover {
        animation: none;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      try {
        document.head.removeChild(style)
      } catch (e) {
        // Style already removed
      }
    }
  }, [])

  return null // This component only manages map layers
}

export default PropertyPillarOverlay