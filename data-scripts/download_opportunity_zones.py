#!/usr/bin/env python3
"""
Download complete opportunity zones dataset
"""

import requests
import json
import os

def download_opportunity_zones():
    # Try multiple sources
    sources = [
        "https://opendata.arcgis.com/datasets/0ef47379cbae44e88267c01eaec2ff6e_0.geojson",
        "https://raw.githubusercontent.com/OpenDataIS/opportunity-zones/master/data/opportunity-zones.geojson",
        "https://data.cityofchicago.org/api/geospatial/opportunity-zones?method=export&format=GeoJSON"
    ]
    
    for i, url in enumerate(sources):
        print(f"Trying source {i+1}: {url}")
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if 'features' in data and len(data['features']) > 100:
                    print(f"✅ Success! Found {len(data['features'])} opportunity zones")
                    
                    # Save the data
                    with open('opportunity_zones_complete.geojson', 'w') as f:
                        json.dump(data, f)
                    
                    print(f"📁 Saved to: opportunity_zones_complete.geojson")
                    print(f"📊 Total features: {len(data['features'])}")
                    
                    # Show sample properties
                    if data['features']:
                        sample_props = data['features'][0].get('properties', {})
                        print(f"📋 Sample properties: {list(sample_props.keys())}")
                    
                    return True
                else:
                    print(f"❌ Invalid data structure or too few features")
            else:
                print(f"❌ HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("❌ All sources failed. Creating a sample with multiple zones...")
    return False

def create_sample_multiple_zones():
    """Create a sample with multiple opportunity zones for testing"""
    print("Creating sample with multiple zones...")
    
    # Create a sample with 50 opportunity zones
    features = []
    for i in range(50):
        # Create a simple polygon for each zone
        feature = {
            "type": "Feature",
            "id": i + 1,
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-122.3 + (i * 0.01), 47.6 + (i * 0.01)],
                    [-122.3 + (i * 0.01), 47.6 + (i * 0.01) + 0.005],
                    [-122.3 + (i * 0.01) + 0.005, 47.6 + (i * 0.01) + 0.005],
                    [-122.3 + (i * 0.01) + 0.005, 47.6 + (i * 0.01)],
                    [-122.3 + (i * 0.01), 47.6 + (i * 0.01)]
                ]]
            },
            "properties": {
                "OBJECTID": i + 1,
                "ZONE_ID": f"OZ_{i+1:04d}",
                "STATE": "WA",
                "CITY": "Seattle",
                "DESCRIPTION": f"Opportunity Zone {i+1}"
            }
        }
        features.append(feature)
    
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    with open('opportunity_zones_sample.geojson', 'w') as f:
        json.dump(geojson, f)
    
    print(f"✅ Created sample with {len(features)} opportunity zones")
    print("📁 Saved to: opportunity_zones_sample.geojson")

if __name__ == "__main__":
    if not download_opportunity_zones():
        create_sample_multiple_zones() 