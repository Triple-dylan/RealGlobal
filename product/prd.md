# Product Requirements Document (PRD)

## Project Name

**Global Builder Opportunity Map**

## Owner

Dylan Dahl

## Objective

Create a developer-focused global interactive map tool that helps real estate builders and investors identify viable geographic areas for development. The platform offers filterable zoning/economic data, live listings, AI-generated reports, and alerting functionality.

---

## Key Features

### A. Interactive Map Interface

- Pan and zoom support
- Mapbox, Google Maps, or Leaflet base
- Dynamic heatmap overlays
- Pins for active listings

### B. Filter Panel (Floating UI)

- Zoning Filters:
  - Opportunity Zones
  - Affordable Housing Zones
  - Industrial
  - Multifamily
  - Commercial
- Economic Filters:
  - GDP growth by region
  - Property appreciation rates
  - Builder accessibility index
  - International accessibility metrics

### C. Dynamic Map Overlays

- Composite opportunity scores
- Real-time visual updates
- Color-coded intensity layers

### D. Property Listing Pins

- Live feed of listings via MLS/property APIs
- Pin click shows property card with:
  - Listing price, size, type
  - Investment score
  - Zoning & permitting status
  - AI opportunity summary

### E. Custom Area Watch & Alerts

- Draw regions directly on map
- Set alerts for new listings
- Request AI-generated reports

### F. AI Opportunity Reports

- Exportable PDF or HTML
- Content:
  - Development summary
  - Permit requirements
  - Governing body list
  - Estimated build cost and ROI

---

## User Roles

- **Guest**: View map, apply filters
- **User**: Save filters, receive alerts, generate reports
- **Admin**: Manage datasets, API keys, moderation

---

## APIs & Data Sources

| Feature    | API                      | Example Providers                          |
| ---------- | ------------------------ | ------------------------------------------ |
| Map UI     | Maps API                 | Mapbox, Google Maps                        |
| Zoning     | Open zoning data         | Regrid, UrbanFootprint, City open datasets |
| Listings   | Property feeds           | Zillow, Realtor.com, ATTOM, Mashvisor      |
| Economics  | Economic stats           | World Bank, FRED, US Census                |
| Permitting | Permit info & civic data | Google Civic API, Accela, local APIs       |
| Email      | Alerts & comms           | SendGrid, Mailgun                          |
| Auth       | User system              | Firebase, Supabase                         |
| AI         | Report generator         | OpenAI API, Langchain                      |

---

## System Architecture

- **Frontend**: Cursor, Tailwind, Mapbox GL JS
- **Backend**: Node/Express or Next.js
- **Database**: Supabase or Postgres
- **AI Layer**: Langchain + OpenAI

---

## Success Metrics

- Avg time to discover viable region
-
  # of AI reports requested
- Filter engagement rates
- Alert subscription volume
- Report satisfaction scores

---

## Development Phases

| Phase | Task                                             |
| ----- | ------------------------------------------------ |
| 0     | Initialize project, install map SDK, base layout |
| 1     | Add zoning & economic overlays                   |
| 2     | Display live property pins                       |
| 3     | Drawing + alert system                           |
| 4     | AI report request feature                        |
| 5     | User auth, saved filters                         |
| 6     | Report export + polish                           |

---

## Cursor Integration Instructions

```md
# Project: Global Builder Opportunity Map

This app shows a dynamic world map with filters and overlays for developers. Built with TypeScript, Vite, Tailwind, and Mapbox. Integrates with multiple APIs for zoning, economics, and real estate listings.

## Modules
- `MapUI.tsx` — Fullscreen interactive map
- `FiltersPanel.tsx` — Floating filter sidebar
- `ListingsOverlay.tsx` — Handles pin rendering
- `ZoningOverlay.tsx` — Loads zoning data
- `AIReport.ts` — Submits selected region to OpenAI
- `Alerts.ts` — Region draw & alert logic

## Notes
- Use async loaders for large datasets
- Color-code based on scoring weight
- Test draw-to-polygon interaction before alert logic
```

---

Let me know when you're ready for database schema or component scaffolding.

