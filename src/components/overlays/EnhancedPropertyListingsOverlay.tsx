import React, { useEffect, useState, useRef } from 'react'
import { CommercialProperty, commercialAPI } from '../../services/commercial/commercial-api'
import { PropertySearchService, PropertySearchFilters } from '../../services/property/property-search'

interface EnhancedPropertyListingsOverlayProps {
  map: mapboxgl.Map
  visible: boolean
  propertyTypes: Array<'office' | 'retail' | 'industrial' | 'multifamily' | 'mixed-use' | 'land'>
  searchFilters?: Partial<PropertySearchFilters>
  onPropertyClick?: (property: CommercialProperty) => void
  onClusterClick?: (properties: CommercialProperty[], center: [number, number]) => void
}

const EnhancedPropertyListingsOverlay: React.FC<EnhancedPropertyListingsOverlayProps> = ({
  map,
  visible,
  propertyTypes,
  searchFilters,
  onPropertyClick,
  onClusterClick
}) => {
  const [properties, setProperties] = useState<CommercialProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const layersAddedRef = useRef(false)
  const searchService = useRef(new PropertySearchService())

  // Load properties when map moves or filters change
  useEffect(() => {
    if (!map || !visible || propertyTypes.length === 0) {
      if (layersAddedRef.current) {
        removePropertyLayers()
      }
      return
    }

    const loadProperties = async () => {
      setLoading(true)
      setError(null)

      try {
        const bounds = map.getBounds()
        if (!bounds) {
          console.warn('Map bounds not available')
          return
        }
        
        // Build search filters
        const filters: PropertySearchFilters = {
          location: {
            bounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            }
          },
          propertyType: {
            types: propertyTypes
          },
          physical: {},
          market: {},
          financial: {},
          investment: {},
          ...searchFilters // Merge in any additional filters
        }

        // Search for properties
        const searchResult = await searchService.current.searchProperties(filters)
        setProperties(searchResult.properties)
        
        // Add properties to map
        addPropertyLayers(searchResult.properties)
        
      } catch (err) {
        console.error('Failed to load properties:', err)
        setError('Failed to load properties')
        
        // Try fallback API call
        try {
          const bounds = map.getBounds()
          if (!bounds) {
            console.warn('Map bounds not available for fallback')
            return
          }
          const fallbackProperties = await commercialAPI.searchProperties({
            bounds: {
              north: bounds.getNorth(),
              south: bounds.getSouth(),
              east: bounds.getEast(),
              west: bounds.getWest()
            },
            propertyTypes,
            limit: 100
          })
          
          setProperties(fallbackProperties)
          addPropertyLayers(fallbackProperties)
          setError(null)
        } catch (fallbackErr) {
          console.error('Fallback property loading failed:', fallbackErr)
        }
      } finally {
        setLoading(false)
      }
    }

    // Debounce map movements
    const timeoutId = setTimeout(loadProperties, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [map, visible, propertyTypes, searchFilters])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (layersAddedRef.current) {
        removePropertyLayers()
      }
    }
  }, [])

  const addPropertyLayers = (propertiesToAdd: CommercialProperty[]) => {
    if (!map || propertiesToAdd.length === 0) return

    // Remove existing layers first
    removePropertyLayers()

    // Create GeoJSON data
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: propertiesToAdd.map(property => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [property.coordinates.lng, property.coordinates.lat]
        },
        properties: {
          id: property.id,
          propertyType: property.propertyType,
          address: property.address.street,
          city: property.address.city,
          price: property.listingDetails.listPrice,
          pricePerSqft: property.listingDetails.pricePerSqft || 0,
          capRate: property.listingDetails.capRate || 0,
          squareFootage: property.listingDetails.squareFootage || 0,
          occupancyRate: property.listingDetails.occupancyRate || 0,
          daysOnMarket: property.marketData.daysOnMarket,
          source: property.source
        }
      }))
    }

    try {
      // Add source
      map.addSource('enhanced-properties', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 16,
        clusterRadius: 60,
        clusterProperties: {
          'totalValue': ['+', ['get', 'price']],
          'avgCapRate': ['/', ['+', ['get', 'capRate']], ['get', 'point_count']],
          'propertyTypes': ['concat', ['get', 'propertyType']]
        }
      })

      // Add cluster circles
      map.addLayer({
        id: 'enhanced-property-clusters',
        type: 'circle',
        source: 'enhanced-properties',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#3B82F6', // Blue for small clusters
            10, '#8B5CF6', // Purple for medium clusters
            25, '#10B981'  // Green for large clusters
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,  // Small clusters
            10, 30,  // Medium clusters
            25, 40   // Large clusters
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      })

      // Add cluster count labels
      map.addLayer({
        id: 'enhanced-property-cluster-count',
        type: 'symbol',
        source: 'enhanced-properties',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['Inter Medium'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0,0,0,0.3)',
          'text-halo-width': 1
        }
      })

      // Add individual property points
      map.addLayer({
        id: 'enhanced-unclustered-properties',
        type: 'circle',
        source: 'enhanced-properties',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'propertyType'],
            'office', '#3B82F6',      // Blue
            'retail', '#10B981',      // Green
            'industrial', '#F59E0B',  // Orange
            'multifamily', '#8B5CF6', // Purple
            'mixed-use', '#EC4899',   // Pink
            'land', '#6B7280',        // Gray
            '#374151'                 // Default gray
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 4,
            16, 8,
            20, 12
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          'circle-opacity': 0.8
        }
      })

      // Add property labels for higher zoom levels
      map.addLayer({
        id: 'enhanced-property-labels',
        type: 'symbol',
        source: 'enhanced-properties',
        filter: ['!', ['has', 'point_count']],
        minzoom: 14,
        layout: {
          'text-field': [
            'format',
            ['get', 'address'], {},
            '\n$', {},
            ['number-format', ['get', 'price'], { 'min-fraction-digits': 0, 'max-fraction-digits': 0 }], {}
          ],
          'text-font': ['Inter Regular'],
          'text-size': 10,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-max-width': 10
        },
        paint: {
          'text-color': '#374151',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      })

      // Add click handlers
      map.on('click', 'enhanced-property-clusters', handleClusterClick)
      map.on('click', 'enhanced-unclustered-properties', handlePropertyClick)
      
      // Add hover effects
      map.on('mouseenter', 'enhanced-property-clusters', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'enhanced-property-clusters', () => {
        map.getCanvas().style.cursor = ''
      })
      
      map.on('mouseenter', 'enhanced-unclustered-properties', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'enhanced-unclustered-properties', () => {
        map.getCanvas().style.cursor = ''
      })

      layersAddedRef.current = true

    } catch (error) {
      console.error('Error adding property layers:', error)
    }
  }

  const removePropertyLayers = () => {
    if (!map || !layersAddedRef.current) return

    try {
      // Remove event listeners
      map.off('click', 'enhanced-property-clusters', handleClusterClick)
      map.off('click', 'enhanced-unclustered-properties', handlePropertyClick)

      // Remove layers
      const layersToRemove = [
        'enhanced-property-labels',
        'enhanced-unclustered-properties',
        'enhanced-property-cluster-count',
        'enhanced-property-clusters'
      ]

      layersToRemove.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      })

      // Remove source
      if (map.getSource('enhanced-properties')) {
        map.removeSource('enhanced-properties')
      }

      layersAddedRef.current = false

    } catch (error) {
      console.error('Error removing property layers:', error)
    }
  }

  const handleClusterClick = (e: mapboxgl.MapLayerMouseEvent) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['enhanced-property-clusters']
    })

    if (!features.length) return

    const clusterId = features[0].properties?.cluster_id
    const source = map.getSource('enhanced-properties') as mapboxgl.GeoJSONSource

    source.getClusterLeaves(clusterId, Infinity, 0, (error, leaves) => {
      if (error || !leaves) return

      // Find properties for this cluster
      const clusterProperties = leaves
        .map(leaf => properties.find(p => p.id === leaf.properties?.id))
        .filter(Boolean) as CommercialProperty[]

      if (onClusterClick && clusterProperties.length > 0) {
        const coordinates = features[0].geometry.type === 'Point' 
          ? features[0].geometry.coordinates
          : [0, 0]
        const center: [number, number] = [coordinates[0], coordinates[1]]
        onClusterClick(clusterProperties, center)
      }
    })
  }

  const handlePropertyClick = (e: mapboxgl.MapLayerMouseEvent) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['enhanced-unclustered-properties']
    })

    if (!features.length) return

    const propertyId = features[0].properties?.id
    const property = properties.find(p => p.id === propertyId)

    if (property && onPropertyClick) {
      onPropertyClick(property)
    }
  }

  // Render loading/error states (could be positioned overlay)
  if (loading) {
    return (
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-50">
        <div className="flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          Loading properties...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg shadow-lg p-3 z-50 max-w-sm">
        <div className="text-sm text-red-800">
          <strong>Error:</strong> {error}
        </div>
      </div>
    )
  }

  return null
}

export default EnhancedPropertyListingsOverlay