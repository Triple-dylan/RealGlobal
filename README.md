# RealGlobal - AI-Powered Real Estate Investment Platform

An advanced real estate investment platform that combines AI-driven portfolio management, intelligent property visualization, and comprehensive market analysis. The platform emphasizes AI-first interactions through natural language processing and voice commands.

## 🚀 Key Features

### AI-First Experience
- **Natural Language Interface**: Search properties, analyze portfolios, and get market insights using conversational AI
- **Voice Commands**: Hands-free property search and portfolio management with WebSpeech API
- **Contextual Suggestions**: Smart recommendations based on current workspace and portfolio state
- **Conversational Analytics**: AI-powered explanations of portfolio metrics and market trends

### Advanced Portfolio Management
- **Portfolio Analytics Dashboard**: Real-time performance metrics with Sharpe ratio, portfolio beta, and risk analysis
- **Geographic Diversification**: Track property distribution across cities, states, and countries
- **Risk Assessment**: Comprehensive risk scoring including concentration, liquidity, and market risk
- **Investment Recommendations**: AI-driven portfolio optimization suggestions

### Intelligent Property Visualization
- **Dynamic 3D Property Pillars**: Value-based sizing with clustering algorithms for dense areas
- **Interactive Property Cards**: 4-tab analysis interface with financial metrics and investment grading
- **Property Comparison Tool**: Side-by-side analysis with performance benchmarking
- **Animated Transitions**: Smooth property interactions with staggered animations

### Multi-Source Data Integration
- **Real Estate APIs**: Integration with RentSpree, LoopNet, Zillow, RealtyAPI, and PropertyRadar
- **Financial Market Data**: Live interest rates, REIT performance, and economic indicators
- **Data Quality System**: Deduplication, quality scoring, and source reliability metrics

### Advanced Filtering & Search
- **Smart Filter Interface**: Range sliders, multi-select chips, and saved presets
- **AI-Powered Filtering**: Natural language filter commands and predictive suggestions
- **Real-time Results**: Live updating with result count indicators

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with Glass Morphism design system
- **Maps**: Mapbox GL JS with 3D visualization
- **State Management**: React Context API for portfolio management
- **AI Integration**: OpenAI API with natural language processing
- **Voice Recognition**: WebSpeech API for voice commands
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── components/
│   ├── AI & Search/
│   │   ├── EnhancedAIChatInterface.tsx    # Advanced AI chat with NLP
│   │   └── FloatingChatSearchBar.tsx      # Smart search with contextual suggestions
│   ├── Portfolio Management/
│   │   ├── PortfolioSystem.tsx            # Portfolio context and analytics
│   │   ├── PortfolioAnalyticsDashboard.tsx # 4-tab analytics dashboard
│   │   └── PortfolioToolbar.tsx           # Portfolio actions toolbar
│   ├── Property Components/
│   │   ├── PropertyInteractionCard.tsx    # Detailed property analysis
│   │   ├── PropertyComparisonPanel.tsx    # Side-by-side comparison
│   │   ├── PropertyPillarOverlay.tsx      # 3D property visualization
│   │   └── PropertyRecommendations.tsx    # AI recommendations
│   ├── Filtering & Data/
│   │   ├── AdvancedFiltersPanel.tsx       # Enhanced filtering UI
│   │   ├── FiltersPanel.tsx               # Basic filters
│   │   └── DataLegend.tsx                 # Data visualization legend
│   ├── Design System/
│   │   ├── SleekDesignSystem.tsx          # Glass morphism components
│   │   └── AnimationCSS.tsx               # Animation utilities
│   └── Map & Overlays/
│       ├── MapboxGlobe.tsx                # Main map component
│       └── overlays/                      # Map overlay components
├── services/
│   ├── enhancedPropertyData.ts            # Multi-source property data
│   ├── financialMarketData.ts             # Market data integration
│   ├── economicData.ts                    # Economic indicators
│   └── index.ts                           # Service exports
├── types/
│   └── index.ts                           # Comprehensive TypeScript definitions
└── App.tsx                                # Main application component
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Mapbox access token
- Supabase account
- OpenAI API key (for AI features)

### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd RealGlobal
   npm install
   ```

2. **Environment Setup**
   Create `.env.local`:
   ```env
   # Core Services
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   VITE_OPENAI_API_KEY=your_openai_api_key

   # Data Sources (Optional)
   VITE_RENTSPREE_API_KEY=your_rentspree_key
   VITE_LOOPNET_API_KEY=your_loopnet_key
   VITE_ZILLOW_API_KEY=your_zillow_key
   VITE_PROPERTY_RADAR_API_KEY=your_property_radar_key
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 🤖 AI Features Guide

### Natural Language Commands

The AI chat interface understands various command patterns:

**Property Search:**
- "Find commercial properties in Austin"
- "Search for multifamily near downtown"
- "Show me properties with cap rate above 8%"

**Portfolio Management:**
- "Analyze my portfolio performance"
- "What's my portfolio risk level?"
- "Add this property to portfolio"
- "Generate rebalancing recommendations"

**Market Analysis:**
- "What are current interest rates?"
- "Show REIT performance"
- "Market trends in Denver"

**Filtering:**
- "Filter by price under $500k"
- "Show only commercial properties"
- "Cap rate above 8%"

### Voice Commands

Enable voice input by clicking the microphone icon. The system automatically processes speech-to-text and executes commands.

## 📊 Portfolio Analytics

### Performance Metrics
- **Sharpe Ratio**: Risk-adjusted return calculation
- **Portfolio Beta**: Market correlation analysis
- **Diversification Scores**: Geographic and property type analysis
- **Risk Assessment**: Multi-factor risk evaluation

### Dashboard Features
- **Overview Tab**: Key metrics and performance indicators
- **Performance Tab**: Historical returns and benchmark comparisons
- **Risk Analysis Tab**: Risk breakdown and mitigation suggestions
- **Diversification Tab**: Geographic and asset distribution analysis

## 🏢 Property Features

### 3D Visualization
- Dynamic pillar heights based on property values
- Clustering algorithms for dense urban areas
- Smooth animations and transitions
- Interactive hover states

### Analysis Tools
- Investment grade scoring (A+ to D)
- Cash flow projections
- Cap rate calculations
- Market comparison metrics

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run typecheck # TypeScript type checking
```

### Key Architecture Patterns

**AI-First Design**: Every feature can be controlled through natural language commands
**Glass Morphism UI**: Translucent components with backdrop blur effects
**Context-Driven State**: Portfolio and filter state managed through React Context
**Service Layer**: Centralized data services with multi-source integration
**Type Safety**: Comprehensive TypeScript definitions throughout

## 🌐 Data Sources

### Real Estate Data
- **RentSpree**: Rental property listings
- **LoopNet**: Commercial real estate
- **Zillow**: Residential properties
- **PropertyRadar**: Investment properties
- **RealtyAPI**: MLS data integration

### Financial Data
- **Interest Rates**: Federal funds, mortgage, commercial lending
- **REIT Performance**: Real estate investment trust tracking
- **Economic Indicators**: GDP, unemployment, inflation data
- **Construction Costs**: Material and labor cost indices

## 🎨 Design System

### Glass Morphism Components
- `GlassButton`: Interactive buttons with glass effects
- `GlassPanel`: Container components with backdrop blur
- `GlassCard`: Information display cards

### Animation System
- Smooth transitions and micro-interactions
- Staggered animations for property displays
- Loading states and success indicators

## 🚀 Deployment

### Build and Deploy
```bash
npm run build
npm run preview  # Test production build locally
```

### Environment Variables
Ensure all required environment variables are set in your deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For questions and support:
- Open an issue in the repository
- Check existing documentation
- Review the AI command patterns above

---

**Built with ❤️ using React, TypeScript, and AI**