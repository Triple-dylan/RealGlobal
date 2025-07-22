#!/usr/bin/env python3
"""
Convert Opportunity Zones GeoJSON from EPSG:2926 to WGS84 coordinates
for use in Mapbox GL JS.
"""

import json
import pyproj
from pyproj import Transformer
import sys

def convert_coordinates():
    # Read the original GeoJSON
    with open('Opportunity_Zones_-4513523067566272484.geojson', 'r') as f:
        geojson = json.load(f)
    
    # Create coordinate transformer from EPSG:2926 to WGS84
    # EPSG:2926 appears to be Washington State Plane Coordinate System
    transformer = Transformer.from_crs("EPSG:2926", "EPSG:4326", always_xy=True)
    
    # Convert coordinates in each feature
    for feature in geojson['features']:
        if feature['geometry']['type'] == 'MultiPolygon':
            for polygon in feature['geometry']['coordinates']:
                for ring in polygon:
                    for i, coord in enumerate(ring):
                        # Transform coordinates (x, y) -> (lon, lat)
                        lon, lat = transformer.transform(coord[0], coord[1])
                        ring[i] = [lon, lat]
    
    # Update CRS to WGS84
    geojson['crs'] = {
        "type": "name",
        "properties": {
            "name": "EPSG:4326"
        }
    }
    
    # Write converted GeoJSON
    with open('opportunity_zones_wgs84.geojson', 'w') as f:
        json.dump(geojson, f)
    
    print("✅ Converted opportunity zones to WGS84 coordinates")
    print("📁 Output: opportunity_zones_wgs84.geojson")
    
    # Print sample coordinates to verify
    if geojson['features']:
        sample_coords = geojson['features'][0]['geometry']['coordinates'][0][0][0]
        print(f"📍 Sample coordinates: {sample_coords}")

if __name__ == "__main__":
    try:
        convert_coordinates()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure pyproj is installed: pip install pyproj")
        sys.exit(1) 