Datasets to include (MVP order)

MODIS/Sentinel NDVI (aggregated per-plot).

SMAP (soil moisture surface) aggregated.

IMERG (rain last 7 days).

Access tips

Use AppEEARS or Google Earth Engine to export per-plot aggregates (mean, std, dates).

Use GIBS tiles for frontend quick NDVI overlay (no heavy downloads).

Pre-bake and cache results (avoid live heavy queries during demo).

Minimal pipeline (commands / pseudocode)

Input: geojson parcels.

Query: AppEEARS / GEE for NDVI time series + SMAP mean + IMERG sum (last 7d).

Aggregate: compute mean NDVI, mean SMAP, rain7d and save to JSON/GeoTIFF.

Serve: FastAPI endpoint reads pre-baked JSON and feeds UI.

Tech stack (recommended)

Frontend: React (create-react-app or Next.js) + Leaflet/Mapbox.

Backend: FastAPI + Uvicorn.

Data processing: rasterio/xarray or GEE Python API.

Storage: S3-like or local files for GeoTIFF/JSON (small for hackathon).
