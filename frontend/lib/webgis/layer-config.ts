import type { LayerConfig, LayerVisibility } from '@/types/webgis';

export const MENU_GO_COLOR = '#ea580c';
export const MENU_GO_SOURCE_ID = 'lapak-menu-go-source';
export const MENU_GO_LAYER_ID = 'lapak-menu-go-points';

export const LAYER_CONFIG: LayerConfig[] = [
  {
    id: 'menu-go',
    name: 'Menu Go',
    description: 'Titik kuliner - data simulasi',
    color: MENU_GO_COLOR,
    available: true,
  },
  {
    id: 'struk-go',
    name: 'Struk Go',
    description: 'Sebaran transaksi - belum tersedia',
    color: '#9333ea',
    available: false,
  },
  {
    id: 'properti-go',
    name: 'Properti Go',
    description: 'Properti usaha - belum tersedia',
    color: '#2563eb',
    available: false,
  },
  {
    id: 'survei',
    name: 'Survei',
    description: 'Hasil survei lapangan - belum tersedia',
    color: '#059669',
    available: false,
  },
];

export const INITIAL_LAYER_VISIBILITY: LayerVisibility = {
  'menu-go': true,
  'struk-go': false,
  'properti-go': false,
  survei: false,
};