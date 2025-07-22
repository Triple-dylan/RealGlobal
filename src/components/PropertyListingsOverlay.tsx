import React, { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { PropertyType } from '../types'
import { propertyDataService, PropertyListing, PropertyFilters } from '../services/propertyData'

interface PropertyListingsOverlayProps {
  map: mapboxgl.Map | null
  visible: boolean
  propertyTypes: PropertyType[]
  onPropertyClick?: (property: PropertyListing) => void
}

const PropertyListingsOverlay: React.FC<PropertyListingsOverlayProps> = ({ 
  map, 
  visible, 
  propertyTypes,
  onPropertyClick 
}) => {
  const [properties, setProperties] = useState<PropertyListing[]>([])
  const [loading, setLoading] = useState(false)
  const [lastBounds, setLastBounds] = useState<string>('')

  const sourceId = 'property-listings-source'
  const layerIds = [
    'property-listings-base',
    'property-listings-glow',
    'property-listings-pillar',
    'property-listings-top'
  ]

  // Fetch properties when map bounds change
  useEffect(() => {
    if (!map || !visible || propertyTypes.length === 0) return

    const fetchProperties = async () => {
      const bounds = map.getBounds()
      if (!bounds) {
        console.warn('Map bounds not available')
        return
      }
      const boundsString = JSON.stringify(bounds)
      
      // Don't refetch if bounds haven't changed significantly
      if (boundsString === lastBounds) return
      
      setLoading(true)
      setLastBounds(boundsString)

      try {
        // Filter and convert PropertyType to supported types
        const supportedTypes = propertyTypes
          .filter(type => ['commercial', 'industrial', 'multifamily'].includes(type))
          .map(type => {
            if (type === 'mixed-use') return 'commercial'
            return type as 'commercial' | 'industrial' | 'multifamily'
          })
          .filter((type, index, array) => array.indexOf(type) === index) // Remove duplicates

        if (supportedTypes.length === 0) {
          setProperties([])
          setLoading(false)
          return
        }

        const filters: PropertyFilters = {
          types: supportedTypes,
          bounds: {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          }
        }

        const fetchedProperties = await propertyDataService.fetchProperties(filters)
        setProperties(fetchedProperties)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchProperties()

    // Fetch on map move (debounced)
    let timeoutId: NodeJS.Timeout
    const handleMoveEnd = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(fetchProperties, 1000)
    }

    map.on('moveend', handleMoveEnd)
    
    return () => {
      map.off('moveend', handleMoveEnd)
      clearTimeout(timeoutId)
    }
  }, [map, visible, propertyTypes, lastBounds])

  // Add/remove layers based on visibility and data
  useEffect(() => {
    if (!map) return

    if (!visible || properties.length === 0) {
      // Remove all layers
      layerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      })
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId)
      }
      return
    }

    // Create GeoJSON from properties
    const geojson = {
      type: 'FeatureCollection' as const,
      features: properties.map(property => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [property.coordinates.lng, property.coordinates.lat]
        },
        properties: {
          id: property.id,
          type: property.type,
          address: property.address,
          price: property.price || 0,
          squareFootage: property.squareFootage || 0,
          description: property.description || '',
          source: property.source
        }
      }))
    }

    // Remove existing layers and source
    layerIds.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId)
      }
    })
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    })

    // Add base pillar layer (extruded cylinder)
    map.addLayer({
      id: 'property-listings-base',
      type: 'fill-extrusion',
      source: sourceId,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['==', ['get', 'type'], 'commercial'], '#2563eb', // Darker blue
          ['==', ['get', 'type'], 'industrial'], '#d97706', // Darker orange
          ['==', ['get', 'type'], 'multifamily'], '#059669', // Darker green
          '#374151' // Darker gray fallback
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 50,
          12, 200,
          16, 500
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.95
      }
    })

    // Add glow effect layer
    map.addLayer({
      id: 'property-listings-glow',
      type: 'fill-extrusion',
      source: sourceId,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['==', ['get', 'type'], 'commercial'], '#2563eb',
          ['==', ['get', 'type'], 'industrial'], '#d97706',
          ['==', ['get', 'type'], 'multifamily'], '#059669',
          '#374151'
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 60,
          12, 220,
          16, 520
        ],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.5
      }
    })

    // Add pillar light beam layer
    map.addLayer({
      id: 'property-listings-pillar',
      type: 'fill-extrusion',
      source: sourceId,
      paint: {
        'fill-extrusion-color': [
          'case',
          ['==', ['get', 'type'], 'commercial'], '#60a5fa',
          ['==', ['get', 'type'], 'industrial'], '#fbbf24',
          ['==', ['get', 'type'], 'multifamily'], '#34d399',
          '#6b7280'
        ],
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 100,
          12, 400,
          16, 1000
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 50,
          12, 200,
          16, 500
        ],
        'fill-extrusion-opacity': 0.8
      }
    })

    // Add bright top layer
    map.addLayer({
      id: 'property-listings-top',
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 3,
          12, 6,
          16, 12
        ],
        'circle-color': [
          'case',
          ['==', ['get', 'type'], 'commercial'], '#dbeafe',
          ['==', ['get', 'type'], 'industrial'], '#fef3c7',
          ['==', ['get', 'type'], 'multifamily'], '#d1fae5',
          '#f3f4f6'
        ],
        'circle-opacity': 1,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
        'circle-stroke-opacity': 0.9
      }
    })

    // Add click handler for property interaction
    const handleClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['property-listings-top']
      })

      if (features.length > 0) {
        const feature = features[0]
        const propertyId = feature.properties?.id
        const property = properties.find(p => p.id === propertyId)
        
        if (property && onPropertyClick) {
          onPropertyClick(property)
        }

        // Show popup with property info
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="property-popup">
              <h3 class="font-semibold text-sm mb-2">${feature.properties?.address}</h3>
              <div class="text-xs space-y-1">
                <div><strong>Type:</strong> ${feature.properties?.type}</div>
                <div><strong>Source:</strong> ${feature.properties?.source}</div>
                ${feature.properties?.price ? `<div><strong>Price:</strong> $${feature.properties.price.toLocaleString()}</div>` : ''}
                ${feature.properties?.squareFootage ? `<div><strong>Size:</strong> ${feature.properties.squareFootage.toLocaleString()} sq ft</div>` : ''}
                ${feature.properties?.description ? `<div><strong>Description:</strong> ${feature.properties.description}</div>` : ''}
              </div>
            </div>
          `)
          .addTo(map)
      }
    }

    // Add hover effect
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', handleClick)
    map.on('mouseenter', 'property-listings-top', handleMouseEnter)
    map.on('mouseleave', 'property-listings-top', handleMouseLeave)

    return () => {
      map.off('click', handleClick)
      map.off('mouseenter', 'property-listings-top', handleMouseEnter)
      map.off('mouseleave', 'property-listings-top', handleMouseLeave)
    }
  }, [map, visible, properties, onPropertyClick])

  // Show loading indicator
  if (loading && visible) {
    return (
      <div className="absolute top-4 right-4 z-50 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
        Loading properties...
      </div>
    )
  }

  return null
}

export default PropertyListingsOverlay 