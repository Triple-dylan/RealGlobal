# Global Builder Opportunity Map

A developer-focused real estate opportunity mapping platform that helps builders and investors identify viable geographic areas for development. The platform offers filterable zoning/economic data, live listings, AI-generated reports, and alerting functionality.

## Features

- **Interactive Global Map**: Fullscreen Mapbox-powered map with pan, zoom, and layer controls
- **Dynamic Filters**: Floating panel with zoning and economic filter options
- **Property Listings**: Live property pins with detailed information from Supabase
- **Zoning Overlays**: Color-coded zoning data visualization
- **Economic Indicators**: GDP growth, property appreciation, and accessibility metrics
- **AI Reports**: Generate comprehensive development opportunity reports using OpenAI
- **Custom Alerts**: Draw regions and set up automated alerts
- **Real-time Data**: Live data from Supabase backend

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Maps**: Mapbox GL JS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **AI**: OpenAI API (GPT-4)
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Mapbox access token
- Supabase account and project
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd global-builder-opportunity-map
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Mapbox Configuration
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
   
   # OpenAI Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

4. **Supabase Database Setup**
   
   Create the following tables in your Supabase project:

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

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # React components
│   ├── MapUI.tsx       # Main map component
│   ├── FiltersPanel.tsx # Filter sidebar
│   ├── ListingsOverlay.tsx # Property pins
│   ├── ZoningOverlay.tsx # Zoning data layers
│   └── AIReport.tsx    # AI report generation
├── services/           # API and external services
│   ├── supabase.ts    # Supabase client and types
│   ├── api.ts         # Main API service functions
│   ├── openai.ts      # OpenAI integration
│   └── mapbox.ts      # Mapbox utilities
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and constants
├── hooks/             # Custom React hooks
└── styles/            # Global styles and Tailwind config
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Components

#### MapUI.tsx
The main map component that renders the fullscreen Mapbox map with:
- Navigation controls
- Fullscreen toggle
- Geolocation
- Layer management

#### FiltersPanel.tsx
Floating left-hand panel with:
- Zoning type filters
- Economic indicator filters
- Opportunity score slider
- Apply/Clear actions

### Real Data Integration

The application integrates with real data sources:
- **Supabase**: Property listings, zoning data, economic indicators, user alerts, and AI reports
- **OpenAI**: AI-powered opportunity analysis and report generation
- **Mapbox**: Interactive map rendering and geospatial features

## API Integration

### Supabase
- User authentication and authorization
- Real-time data subscriptions
- PostgreSQL database for all application data
- Row Level Security (RLS) for data protection

### Mapbox
- Interactive map rendering
- Custom layer styling
- Geocoding and reverse geocoding
- Spatial queries and filtering

### OpenAI
- AI-powered opportunity reports
- Development recommendations
- Risk assessment and analysis
- Cost and ROI estimation

## Data Sources

### Property Data
- Real estate listings with coordinates
- Pricing and property details
- Opportunity scoring
- Status tracking

### Zoning Data
- Zoning classifications and boundaries
- Development restrictions
- Opportunity zones
- Regulatory requirements

### Economic Data
- GDP growth by region
- Property appreciation rates
- Builder accessibility metrics
- International accessibility scores

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Environment Variables for Production
Make sure to set all required environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MAPBOX_ACCESS_TOKEN`
- `VITE_OPENAI_API_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository or contact the development team. 