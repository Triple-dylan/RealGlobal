import React, { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

// Demo GeoJSON data for different zoning types
const ZONING_DATA = {
  'affordable-housing': {
    color: 'rgba(16, 185, 129, 0.7)', // more saturated green
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Demo Affordable Housing Zone', type: 'affordable-housing' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-74.02, 40.70],
            [-74.01, 40.70],
            [-74.01, 40.71],
            [-74.02, 40.71],
            [-74.02, 40.70]
          ]]
        }
      }
    ]
  },
  'industrial': {
    color: 'rgba(202, 138, 4, 0.7)', // more saturated amber
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Demo Industrial Zone', type: 'industrial' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-74.03, 40.69],
            [-74.02, 40.69],
            [-74.02, 40.70],
            [-74.03, 40.70],
            [-74.03, 40.69]
          ]]
        }
      }
    ]
  },
  'multifamily': {
    color: 'rgba(139, 92, 246, 0.7)', // more saturated purple
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Demo Multifamily Zone', type: 'multifamily' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-74.00, 40.69],
            [-73.99, 40.69],
            [-73.99, 40.70],
            [-74.00, 40.70],
            [-74.00, 40.69]
          ]]
        }
      }
    ]
  },
  'commercial': {
    color: 'rgba(6, 182, 212, 0.7)', // more saturated cyan
    features: [
      {
        type: 'Feature' as const,
        properties: { name: 'Demo Commercial Zone', type: 'commercial' },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [[
            [-73.98, 40.70],
            [-73.97, 40.70],
            [-73.97, 40.71],
            [-73.98, 40.71],
            [-73.98, 40.70]
          ]]
        }
      }
    ]
  }
}

interface ZoningOverlayProps {
  map: mapboxgl.Map | null
  zoningTypes: string[]
}

function addZoningOverlay(map: mapboxgl.Map, zoningTypes: string[]) {
  // Remove all existing zoning layers
  zoningTypes.forEach(zoningType => {
    const layerId = `zoning-${zoningType}-overlay`
    const sourceId = `zoning-${zoningType}-source`
    
    if (map.getLayer && map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getLayer && map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
    if (map.getSource && map.getSource(sourceId)) map.removeSource(sourceId)
  })

  // Add layers for each selected zoning type
  zoningTypes.forEach(zoningType => {
    const layerId = `zoning-${zoningType}-overlay`
    const sourceId = `zoning-${zoningType}-source`
    const zoningData = ZONING_DATA[zoningType as keyof typeof ZONING_DATA]
    
    if (!zoningData) return

    const geojson = {
      type: 'FeatureCollection' as const,
      features: zoningData.features
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    })

    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': zoningData.color,
        'fill-opacity': 0.7
      }
    })

    map.addLayer({
      id: layerId + '-outline',
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': zoningData.color,
        'line-width': 2.5
      }
    })

    console.log(`✅ ${zoningType} overlay added successfully`)
  })
}

function removeZoningOverlays(map: mapboxgl.Map, zoningTypes: string[]) {
  zoningTypes.forEach(zoningType => {
    const layerId = `zoning-${zoningType}-overlay`
    const sourceId = `zoning-${zoningType}-source`
    
    if (map.getLayer && map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getLayer && map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
    if (map.getSource && map.getSource(sourceId)) map.removeSource(sourceId)
  })
}

const ZoningOverlay: React.FC<ZoningOverlayProps> = ({ map, zoningTypes }) => {
  useEffect(() => {
    if (!map) return

    console.log('[ZoningOverlay] Zoning types:', zoningTypes)

    function safeAddOverlay() {
      if (!map) return
      if (!map.isStyleLoaded()) return
      if (zoningTypes.length > 0) {
        addZoningOverlay(map, zoningTypes)
      } else {
        // Remove all zoning overlays if none selected
        Object.keys(ZONING_DATA).forEach(zoningType => {
          const layerId = `zoning-${zoningType}-overlay`
          const sourceId = `zoning-${zoningType}-source`
          
          if (map.getLayer && map.getLayer(layerId)) map.removeLayer(layerId)
          if (map.getLayer && map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
          if (map.getSource && map.getSource(sourceId)) map.removeSource(sourceId)
        })
      }
    }

    if (map.isStyleLoaded()) {
      safeAddOverlay()
    } else {
      map.once('styledata', safeAddOverlay)
    }

    return () => {
      if (!map) return
      removeZoningOverlays(map, zoningTypes)
      map.off('styledata', safeAddOverlay)
    }
  }, [map, zoningTypes])

  return null
}

export default ZoningOverlay 