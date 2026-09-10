'use client';
import { useEffect, useRef } from 'react';
import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  // Panggil API Key dari environment variables
  const mapidApiKey = process.env.NEXT_PUBLIC_MAPID_API_KEY;

  useEffect(() => {
    if (!mapContainer.current) return;

    // URL dasar Style MAPID (tanpa API Key di belakangnya)
    const mapidStyleUrl = 'https://basemap.mapid.io/styles/light/style.json';

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: mapidStyleUrl,
      center: [107.1612, -6.2575], // Koordinat Stasiun Cikarang
      zoom: 15,
      // Gunakan transformRequest untuk menyisipkan API Key
      transformRequest: (url, resourceType) => {
        if (url.startsWith('https://basemap.mapid.io')) {
          return {
            url: `${url}?key=${mapidApiKey}` // Menyisipkan ?key=API_KEY di akhir URL
          };
        }
        // Jika bukan URL MAPID, biarkan request normal
        return { url };
      }
    });

    map.addControl(new NavigationControl());

    return () => map.remove();
  }, [mapidApiKey]);

  return (
    <div 
      ref={mapContainer} 
      style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' }}
    />
  );
}