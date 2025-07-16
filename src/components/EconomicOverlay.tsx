import React, { useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { economicDataService } from '../services/economicData'

interface EconomicOverlayProps {
  map: mapboxgl.Map | null
  visible: boolean
  indicator?: string
  debug?: boolean
}

const ECONOMIC_GEOJSON = '/economic_overlay.cleaned.geojson'

const EconomicOverlay: React.FC<EconomicOverlayProps> = ({ map, visible, indicator = 'gdp-growth', debug }) => {
  const layerId = 'economic-overlay'
  const sourceId = 'economic-overlay-source'

  useEffect(() => {
    if (!map) return
    
    if (!visible) {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
      if (map.getSource(sourceId)) map.removeSource(sourceId)
      return
    }

    let removed = false
    let cleanup = () => {}

    const addOverlay = async () => {
      const layersToRemove = [layerId, layerId + '-outline']
      layersToRemove.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id)
      })
      
      if (map.getSource(sourceId)) map.removeSource(sourceId)

      try {
        // Use economic data service to get updated GeoJSON with real economic data
        const geojson = await economicDataService.updateGeoJSONWithEconomicData(ECONOMIC_GEOJSON)
        
        if (debug) {
          console.log('Economic overlay data loaded:', geojson)
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
            'fill-color': [
              'case',
              ['<', ['to-number', ['get', 'gdp_growth']], 0],
              'rgb(239, 68, 68)',    // Decline (< 0%) - Strong red
              
              ['<', ['to-number', ['get', 'gdp_growth']], 0.5],
              'rgb(51, 65, 85)',      // Flat (0-0.5%) - Dark blue-gray
              
              ['<', ['to-number', ['get', 'gdp_growth']], 2.5],
              'rgb(56, 189, 248)',   // Low (0.5-2.5%) - Bright cyan
              
              ['<', ['to-number', ['get', 'gdp_growth']], 5],
              'rgb(37, 99, 235)',    // Medium (2.5-5%) - Vivid blue
              
              'rgb(30, 64, 175)'     // High (> 5%) - Deep blue
            ],
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.85,
              0.7
            ]
          }
        })

        map.addLayer({
          id: layerId + '-outline',
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#fff',
              'rgba(30, 41, 59, 0.7)'
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2.5,
              1.5
            ],
            'line-opacity': 0.9
          }
        })

        // Add hover functionality
        let hoveredFeatureId: string | number | null = null
        let tooltip: HTMLDivElement | null = null

        const createTooltip = () => {
          if (tooltip) tooltip.remove()
          tooltip = document.createElement('div')
          tooltip.className = 'economic-tooltip'
          tooltip.style.cssText = `
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
            pointer-events: none;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            font-family: system-ui, -apple-system, sans-serif;
          `
          document.body.appendChild(tooltip)
          return tooltip
        }

        map.on('mousemove', layerId, (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0]
            
            // Update feature state for hover effect
            if (hoveredFeatureId !== null) {
              map.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: false }
              )
            }
            
            hoveredFeatureId = feature.id || feature.properties?.id || Math.random()
            
            if (hoveredFeatureId !== null) {
              map.setFeatureState(
                { source: sourceId, id: hoveredFeatureId },
                { hover: true }
              )
            }

            // Show tooltip with economic data
            if (feature.properties) {
              const currentTooltip = createTooltip()
              const gdpGrowth = parseFloat(feature.properties.gdp_growth || 0)
              const unemploymentRate = parseFloat(feature.properties.unemployment_rate || 0)
              const inflationRate = parseFloat(feature.properties.inflation_rate || 0)
              const countryName = feature.properties.name || feature.properties.NAME || feature.properties.ADMIN || 'Unknown'
              
              // Create a clean, structured tooltip
              currentTooltip.innerHTML = `
                <div>
                  <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #ffffff;">
                    ${countryName}
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #94a3b8; font-size: 12px;">GDP Growth:</span>
                      <span style="color: ${gdpGrowth >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; font-size: 12px;">
                        ${gdpGrowth >= 0 ? '+' : ''}${gdpGrowth.toFixed(1)}%
                      </span>
                    </div>
                    ${unemploymentRate > 0 ? `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #94a3b8; font-size: 12px;">Unemployment:</span>
                      <span style="color: ${unemploymentRate <= 4 ? '#10b981' : unemploymentRate <= 8 ? '#f59e0b' : '#ef4444'}; font-weight: 600; font-size: 12px;">
                        ${unemploymentRate.toFixed(1)}%
                      </span>
                    </div>
                    ` : ''}
                    ${inflationRate > 0 ? `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="color: #94a3b8; font-size: 12px;">Inflation:</span>
                      <span style="color: ${inflationRate < 3 ? '#10b981' : inflationRate < 6 ? '#f59e0b' : '#ef4444'}; font-weight: 600; font-size: 12px;">
                        ${inflationRate.toFixed(1)}%
                      </span>
                    </div>
                    ` : ''}
                  </div>
                </div>
              `
              
              // Position tooltip near mouse
              currentTooltip.style.left = e.originalEvent.pageX + 10 + 'px'
              currentTooltip.style.top = e.originalEvent.pageY - 10 + 'px'
              
              map.getCanvas().style.cursor = 'pointer'
            }
          }
        })

        map.on('mouseleave', layerId, () => {
          if (hoveredFeatureId !== null) {
            map.setFeatureState(
              { source: sourceId, id: hoveredFeatureId },
              { hover: false }
            )
          }
          hoveredFeatureId = null
          map.getCanvas().style.cursor = ''
          
          // Remove tooltip
          if (tooltip) {
            tooltip.remove()
            tooltip = null
          }
        })

        // Add popup on click
        map.on('click', layerId, (e) => {
          const feature = e.features?.[0]
          if (feature?.properties) {
            const props = feature.properties
            const gdpGrowth = props.gdp_growth || 0
            const unemploymentRate = props.unemployment_rate || 0
            const inflationRate = props.inflation_rate || 0
            const countryName = props.NAME || props.ADMIN || 'Unknown'
            
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: 'Courier New', monospace; font-size: 10px; color: #333; padding: 8px; min-width: 200px;">
                  <div style="font-weight: bold; margin-bottom: 6px; color: #1a1a1a;">${countryName}</div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #666;">GDP Growth:</span> 
                    <span style="color: ${gdpGrowth >= 0 ? '#22c55e' : '#ef4444'}; font-weight: bold;">${gdpGrowth.toFixed(1)}%</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #666;">Unemployment:</span> 
                    <span style="color: ${unemploymentRate <= 4 ? '#22c55e' : unemploymentRate <= 8 ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${unemploymentRate.toFixed(1)}%</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #666;">Inflation Rate:</span> 
                    <span style="color: ${inflationRate <= 2 ? '#22c55e' : inflationRate <= 4 ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${inflationRate.toFixed(1)}%</span>
                  </div>
                  <div style="font-size: 8px; color: #888; margin-top: 6px;">
                    Source: ${props.economic_source || 'Economic Data Service'}
                  </div>
                </div>
              `)
              .addTo(map)
          }
        })

      } catch (error) {
        console.error('Error adding economic overlay:', error)
      }

      cleanup = () => {
        if (removed) return
        if (map.getLayer(layerId)) map.removeLayer(layerId)
        if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
        if (map.getSource(sourceId)) map.removeSource(sourceId)
        removed = true
      }
    }

    const removeOverlay = () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getLayer(layerId + '-outline')) map.removeLayer(layerId + '-outline')
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
  }, [map, visible, indicator])

  return null
}

export default EconomicOverlay 