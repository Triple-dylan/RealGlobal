import React, { useEffect, useState, useCallback } from 'react'
import { CommercialZone, commercialZonesService } from '../../services/commercial/commercial-zones-service'
import { saasTheme } from '../../theme'

interface CommercialZonesOverlayProps {
  map: any
  visible: boolean
  propertyTypes: string[]
  onZoneClick?: (zone: CommercialZone) => void
  interactive?: boolean
}

const CommercialZonesOverlay: React.FC<CommercialZonesOverlayProps> = ({
  map,
  visible,
  propertyTypes,
  onZoneClick,
  interactive = true
}) => {
  const [zones, setZones] = useState<CommercialZone[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedZone, setSelectedZone] = useState<CommercialZone | null>(null)

  // Load commercial zones data
  const loadZones = useCallback(async () => {
    if (!map || !visible) return

    setLoading(true)
    try {
      const bounds = map.getBounds()
      const zonesData = await commercialZonesService.getCommercialZones(bounds)
      
      // Filter zones by selected property types
      const filteredZones = propertyTypes.length > 0 
        ? zonesData.filter(zone => propertyTypes.includes(zone.type))
        : zonesData

      setZones(filteredZones)
    } catch (error) {
      console.error('Error loading commercial zones:', error)
    } finally {
      setLoading(false)
    }
  }, [map, visible, propertyTypes])

  // Add zones to map
  useEffect(() => {
    if (!map || !visible || zones.length === 0) return

    const sourceId = 'commercial-zones'
    const layerId = 'commercial-zones-fill'
    const outlineLayerId = 'commercial-zones-outline'
    const labelLayerId = 'commercial-zones-labels'

    // Remove existing layers and source
    if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId)
    if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    // Create GeoJSON from zones
    const geojson = {
      type: 'FeatureCollection',
      features: zones.map(zone => ({
        type: 'Feature',
        properties: {
          id: zone.id,
          type: zone.type,
          name: zone.name,
          zoning: zone.properties.zoning,
          averageRent: zone.properties.averageRent,
          vacancy: zone.properties.vacancy,
          capRate: zone.market.averageCapRate,
          pricePerSqft: zone.market.pricePerSqft,
          demandTrend: zone.market.demandTrend,
          color: commercialZonesService.getZoneTypeColor(zone.type)
        },
        geometry: zone.geometry
      }))
    }

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    })

    // Add fill layer
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.8,
          0.4
        ]
      }
    })

    // Add outline layer
    map.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': ['get', 'color'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          3,
          1.5
        ],
        'line-opacity': 0.9
      }
    })

    // Add labels layer
    map.addLayer({
      id: labelLayerId,
      type: 'symbol',
      source: sourceId,
      layout: {
        'text-field': '{name}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'center',
        'text-offset': [0, 0]
      },
      paint: {
        'text-color': saasTheme.colors.text.primary,
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
        'text-opacity': 0.9
      }
    })

    // Add interactivity
    if (interactive) {
      let hoveredZoneId: string | null = null

      // Mouse enter
      map.on('mouseenter', layerId, (e: any) => {
        map.getCanvas().style.cursor = 'pointer'
        
        if (e.features.length > 0) {
          if (hoveredZoneId) {
            map.setFeatureState(
              { source: sourceId, id: hoveredZoneId },
              { hover: false }
            )
          }
          hoveredZoneId = e.features[0].properties.id
          map.setFeatureState(
            { source: sourceId, id: hoveredZoneId },
            { hover: true }
          )
        }
      })

      // Mouse leave
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = ''
        
        if (hoveredZoneId) {
          map.setFeatureState(
            { source: sourceId, id: hoveredZoneId },
            { hover: false }
          )
          hoveredZoneId = null
        }
      })

      // Click
      map.on('click', layerId, (e: any) => {
        if (e.features.length > 0) {
          const clickedZone = zones.find(z => z.id === e.features[0].properties.id)
          if (clickedZone) {
            setSelectedZone(clickedZone)
            onZoneClick?.(clickedZone)
            
            // Show popup with zone details
            const popup = new (map.constructor as any).Popup()
              .setLngLat(e.lngLat)
              .setHTML(createZonePopupHTML(clickedZone))
              .addTo(map)
          }
        }
      })
    }

    return () => {
      // Cleanup
      if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId)
      if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
      if (map.getLayer(layerId)) map.removeLayer(layerId)
      if (map.getSource(sourceId)) map.removeSource(sourceId)
    }
  }, [map, visible, zones, interactive, onZoneClick])

  // Load zones when conditions change
  useEffect(() => {
    loadZones()
  }, [loadZones])

  // Remove zones when not visible
  useEffect(() => {
    if (!map || visible) return

    const sourceId = 'commercial-zones'
    const layerId = 'commercial-zones-fill'
    const outlineLayerId = 'commercial-zones-outline'
    const labelLayerId = 'commercial-zones-labels'

    if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId)
    if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
    if (map.getLayer(layerId)) map.removeLayer(layerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)
  }, [map, visible])

  return null // This is a data-only component
}

// Helper function to create popup HTML
function createZonePopupHTML(zone: CommercialZone): string {
  const icon = commercialZonesService.getZoneTypeIcon(zone.type)
  
  return `
    <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 18px;">${icon}</span>
        <h3 style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">${zone.name}</h3>
      </div>
      
      <div style="margin-bottom: 8px;">
        <span style="background: ${commercialZonesService.getZoneTypeColor(zone.type)}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 500;">
          ${zone.type.toUpperCase()}
        </span>
        <span style="background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 4px;">
          ${zone.properties.zoning}
        </span>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
        <div>
          <div style="color: #64748b; font-size: 10px;">Avg Rent</div>
          <div style="font-weight: 600; color: #059669;">$${zone.properties.averageRent}/sqft</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 10px;">Cap Rate</div>
          <div style="font-weight: 600; color: #2563eb;">${zone.market.averageCapRate}%</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 10px;">Vacancy</div>
          <div style="font-weight: 600; color: #dc2626;">${zone.properties.vacancy}%</div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 10px;">Price/SqFt</div>
          <div style="font-weight: 600; color: #7c3aed;">$${zone.market.pricePerSqft}</div>
        </div>
      </div>
      
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
        <div style="font-size: 10px; color: #64748b;">Market Trend</div>
        <div style="font-size: 11px; font-weight: 500; color: ${
          zone.market.demandTrend === 'increasing' ? '#059669' : 
          zone.market.demandTrend === 'stable' ? '#2563eb' : '#dc2626'
        };">
          ${zone.market.demandTrend.charAt(0).toUpperCase() + zone.market.demandTrend.slice(1)}
        </div>
      </div>
    </div>
  `
}

export default CommercialZonesOverlay