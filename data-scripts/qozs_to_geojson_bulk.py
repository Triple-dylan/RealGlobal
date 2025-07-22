#!/usr/bin/env python3
"""
Join QOZ CSV to census tracts shapefile and output a GeoJSON with all QOZ polygons
"""
import pandas as pd
import geopandas as gpd
import json

# Load QOZ CSV
csv_path = 'designated-qozs.12.14.18.csv'
colnames = ['STATE', 'COUNTY', 'TRACTCE', 'ZONE_TYPE', 'YEAR_RANGE']
qozs = pd.read_csv(csv_path, skiprows=7, names=colnames)

# Tract numbers in the shapefile are 11 digits, pad with zeros if needed
qozs['TRACTCE'] = qozs['TRACTCE'].astype(str).str.zfill(11)

# Load census tracts shapefile
tracts = gpd.read_file('cb_2022_us_tract_500k.shp')
tracts['GEOID'] = tracts['GEOID'].astype(str)

# Merge on GEOID (which is the full 11-digit tract code)
merged = tracts.merge(qozs, left_on='GEOID', right_on='TRACTCE', how='inner')

# Output as GeoJSON
out_path = 'opportunity_zones_full.geojson'
merged.to_file(out_path, driver='GeoJSON')

print(f"✅ Created GeoJSON with {len(merged)} opportunity zones")
print(f"📁 Saved to: {out_path}") 