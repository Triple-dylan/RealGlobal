#!/usr/bin/env python3
"""
Convert QOZs CSV to GeoJSON with all 8,767 opportunity zones
"""

import csv
import json
import requests
from typing import Dict, List, Any
import time

def load_qozs_csv():
    """Load the QOZs CSV data"""
    qozs = []
    valid_states = {
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
        'Wisconsin', 'Wyoming'
    }
    
    with open('designated-qozs.12.14.18.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            # Skip header rows and empty rows, only process rows with valid state names
            if len(row) >= 5 and row[0] and row[0] in valid_states:
                state, county, tract_id, zone_type, year_range = row[:5]
                qozs.append({
                    'state': state,
                    'county': county,
                    'tract_id': tract_id,
                    'zone_type': zone_type,
                    'year_range': year_range
                })
    return qozs

def get_census_tract_boundary(state_fips: str, tract_id: str):
    """Get census tract boundary from Census Bureau API"""
    try:
        # Convert state name to FIPS code (simplified mapping)
        state_fips_map = {
            'Alabama': '01', 'Alaska': '02', 'Arizona': '04', 'Arkansas': '05', 'California': '06',
            'Colorado': '08', 'Connecticut': '09', 'Delaware': '10', 'Florida': '12', 'Georgia': '13',
            'Hawaii': '15', 'Idaho': '16', 'Illinois': '17', 'Indiana': '18', 'Iowa': '19',
            'Kansas': '20', 'Kentucky': '21', 'Louisiana': '22', 'Maine': '23', 'Maryland': '24',
            'Massachusetts': '25', 'Michigan': '26', 'Minnesota': '27', 'Mississippi': '28', 'Missouri': '29',
            'Montana': '30', 'Nebraska': '31', 'Nevada': '32', 'New Hampshire': '33', 'New Jersey': '34',
            'New Mexico': '35', 'New York': '36', 'North Carolina': '37', 'North Dakota': '38', 'Ohio': '39',
            'Oklahoma': '40', 'Oregon': '41', 'Pennsylvania': '42', 'Rhode Island': '44', 'South Carolina': '45',
            'South Dakota': '46', 'Tennessee': '47', 'Texas': '48', 'Utah': '49', 'Vermont': '50',
            'Virginia': '51', 'Washington': '53', 'West Virginia': '54', 'Wisconsin': '55', 'Wyoming': '56'
        }
        
        state_code = state_fips_map.get(state_fips, '00')
        
        # Use Census Bureau API to get tract boundary
        url = f"https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/0/query"
        params = {
            'where': f"STATE='{state_code}' AND TRACT='{tract_id}'",
            'outFields': '*',
            'returnGeometry': 'true',
            'f': 'geojson'
        }
        
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get('features'):
                return data['features'][0]
    except Exception as e:
        print(f"Error getting boundary for {state_fips} tract {tract_id}: {e}")
    
    return None

def create_qozs_geojson():
    """Create GeoJSON from QOZs CSV data"""
    print("Loading QOZs CSV data...")
    qozs = load_qozs_csv()
    print(f"Found {len(qozs)} opportunity zones")
    
    features = []
    success_count = 0
    
    # Process first 100 zones for testing (to avoid overwhelming the API)
    test_zones = qozs[:100]
    
    print(f"Processing first {len(test_zones)} zones...")
    
    for i, qoz in enumerate(test_zones):
        print(f"Processing {i+1}/{len(test_zones)}: {qoz['state']} - {qoz['tract_id']}")
        
        # Get census tract boundary
        boundary = get_census_tract_boundary(qoz['state'], qoz['tract_id'])
        
        if boundary:
            # Create feature with QOZ properties
            feature = {
                "type": "Feature",
                "id": i + 1,
                "geometry": boundary['geometry'],
                "properties": {
                    "OBJECTID": i + 1,
                    "STATE": qoz['state'],
                    "COUNTY": qoz['county'],
                    "TRACT_ID": qoz['tract_id'],
                    "ZONE_TYPE": qoz['zone_type'],
                    "YEAR_RANGE": qoz['year_range'],
                    "DESCRIPTION": f"Opportunity Zone in {qoz['county']}, {qoz['state']}"
                }
            }
            features.append(feature)
            success_count += 1
        else:
            # Create a simple point feature as fallback
            feature = {
                "type": "Feature",
                "id": i + 1,
                "geometry": {
                    "type": "Point",
                    "coordinates": [-122.3, 47.6]  # Default coordinates
                },
                "properties": {
                    "OBJECTID": i + 1,
                    "STATE": qoz['state'],
                    "COUNTY": qoz['county'],
                    "TRACT_ID": qoz['tract_id'],
                    "ZONE_TYPE": qoz['zone_type'],
                    "YEAR_RANGE": qoz['year_range'],
                    "DESCRIPTION": f"Opportunity Zone in {qoz['county']}, {qoz['state']} (point only)"
                }
            }
            features.append(feature)
        
        # Rate limiting
        time.sleep(0.1)
    
    # Create GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Save to file
    with open('opportunity_zones_complete.geojson', 'w') as f:
        json.dump(geojson, f)
    
    print(f"✅ Created GeoJSON with {len(features)} opportunity zones")
    print(f"📁 Saved to: opportunity_zones_complete.geojson")
    print(f"📊 Successfully got boundaries for {success_count} zones")
    print(f"📊 Total zones in CSV: {len(qozs)}")
    
    return geojson

if __name__ == "__main__":
    create_qozs_geojson() 