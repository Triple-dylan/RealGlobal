import React, { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'

interface OpportunityZonesOverlayProps {
  map: mapboxgl.Map | null
  visible: boolean
}

const OPPORTUNITY_ZONES_GEOJSON = '/data-scripts/opportunity_zones_full.geojson'

const OpportunityZonesOverlay: React.FC<OpportunityZonesOverlayProps> = ({ map, visible }) => {
  const layerId = 'opportunity-zones-overlay'
  const sourceId = 'opportunity-zones-source'

  useEffect(() => {
    if (!map) return
    
    if (!visible) {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
      if (map.getLayer(layerId + '-glow')) map.removeLayer(layerId + '-glow')
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      return
    }

    let removed = false
    let cleanup = () => {}

    const addOverlay = async () => {
      const layersToRemove = [layerId, layerId + '-outline', layerId + '-glow']
      layersToRemove.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id)
      })
      
      if (map.getSource(sourceId)) map.removeSource(sourceId)

      try {
        const geojson = await fetch(OPPORTUNITY_ZONES_GEOJSON).then(res => res.json())
        
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        })

        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(234, 179, 8, 0.7)', // more saturated yellow
              3, 'rgba(202, 138, 4, 0.65)',
              8, 'rgba(202, 138, 4, 0.6)',
              12, 'rgba(202, 138, 4, 0.5)'
            ],
            'fill-opacity': 1
          }
        })

        map.addLayer({
          id: layerId + '-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(202, 138, 4, 0.95)',
              3, 'rgba(202, 138, 4, 0.9)',
              8, 'rgba(202, 138, 4, 0.85)',
              12, 'rgba(202, 138, 4, 0.8)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2.5,
              3, 2,
              8, 1.5,
              12, 1.2
            ],
            'line-blur': 0
          }
        })

        map.addLayer({
          id: layerId + '-glow',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(255, 193, 7, 0.2)',
              3, 'rgba(255, 193, 7, 0.15)',
              8, 'rgba(255, 193, 7, 0.1)',
              12, 'rgba(255, 193, 7, 0.08)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 3,
              3, 2.5,
              8, 2,
              12, 1.5
            ],
            'line-blur': 1
          }
        })

      } catch (error) {
        console.error('Error adding opportunity zones overlay:', error)
      }

      cleanup = () => {
        if (removed) return
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
        if (map.getLayer(layerId + '-glow')) map.removeLayer(layerId + '-glow')
        if (map.getSource(sourceId)) map.removeSource(sourceId)
        removed = true
      }
    }

    const removeOverlay = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
      if (map.getLayer(layerId + '-glow')) map.removeLayer(layerId + '-glow')
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      removed = true
    }

    function safeAddOverlay() {
      if (!map || !map.isStyleLoaded()) {
        return
      }
      if (visible) {
        addOverlay()
      } else {
        removeOverlay()
      }
    }

    if (map.isStyleLoaded()) {
      if (visible) {
        addOverlay()
      } else {
        removeOverlay()
      }
    } else {
      map.once('styledata', safeAddOverlay)
    }

    return () => {
      cleanup()
      if (map) map.off('styledata', safeAddOverlay)
    }
  }, [map, visible])

  return null
}

export default OpportunityZonesOverlay 