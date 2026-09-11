'use client';

import { LAYER_CONFIG } from '@/lib/webgis/layer-config';
import type { LayerId, LayerVisibility } from '@/types/webgis';

interface LayerPanelProps {
  visibility: LayerVisibility;
  onToggle: (id: LayerId, checked: boolean) => void;
}

export default function LayerPanel({
  visibility,
  onToggle,
}: LayerPanelProps) {
  return (
    <section className="p-4">
      <h2 className="font-semibold">Layer & Filter</h2>

      <p className="mt-2 text-sm text-slate-500">
        Pilih layer yang ingin ditampilkan pada peta.
      </p>

      <fieldset className="mt-4 space-y-3">
        <legend className="sr-only">Layer data</legend>

        {LAYER_CONFIG.map((layer) => (
          <label
            key={layer.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${
              layer.available
                ? 'cursor-pointer border-slate-200 hover:bg-slate-50'
                : 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400'
            }`}
          >
            <input
              type="checkbox"
              checked={visibility[layer.id]}
              disabled={!layer.available}
              onChange={(event) =>
                onToggle(layer.id, event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-orange-600"
            />

            <span className="min-w-0">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                {layer.name}
              </span>

              <span className="mt-1 block text-xs">
                {layer.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
        Data simulasi untuk pengujian antarmuka. Bukan hasil survei
        atau dasar rekomendasi lokasi.
      </p>
    </section>
  );
}