Executive summary

This single-file set is optimized for a 2-hour hackathon push. Focus on a working demo: 3 regions, 3 plots each, pre-baked data aggregates, basic actions and three missions, lightweight UI.

Deliverables to ship in 2 hours:

Pre-baked GeoTIFF/JSON aggregates for 3 demo parcels (mean NDVI, mean SMAP, rain last 7 days).

Simple backend endpoint (FastAPI) returning plot aggregates and applying actions.

React UI mock (single page): grid of 3x3 plots, sidebar stats, action cards, mission panel.

3 missions: Recover one plot, reduce water use by 10%, implement 1 rotation.

One network stub: Market selling to AI buyer.

Immediate TODO checklist (priority order):

Prepare geojson parcels and run AppEEARS/GEE to export NDVI/SMAP/IMERG aggregates (or use pre-baked samples).

Implement minimal game engine in Python (endpoints: /state GET, /action POST, /next_week POST).

Build React page wiring to engine and showing plot thumbnails with NDVI overlay (use GIBS sample tiles).

Add mission logic and one network endpoint (POST /market/sell).

Polish microcopy and add three inline tooltips (NDVI, SMAP, resolution).
