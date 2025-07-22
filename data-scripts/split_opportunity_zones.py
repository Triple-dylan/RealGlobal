#!/usr/bin/env python3
"""
Split MultiPolygon opportunity zones into separate individual Polygon features
for better Mapbox compatibility.
"""

import json

def split_multipolygon():
    # Read the converted GeoJSON
    with open('opportunity_zones_wgs84.geojson', 'r') as f:
        geojson = json.load(f)
    
    # Create new feature collection
    new_features = []
    
    for feature in geojson['features']:
        if feature['geometry']['type'] == 'MultiPolygon':
            # Get the coordinates for each polygon in the MultiPolygon
            multipolygon_coords = feature['geometry']['coordinates']
            
            # Create a separate feature for each polygon
            for i, polygon_coords in enumerate(multipolygon_coords):
                new_feature = {
                    "type": "Feature",
                    "id": f"{feature.get('id', 'unknown')}_{i}",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": polygon_coords
                    },
                    "properties": {
                        **feature.get('properties', {}),
                        "polygon_index": i,
                        "total_polygons": len(multipolygon_coords)
                    }
                }
                new_features.append(new_feature)
        else:
            # Keep non-MultiPolygon features as-is
            new_features.append(feature)
    
    # Create new GeoJSON
    new_geojson = {
        "type": "FeatureCollection",
        "crs": geojson['crs'],
        "features": new_features
    }
    
    # Write split GeoJSON
    with open('opportunity_zones_split.geojson', 'w') as f:
        json.dump(new_geojson, f)
    
    print(f"✅ Split MultiPolygon into {len(new_features)} individual features")
    print("📁 Output: opportunity_zones_split.geojson")
    
    # Print info about the split
    original_count = len(geojson['features'])
    print(f"📊 Original features: {original_count}")
    print(f"📊 New features: {len(new_features)}")
    
    # Show sample of new features
    if new_features:
        print(f"📍 Sample feature ID: {new_features[0].get('id')}")
        print(f"📍 Sample coordinates: {new_features[0]['geometry']['coordinates'][0][0]}")

if __name__ == "__main__":
    try:
        split_multipolygon()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc() 