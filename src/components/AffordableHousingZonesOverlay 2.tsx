import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { taxCreditZonesAPI } from '../services/api'

interface AffordableHousingZonesOverlayProps {
  map: mapboxgl.Map | null
  visible: boolean
  debug?: boolean
}

const AffordableHousingZonesOverlay: React.FC<AffordableHousingZonesOverlayProps> = ({ map, visible, debug }) => {
  console.log('AffordableHousingZonesOverlay mounted with visible:', visible)
  const dataRef = useRef<any>(null)
  const layerId = 'affordable-housing-zones-overlay'
  const sourceId = 'affordable-housing-zones-source'

  useEffect(() => {
    if (!map) {
      console.log('[AffordableHousingZonesOverlay] Map not provided')
      return
    }

    console.log('[AffordableHousingZonesOverlay] Starting zones overlay setup...')
    let removed = false
    
    const cleanup = () => {
      if (removed) return
      if (!map || (map as any)._removed) return
      if (map.getLayer && map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer && map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
      if (map.getLayer && map.getLayer(layerId + '-glow')) map.removeLayer(layerId + '-glow')
      if (map.getSource && map.getSource(sourceId)) map.removeSource(sourceId)
      removed = true
      console.log('[AffordableHousingZonesOverlay] 🗑️ Zones overlay removed')
    }

    if (!visible) {
      console.log('[AffordableHousingZonesOverlay] Zones overlay disabled')
      cleanup()
      return
    }

    const addOverlay = async () => {
      try {
        if (!map || (map as any)._removed) {
          console.log('[AffordableHousingZonesOverlay] Map is removed or undefined')
          return
        }

        console.log('[AffordableHousingZonesOverlay] Fetching affordable housing zones data...')
        
        // Get current map bounds to limit data fetch
        const bounds = map.getBounds()
        const boundsObj = {
          north: bounds.getNorth(),
          south: bounds.getSouth(), 
          east: bounds.getEast(),
          west: bounds.getWest()
        }
        
        const zonesData = await taxCreditZonesAPI.getAffordableHousingZones(boundsObj)
        dataRef.current = zonesData
        console.log('[AffordableHousingZonesOverlay] Zones data loaded, polygons:', zonesData.length)

        if (zonesData.length === 0) {
          console.log('[AffordableHousingZonesOverlay] No zone data found for current view')
          return
        }

        // Create GeoJSON FeatureCollection for zones
        const geojson: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: zonesData
        }

        // Remove previous layer/source if exists
        if (!map || (map as any)._removed) return
        if (map.getLayer && map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer && map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
        if (map.getLayer && map.getLayer(layerId + '-glow')) map.removeLayer(layerId + '-glow')
        if (map.getSource && map.getSource(sourceId)) map.removeSource(sourceId)

        console.log('[AffordableHousingZonesOverlay] Adding zones source and layers...')
        
        // Add source
        if (!map || (map as any)._removed) return
        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson
        })

        // Enhanced fill layer
        if (!map || (map as any)._removed) return
        map.addLayer({
          id: layerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(16, 185, 129, 0.85)', // more saturated green
              3, 'rgba(16, 185, 129, 0.8)',
              8, 'rgba(5, 150, 105, 0.7)',
              12, 'rgba(4, 120, 87, 0.6)'
            ],
            'fill-opacity': 1
          }
        })

        // Enhanced primary outline
        if (!map || (map as any)._removed) return
        map.addLayer({
          id: layerId + '-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(16, 185, 129, 1.0)',
              3, 'rgba(5, 150, 105, 0.95)',
              8, 'rgba(4, 120, 87, 0.9)',
              12, 'rgba(4, 120, 87, 0.85)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 3.5,
              3, 3,
              8, 2.5,
              12, 2
            ],
            'line-blur': 0.3
          }
        })

        // Subtle glow
        if (!map || (map as any)._removed) return
        map.addLayer({
          id: layerId + '-glow',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 'rgba(0, 255, 127, 0.4)',
              3, 'rgba(0, 255, 127, 0.3)',
              8, 'rgba(0, 240, 120, 0.2)',
              12, 'rgba(0, 220, 110, 0.15)'
            ],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 5,
              3, 4,
              8, 3,
              12, 2
            ],
            'line-blur': 2
          }
        })

        console.log('[AffordableHousingZonesOverlay] ✅ Zones overlay added successfully')
      } catch (err) {
        console.error('[AffordableHousingZonesOverlay] ❌ Error in addOverlay:', err)
      }
    }

    function safeAddOverlay() {
      if (!map) return
      if (!map.isStyleLoaded()) return
      if (visible) {
        addOverlay()
      } else {
        cleanup()
      }
    }

    if (map.isStyleLoaded()) {
      if (visible) {
        addOverlay()
      } else {
        cleanup()
      }
    } else {
      map.once('styledata', safeAddOverlay)
    }

    // Re-fetch data when map moves significantly
    const onMoveEnd = () => {
      if (visible) {
        addOverlay()
      }
    }
    
    map.on('moveend', onMoveEnd)

    return () => {
      cleanup()
      if (map && map.off) {
        map.off('styledata', safeAddOverlay)
        map.off('moveend', onMoveEnd)
      }
    }
  }, [map, visible, debug])

  // Mouse interaction effects for zones
  useEffect(() => {
    if (!map || !visible) return
    
          let popup: mapboxgl.Popup | null = null
    
    function onMouseEnter() {
      if (map) map.getCanvas().style.cursor = 'pointer'
    }
    
    function onMouseLeave() {
      if (map) map.getCanvas().style.cursor = ''
      if (popup) {
        popup.remove()
        popup = null
      }
    }
    
    function onMouseMove(e: any) {
      const feature = e.features && e.features[0]
      if (!feature) return
      
      const props = feature.properties
      const zoneType = props.zone_type || 'Unknown'
      const tractName = props.tract_name || props.name || 'Affordable Housing Zone'
      
      const zoneInfo = zoneType === 'QCT' 
        ? {
            title: 'Qualified Census Tract',
            benefit: 'Up to 30% additional tax credits',
            description: 'Low-income area with enhanced LIHTC benefits'
          }
        : {
            title: 'Difficult Development Area', 
            benefit: 'Up to 30% additional tax credits',
            description: 'High-cost area with enhanced development incentives'
          }
      
      if (!popup) {
        popup = new mapboxgl.Popup({ 
          closeButton: false, 
          closeOnClick: false,
          maxWidth: '280px',
          className: 'dark-popup'
        })
      }
      
      popup.setLngLat(e.lngLat).setHTML(
        `<div style='font-size:10px; line-height:1.3; padding:6px; background:rgba(30, 41, 59, 0.85); border-radius:6px; box-shadow:0 4px 12px rgba(0,0,0,0.3); border-left: 3px solid ${zoneType === 'QCT' ? '#3b82f6' : '#ef4444'}; backdrop-filter: blur(8px);'>
          <div style='font-weight:600; margin-bottom:3px; color:#f1f5f9; font-size:11px;'>${tractName}</div>
          <div style='color:#cbd5e1; margin-bottom:2px; font-weight:500; font-size:9px;'>${zoneInfo.title}</div>
          <div style='color:#10b981; margin-bottom:1px; font-size:8px; font-weight:600;'>${zoneInfo.benefit}</div>
          <div style='color:#94a3b8; font-size:8px;'>${zoneInfo.description}</div>
        </div>`
      ).addTo(map)
    }
    
    if (map.on) {
      // QCT layer events (both fill and border)
      map.on('mouseenter', layerId, onMouseEnter)
      map.on('mouseleave', layerId, onMouseLeave)
      map.on('mousemove', layerId, onMouseMove)
      map.on('mouseenter', layerId + '-outline', onMouseEnter)
      map.on('mouseleave', layerId + '-outline', onMouseLeave)
      map.on('mousemove', layerId + '-outline', onMouseMove)
      
      // DDA layer events (both fill and border)
      map.on('mouseenter', layerId + '-glow', onMouseEnter)
      map.on('mouseleave', layerId + '-glow', onMouseLeave)
      map.on('mousemove', layerId + '-glow', onMouseMove)
    }
    
    return () => {
      if (map && map.off) {
        // Remove QCT events
        map.off('mouseenter', layerId, onMouseEnter)
        map.off('mouseleave', layerId, onMouseLeave) 
        map.off('mousemove', layerId, onMouseMove)
        map.off('mouseenter', layerId + '-outline', onMouseEnter)
        map.off('mouseleave', layerId + '-outline', onMouseLeave) 
        map.off('mousemove', layerId + '-outline', onMouseMove)
        
        // Remove DDA events
        map.off('mouseenter', layerId + '-glow', onMouseEnter)
        map.off('mouseleave', layerId + '-glow', onMouseLeave) 
        map.off('mousemove', layerId + '-glow', onMouseMove)
      }
      if (popup) popup.remove()
    }
  }, [map, visible])

  return null
}

export default AffordableHousingZonesOverlay 