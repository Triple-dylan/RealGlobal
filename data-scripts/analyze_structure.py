#!/usr/bin/env python3
import json

# Load the data
with open('Opportunity_Zones_-4513523067566272484.geojson', 'r') as f:
    data = json.load(f)

print("=== OPPORTUNITY ZONES STRUCTURE ANALYSIS ===")
print(f"Total features: {len(data['features'])}")

for i, feature in enumerate(data['features']):
    print(f"\nFeature {i}:")
    print(f"  Type: {feature['geometry']['type']}")
    print(f"  Properties: {feature['properties']}")
    
    coords = feature['geometry']['coordinates']
    print(f"  MultiPolygon parts: {len(coords)}")
    
    for j, part in enumerate(coords):
        print(f"    Part {j}: {len(part)} rings")
        for k, ring in enumerate(part):
            print(f"      Ring {k}: {len(ring)} coordinates")
            if k == 0:  # First ring of first part
                print(f"      Sample coordinates: {ring[:3]}")
                print(f"      Last coordinates: {ring[-3:]}")

print("\n=== INTERPRETATION ===")
print("If each coordinate pair represents a separate zone, then:")
total_coords = sum(len(part[0]) for part in data['features'][0]['geometry']['coordinates'])
print(f"Total coordinate pairs: {total_coords}")
print("But this structure suggests these are boundary vertices, not separate zones.") 