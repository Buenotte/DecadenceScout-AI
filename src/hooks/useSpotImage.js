import { useMemo } from 'react';

/**
 * Returns a real ESRI satellite tile URL for the exact GPS location.
 * Free, no API key, always works.
 * ArcGIS World Imagery has ~15cm resolution in Spain.
 */
function latLonToEsriUrl(lat, lon, zoom = 17) {
  const n = Math.pow(2, zoom);
  const x = Math.floor((lon + 180) / 360 * n);
  const latRad = lat * Math.PI / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`;
}

export function useSpotImage(spot) {
  const imgUrl = useMemo(() => {
    if (!spot) return null;
    return latLonToEsriUrl(spot.lat, spot.lon, 17);
  }, [spot?.id, spot?.lat, spot?.lon]);

  return { imgUrl, loading: false };
}

