# INSTRUCTIONS — RealGlobal MapLibre Globe

## Project State (June 29, 2024)
- MapLibre GL JS is the only mapping engine (no Mapbox, no Cesium).
- Globe projection is required and being debugged.
- Overlays (economic, opportunity zones) are integrated but need robust error handling and filter responsiveness.
- UI (FiltersPanel, FloatingChatSearchBar) is present but needs full integration with the globe.
- Error handling and debug output are being improved.

## Historical Context
- Originally Mapbox GL JS, migrated to MapLibre GL JS for open-source, token-free mapping.
- Cesium was attempted and abandoned due to complexity and overlay issues.

## 5-Step Implementation Plan
1. **Fix MapLibre Globe Initialization**
2. **Overlay Data Integration and Rendering**
3. **UI/UX—FiltersPanel, Chat, and Search**
4. **Robust Error Handling and Debugging**
5. **Full End-to-End Test and Code Cleanup**

## Current Goals
- Get the MapLibre globe working (not 2D map).
- Render overlays and make them responsive to filters.
- Ensure chatbox and search bar work and interact with the globe.
- Prepare for additional indicators and datasets for B2B launch.

## Next Steps
- Complete Step 1: Globe initialization and style loading.
- Proceed through Steps 2–5, confirming each before moving on.
- Update this file as progress is made. 