# Cursor Project Instructions

This project builds a developer-focused real estate opportunity map. 
It uses Mapbox for map UI, pulls zoning and economic data from APIs, 
and overlays filters that change region highlights dynamically. 
Users can draw a region and request an AI-generated report, powered by OpenAI + Langchain.

Tech stack: TypeScript, Tailwind, Vite, Supabase, Mapbox, OpenAI API.

Modules:
- `MapUI.tsx`: renders interactive map
- `FiltersPanel.tsx`: floating input sidebar
- `ListingsOverlay.tsx`: handles MLS/property pins
- `ZoningOverlay.tsx`: integrates Regrid or city APIs
- `AIReport.ts`: collects data and submits to GPT for analysis
- `Alerts.ts`: saves regions and triggers SendGrid

Post-it Notes:
- Add dev mode toggle for mock data
- Color-code overlays based on user-defined weights
- Async loader for large data fetches
