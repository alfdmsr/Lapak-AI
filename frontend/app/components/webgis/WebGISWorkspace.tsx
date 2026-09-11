'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import AppHeader from './AppHeader';
import LayerPanel from './LayerPanel';
import SummaryDashboard from './SummaryDashboard';
import DetailPanel from './DetailPanel';
import InsightPanel from './InsightPanel';

import { INITIAL_LAYER_VISIBILITY } from '@/lib/webgis/layer-config';
import type { LayerId, LayerVisibility } from '@/types/webgis';

const MapComponent = dynamic(() => import('../Map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Memuat peta MAPID…</p>
    </div>
  ),
});

export default function WebGISWorkspace() {
  const [visibility, setVisibility] = useState<LayerVisibility>(
    INITIAL_LAYER_VISIBILITY,
  );

  function handleToggleLayer(id: LayerId, checked: boolean) {
    setVisibility((previous) => ({
      ...previous,
      [id]: checked,
    }));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 lg:h-dvh lg:overflow-hidden">
      <div className="shrink-0">
        <AppHeader />
      </div>

      <main className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside
          aria-label="Layer dan filter peta"
          className="border-b border-slate-200 bg-white lg:overflow-y-auto lg:border-r lg:border-b-0"
        >
          <LayerPanel
            visibility={visibility}
            onToggle={handleToggleLayer}
          />
        </aside>

        <div className="flex min-w-0 flex-col lg:min-h-0">
          <section
            aria-label="Peta kawasan Stasiun Cikarang"
            className="relative h-[60dvh] min-h-[320px] lg:h-auto lg:min-h-0 lg:flex-1"
          >
            <MapComponent visibility={visibility} />
          </section>

          <div className="shrink-0 border-t border-slate-200 bg-white lg:max-h-[35dvh] lg:overflow-y-auto">
            <SummaryDashboard />
          </div>
        </div>

        <aside
          aria-label="Detail dan analisis"
          className="border-t border-slate-200 bg-white lg:min-h-0 lg:overflow-y-auto lg:border-t-0 lg:border-l"
        >
          <div className="border-b border-slate-200">
            <DetailPanel />
          </div>

          <InsightPanel />
        </aside>
      </main>
    </div>
  );
}