# Supabase Setup Guide

## Quick Setup Steps

### 1. Create Environment File
Create `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZHlsYW5kYWhsIiwiYSI6ImNtY2NlMTByODAwZmoyaW9qMjRsbGR1MnAifQ.IZKpxXXap93-osoqR3YsAQ
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Run Database Schema
In Supabase SQL Editor, run this SQL:

```sql
-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  size INTEGER NOT NULL,
  type TEXT NOT NULL,
  zoning TEXT NOT NULL,
  opportunity_score INTEGER NOT NULL,
  listing_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Zoning data table
CREATE TABLE zoning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  restrictions TEXT[] NOT NULL,
  opportunities TEXT[] NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Economic data table
CREATE TABLE economic_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  gdp_growth DECIMAL(5,2) NOT NULL,
  property_appreciation DECIMAL(5,2) NOT NULL,
  builder_accessibility DECIMAL(3,1) NOT NULL,
  international_accessibility DECIMAL(3,1) NOT NULL,
  last_updated DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alerts table
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  filters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered TIMESTAMP WITH TIME ZONE
);

-- AI Reports table
CREATE TABLE ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  region TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  summary TEXT NOT NULL,
  development_opportunities TEXT[] NOT NULL,
  permit_requirements TEXT[] NOT NULL,
  governing_bodies TEXT[] NOT NULL,
  estimated_cost DECIMAL(12,2) NOT NULL,
  estimated_roi DECIMAL(5,2) NOT NULL,
  risks TEXT[] NOT NULL,
  recommendations TEXT[] NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Add Sample Data
Run this SQL to add test data:

```sql
-- Sample properties
INSERT INTO properties (address, lat, lng, price, size, type, zoning, opportunity_score, listing_date) VALUES
('123 Main St, New York, NY', 40.7128, -74.0060, 2500000, 5000, 'commercial', 'commercial', 85, '2024-01-15'),
('456 Oak Ave, Brooklyn, NY', 40.7182, -73.9584, 1800000, 3500, 'multifamily', 'multifamily', 92, '2024-01-10'),
('789 Industrial Blvd, Queens, NY', 40.7282, -73.7949, 3200000, 8000, 'industrial', 'industrial', 78, '2024-01-20');

-- Sample zoning data
INSERT INTO zoning_data (name, type, coordinates, restrictions, opportunities, score) VALUES
('Downtown Opportunity Zone', 'opportunity-zones', 
 '[{"lat": 40.7128, "lng": -74.0060}, {"lat": 40.7128, "lng": -74.0040}, {"lat": 40.7108, "lng": -74.0040}, {"lat": 40.7108, "lng": -74.0060}]',
 ARRAY['Height limit: 50 stories', 'Parking requirements'],
 ARRAY['Tax incentives', 'Fast-track permitting'],
 85);

-- Sample economic data
INSERT INTO economic_data (region, gdp_growth, property_appreciation, builder_accessibility, international_accessibility, last_updated) VALUES
('New York City', 3.2, 5.8, 7.5, 9.2, '2024-01-15'),
('Brooklyn', 4.1, 6.3, 8.1, 8.7, '2024-01-15');
```

### 4. Test Connection
1. Start your dev server: `npm run dev`
2. Look for the green "✅ Supabase Connected!" notification
3. If you see red error, check your environment variables

### 5. Get Your Credentials
In Supabase Dashboard:
1. Go to Settings → API
2. Copy Project URL and anon key
3. Paste into `.env.local`

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Check that `.env.local` exists in project root
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set

**Error: "relation does not exist"**
- Run the CREATE TABLE SQL commands in Supabase SQL Editor
- Make sure all 5 tables are created

**Error: "permission denied"**
- Check that your anon key is correct
- Verify Row Level Security (RLS) policies if needed

## Next Steps
Once connected, you can:
1. Remove the SupabaseTest component from App.tsx
2. Add real property data to the database
3. Implement property pins on the map
4. Add zoning overlays
5. Set up user authentication 