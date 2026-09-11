'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Map as MapLibreMap,
  NavigationControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MENU_GO_DEMO_DATA } from '@/lib/webgis/demo-data';
import {
  MENU_GO_COLOR,
  MENU_GO_LAYER_ID,
  MENU_GO_SOURCE_ID,
} from '@/lib/webgis/layer-config';
import type { LayerVisibility } from '@/types/webgis';

const apiKey = process.env.NEXT_PUBLIC_MAPID_API_KEY?.trim();

interface MapComponentProps {
  visibility: LayerVisibility;
}

export default function MapComponent({
  visibility,
}: MapComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    apiKey
      ? null
      : 'API key MAPID belum diisi. Periksa konfigurasi environment lalu restart server.',
  );

  // Buat peta satu kali untuk setiap pemasangan komponen.
  useEffect(() => {
    const container = containerRef.current;

    if (!container || !apiKey) return;

    let map: MapLibreMap | undefined;
    let resizeObserver: ResizeObserver | undefined;

    try {
      setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

      const styleUrl = new URL(
        'https://basemap.mapid.io/styles/light/style.json',
      );
      styleUrl.searchParams.set('key', apiKey);

      const instance = new MapLibreMap({
        container,
        style: styleUrl.toString(),
        center: [107.1612, -6.2575],
        zoom: 15,

        transformRequest: (url) => {
          const requestUrl = new URL(url, window.location.href);

          // Kirim key hanya ke origin basemap MAPID.
          if (requestUrl.origin === 'https://basemap.mapid.io') {
            requestUrl.searchParams.set('key', apiKey);
            return { url: requestUrl.toString() };
          }

          return { url };
        },
      });

      map = instance;
      mapRef.current = instance;

      instance.addControl(new NavigationControl(), 'top-right');

      instance.on('error', () => {
        setErrorMessage(
          'Sebagian data peta gagal dimuat. Periksa koneksi dan konfigurasi layanan peta.',
        );
      });

      instance.on('load', () => {
        instance.addSource(MENU_GO_SOURCE_ID, {
          type: 'geojson',
          data: MENU_GO_DEMO_DATA,
        });

        instance.addLayer({
          id: MENU_GO_LAYER_ID,
          type: 'circle',
          source: MENU_GO_SOURCE_ID,
          layout: {
            visibility: 'none',
          },
          paint: {
            'circle-radius': 7,
            'circle-color': MENU_GO_COLOR,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        });

        instance.resize();
      });

      // Sesuaikan canvas ketika ruang peta berubah ukuran.
      resizeObserver = new ResizeObserver(() => {
        instance.resize();
      });
      resizeObserver.observe(container);
    } catch {
      // Tampilkan kegagalan sinkron dari sistem eksternal MapLibre/WebGL.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMessage(
        'Peta gagal diinisialisasi. Periksa dukungan WebGL dan konfigurasi peta.',
      );
    }

    return () => {
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Perbarui layer tanpa membuat ulang peta.
  useEffect(() => {
    const map = mapRef.current;

    if (!map) return;

    function syncVisibility() {
      if (!map?.getLayer(MENU_GO_LAYER_ID)) return;

      map.setLayoutProperty(
        MENU_GO_LAYER_ID,
        'visibility',
        visibility['menu-go'] ? 'visible' : 'none',
      );
    }

    // Berlaku langsung jika layer sudah tersedia.
    syncVisibility();

    // Tangani juga perubahan checkbox sebelum peta selesai dimuat.
    // Listener pembuat layer pada effect pertama berjalan lebih dahulu.
    map.on('load', syncVisibility);

    return () => {
      map.off('load', syncVisibility);
    };
  }, [visibility]);

  return (
    <div className="relative h-full w-full">
      {/* MapLibre's unlayered CSS overrides Tailwind's position utility.
          Keep this container absolute so it fills the map area. */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 shadow">
        Overlay Menu Go: data simulasi
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="absolute left-3 right-14 top-16 z-10 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 shadow"
        >
          {errorMessage}
        </div>
      )}
    </div>
  );
}
