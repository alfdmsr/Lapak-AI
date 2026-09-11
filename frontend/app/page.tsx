'use client';

import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Memuat peta MAPID…</p>,
});

export default function Home() {
  return (
    <main style={{ width: '100%', height: '100dvh' }}>
      <MapComponent />
    </main>
  );
}