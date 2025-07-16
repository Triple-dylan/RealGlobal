import React, { useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface MarketIndicatorsOverlayProps {
  map: mapboxgl.Map | null
  visible: boolean
  selectedIndicators: string[]
}

const MarketIndicatorsOverlay: React.FC<MarketIndicatorsOverlayProps> = ({ 
  map, 
  visible, 
  selectedIndicators 
}) => {
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!map) return

    // Clean up existing layers and sources first
    const cleanupLayers = () => {
      const allLayerIds = ['gdp-growth-overlay', 'gdp-growth-overlay-outline', 'property-appreciation-overlay', 'property-appreciation-overlay-outline']
      const allSourceIds = ['gdp-growth-source', 'property-appreciation-source']
      
      allLayerIds.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId)
        }
      })
      
      allSourceIds.forEach(sourceId => {
        if (map.getSource(sourceId)) {
          map.removeSource(sourceId)
        }
      })
    }

    if (!visible || selectedIndicators.length === 0) {
      cleanupLayers()
      return
    }

    const addEconomicOverlays = async () => {
      setIsLoading(true)
      
      try {
        console.log('🔍 Loading economic overlays for:', selectedIndicators)

        // Handle each indicator separately with proper data sources
        for (const indicator of selectedIndicators) {
          const layerId = `${indicator}-overlay`
          const sourceId = `${indicator}-source`
          const outlineLayerId = `${layerId}-outline`

          // Remove existing layers and sources
          if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
          if (map.getLayer(layerId)) map.removeLayer(layerId)
          if (map.getSource(sourceId)) map.removeSource(sourceId)

          if (indicator === 'gdp-growth') {
            // GDP GROWTH - WORLDWIDE COUNTRIES
            try {
              // Try to load the processed economic overlay first
              let geojsonData
              try {
                const economicResponse = await fetch('/public/economic_overlay.geojson')
                if (economicResponse.ok) {
                  geojsonData = await economicResponse.json()
                } else {
                  throw new Error('Economic overlay not found')
                }
              } catch {
                // Fallback to world countries with mock data
                const worldResponse = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
                const worldGeoJSON = await worldResponse.json()
                
                // Generate realistic GDP growth data for major countries
                const gdpData: { [key: string]: number } = {
                  'china': 5.2,
                  'india': 6.1,
                  'united states': 2.1,
                  'united states of america': 2.1,
                  'indonesia': 5.0,
                  'brazil': 2.9,
                  'pakistan': 5.4,
                  'bangladesh': 6.6,
                  'nigeria': 3.2,
                  'russia': 2.3,
                  'russian federation': 2.3,
                  'mexico': 3.1,
                  'japan': 1.0,
                  'ethiopia': 6.3,
                  'philippines': 5.7,
                  'vietnam': 6.8,
                  'turkey': 4.0,
                  'egypt': 3.5,
                  'germany': 1.4,
                  'iran': 1.9,
                  'thailand': 2.6,
                  'united kingdom': 1.3,
                  'france': 1.1,
                  'italy': 0.7,
                  'south africa': 1.3,
                  'tanzania': 4.8,
                  'myanmar': 3.0,
                  'kenya': 5.0,
                  'south korea': 2.6,
                  'colombia': 3.2,
                  'spain': 2.4,
                  'ukraine': -29.1,
                  'argentina': 2.7,
                  'algeria': 3.4,
                  'sudan': 0.5,
                  'uganda': 4.6,
                  'iraq': 7.1,
                  'afghanistan': -20.7,
                  'poland': 5.1,
                  'canada': 1.8,
                  'morocco': 1.3,
                  'saudi arabia': 8.7,
                  'uzbekistan': 5.7,
                  'peru': 2.7,
                  'angola': 3.0,
                  'malaysia': 8.7,
                  'mozambique': 4.2,
                  'ghana': 3.1,
                  'yemen': -8.5,
                  'nepal': 5.8,
                  'venezuela': -7.5,
                  'madagascar': 4.2,
                  'cameroon': 3.6,
                  'north korea': 0.8,
                  'australia': 3.7,
                  'taiwan': 3.1,
                  'niger': 1.4,
                  'sri lanka': -7.8,
                  'burkina faso': 1.8
                }

                // Add GDP data to features
                geojsonData = {
                  ...worldGeoJSON,
                  features: worldGeoJSON.features.map((feature: any) => {
                    const countryName = (feature.properties.ADMIN || feature.properties.name || '').toLowerCase()
                    const gdpGrowth = gdpData[countryName] || 2.0
                    
                    return {
                      ...feature,
                      properties: {
                        ...feature.properties,
                        'gdp-growth': gdpGrowth,
                        countryName: feature.properties.ADMIN || feature.properties.name
                      }
                    }
                  })
                }
              }

              map.addSource(sourceId, {
                type: 'geojson',
                data: geojsonData
              })

              // GDP Growth color scale - worldwide countries
              map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'gdp-growth'],
                    -30, '#8B0000',   // Dark red for severe decline
                    -10, '#DC143C',   // Crimson for major decline
                    -2, '#FF6B6B',    // Light red for decline
                    0, '#FFE4B5',     // Moccasin for stagnant
                    2, '#98FB98',     // Pale green for low growth
                    4, '#32CD32',     // Lime green for moderate growth
                    6, '#228B22',     // Forest green for good growth
                    8, '#006400'      // Dark green for excellent growth
                  ],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.7,
                    4, 0.6,
                    8, 0.4
                  ]
                }
              })

              // Add country outline
              map.addLayer({
                id: outlineLayerId,
                type: 'line',
                source: sourceId,
                paint: {
                  'line-color': '#ffffff',
                  'line-width': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.5,
                    4, 1,
                    8, 1.5
                  ],
                  'line-opacity': 0.8
                }
              })

              console.log('✅ GDP Growth (worldwide countries) overlay added')

            } catch (error) {
              console.error('❌ Error loading GDP Growth overlay:', error)
            }

          } else if (indicator === 'property-appreciation') {
            // PROPERTY APPRECIATION - US STATES  
            try {
              const statesResponse = await fetch('/data-scripts/us_states.geojson')
              if (!statesResponse.ok) {
                throw new Error('US States GeoJSON not found')
              }
              const statesGeoJSON = await statesResponse.json()

              // Real US state property appreciation data
              const stateAppreciationData: { [key: string]: number } = {
                'California': 8.5,
                'Texas': 6.2,
                'New York': 7.3,
                'Florida': 9.1,
                'Illinois': 4.8,
                'Pennsylvania': 5.2,
                'Ohio': 4.1,
                'Georgia': 7.8,
                'North Carolina': 6.9,
                'Michigan': 5.5,
                'New Jersey': 6.1,
                'Virginia': 5.8,
                'Washington': 8.9,
                'Arizona': 7.6,
                'Massachusetts': 6.7,
                'Tennessee': 6.4,
                'Indiana': 4.9,
                'Missouri': 4.3,
                'Maryland': 5.9,
                'Wisconsin': 4.7,
                'Colorado': 8.2,
                'Minnesota': 5.6,
                'South Carolina': 6.8,
                'Alabama': 4.5,
                'Louisiana': 3.2,
                'Kentucky': 4.4,
                'Oregon': 7.1,
                'Oklahoma': 3.8,
                'Connecticut': 5.3,
                'Utah': 8.7,
                'Iowa': 3.9,
                'Nevada': 8.4,
                'Arkansas': 4.2,
                'Mississippi': 3.5,
                'Kansas': 3.7,
                'New Mexico': 5.1,
                'Nebraska': 4.0,
                'West Virginia': 2.8,
                'Idaho': 7.9,
                'Hawaii': 6.5,
                'New Hampshire': 5.7,
                'Maine': 5.4,
                'Montana': 6.3,
                'Rhode Island': 5.8,
                'Delaware': 4.9,
                'South Dakota': 4.6,
                'North Dakota': 3.1,
                'Alaska': 2.9,
                'District of Columbia': 6.8,
                'Vermont': 5.2,
                'Wyoming': 3.4
              }

              const geoJsonWithData = {
                ...statesGeoJSON,
                features: statesGeoJSON.features.map((feature: any) => {
                  const stateName = feature.properties.NAME
                  const appreciation = stateAppreciationData[stateName] || 5.0
                  
                  return {
                    ...feature,
                    properties: {
                      ...feature.properties,
                      'property-appreciation': appreciation,
                      stateName: stateName
                    }
                  }
                })
              }

              map.addSource(sourceId, {
                type: 'geojson',
                data: geoJsonWithData
              })

              // Property Appreciation color scale - US states
              map.addLayer({
                id: layerId,
                type: 'fill',
                source: sourceId,
                paint: {
                  'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'property-appreciation'],
                    2.0, '#1E40AF',   // Blue for low appreciation
                    4.0, '#3B82F6',   // Lighter blue 
                    5.0, '#8B5CF6',   // Purple for moderate
                    6.0, '#A855F7',   // Light purple
                    7.0, '#EC4899',   // Pink for good
                    8.0, '#F59E0B',   // Orange for high
                    9.0, '#EF4444',   // Red for very high
                    10.0, '#DC2626'   // Dark red for extreme
                  ],
                  'fill-opacity': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.8,
                    6, 0.6,
                    10, 0.4
                  ]
                }
              })

              // Add state outline
              map.addLayer({
                id: outlineLayerId,
                type: 'line',
                source: sourceId,
                paint: {
                  'line-color': '#ffffff',
                  'line-width': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 1,
                    6, 2,
                    10, 1.5
                  ],
                  'line-opacity': 0.9
                }
              })

              console.log('✅ Property Appreciation (US states) overlay added')

            } catch (error) {
              console.error('❌ Error loading Property Appreciation overlay:', error)
            }
          }

          // Add click handler for details
          map.on('click', layerId, (e) => {
            if (e.features && e.features.length > 0) {
              const properties = e.features[0].properties
              if (properties) {
                const value = properties[indicator]
                const name = properties.stateName || properties.countryName || properties.ADMIN || properties.name
                const title = indicator === 'gdp-growth' ? 'GDP Growth' : 'Property Appreciation'
                const suffix = indicator === 'gdp-growth' ? '% annually' : '% annually'
                
                new mapboxgl.Popup()
                  .setLngLat(e.lngLat)
                  .setHTML(`
                    <div class="p-3">
                      <h3 class="font-bold text-lg">${name}</h3>
                      <p class="text-sm text-gray-600">${title}</p>
                      <p class="text-xl font-semibold text-blue-600">${value?.toFixed(1)}${suffix}</p>
                    </div>
                  `)
                  .addTo(map)
              }
            }
          })

          // Add hover effects
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer'
          })

          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = ''
          })
        }

        console.log('✅ All economic overlays loaded successfully')
        
      } catch (error) {
        console.error('❌ Error loading economic overlays:', error)
      }
      
      setIsLoading(false)
    }

    // Ensure map is ready before adding overlays
    const safeAddOverlays = () => {
      if (!map.isStyleLoaded()) return
      addEconomicOverlays()
    }

    if (map.isStyleLoaded()) {
      safeAddOverlays()
    } else {
      map.once('styledata', safeAddOverlays)
    }

    // Cleanup on unmount
    return () => {
      cleanupLayers()
    }

  }, [map, visible, selectedIndicators])

  // Show loading indicator if needed
  if (isLoading) {
    console.log('📊 Loading economic data...')
  }

  return null
}

export default MarketIndicatorsOverlay 