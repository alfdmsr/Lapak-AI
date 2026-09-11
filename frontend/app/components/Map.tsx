'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_MAPID_API_KEY?.trim();

    if (!apiKey) {
      setErrorMessage(
        'API key MAPID belum diisi. Periksa frontend/.env.local lalu restart server.',
      );
      return;
    }

    let map: MapLibreMap | undefined;

    try {
      const styleUrl = new URL(
        'https://basemap.mapid.io/styles/light/style.json',
      );
      styleUrl.searchParams.set('key', apiKey);

      map = new MapLibreMap({
        container: containerRef.current,
        style: styleUrl.toString(),
        center: [107.1612, -6.2575],
        zoom: 15,

        transformRequest: (url) => {
          const requestUrl = new URL(url, window.location.href);

          // Key hanya dikirim ke origin basemap MAPID.
          if (requestUrl.origin === 'https://basemap.mapid.io') {
            requestUrl.searchParams.set('key', apiKey);
            return { url: requestUrl.toString() };
          }

          return { url };
        },
      });

      map.addControl(new NavigationControl(), 'top-right');

      map.on('error', () => {
        setErrorMessage(
          'Request peta MAPID gagal. Periksa status request di tab Network browser.',
        );
      });

      map.on('load', () => {
        map?.resize();
      });
    } catch {
      setErrorMessage(
        'Peta gagal diinisialisasi. Periksa dukungan WebGL dan Console browser.',
      );
    }

    return () => {
      map?.remove();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0 }}
      />

      {errorMessage && (
        <div
          role="alert"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 64,
            zIndex: 1,
            padding: 16,
            borderRadius: 8,
            background: '#fff1f2',
            color: '#9f1239',
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}