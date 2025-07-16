import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { Property, ZoningData, EconomicData } from '../types'

const SupabaseTest: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [zoningData, setZoningData] = useState<ZoningData[]>([])
  const [economicData, setEconomicData] = useState<EconomicData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setLoading(true)
        
        // Test properties
        const { data: propsData, error: propsError } = await supabase
          .from('properties')
          .select('*')
          .limit(5)
        
        if (propsError) throw propsError
        
        // Test zoning data
        const { data: zoningData, error: zoningError } = await supabase
          .from('zoning_data')
          .select('*')
          .limit(5)
        
        if (zoningError) throw zoningError
        
        // Test economic data
        const { data: econData, error: econError } = await supabase
          .from('economic_data')
          .select('*')
          .limit(5)
        
        if (econError) throw econError

        setProperties(propsData.map(row => ({
          id: row.id,
          address: row.address,
          coordinates: { lat: row.lat, lng: row.lng },
          price: row.price,
          size: row.size,
          type: row.type as any,
          zoning: row.zoning,
          opportunityScore: row.opportunity_score,
          listingDate: row.listing_date,
          status: row.status as any
        })))

        setZoningData(zoningData.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type as any,
          coordinates: row.coordinates,
          restrictions: row.restrictions,
          opportunities: row.opportunities,
          score: row.score
        })))

        setEconomicData(econData.map(row => ({
          region: row.region,
          gdpGrowth: row.gdp_growth,
          propertyAppreciation: row.property_appreciation,
          builderAccessibility: row.builder_accessibility,
          internationalAccessibility: row.international_accessibility,
          lastUpdated: row.last_updated
        })))

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
        Testing Supabase connection...
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-md">
        <h3 className="font-bold mb-2">Supabase Connection Error</h3>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-2">Check your .env.local file and database setup</p>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">✅ Supabase Connected!</h3>
      <div className="text-sm space-y-1">
        <p>Properties: {properties.length}</p>
        <p>Zoning Areas: {zoningData.length}</p>
        <p>Economic Regions: {economicData.length}</p>
      </div>
    </div>
  )
}

export default SupabaseTest 