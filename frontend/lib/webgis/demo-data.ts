import type { FeatureCollection, Point } from 'geojson';

interface MenuGoProperties {
  name: string;
  category: string;
  averagePrice: number;
  isDemo: boolean;
}

export const MENU_GO_DEMO_DATA: FeatureCollection<
  Point,
  MenuGoProperties
> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'demo-menu-1',
      geometry: {
        type: 'Point',
        coordinates: [107.1608, -6.2579],
      },
      properties: {
        name: 'Titik Simulasi A',
        category: 'Makanan',
        averagePrice: 15000,
        isDemo: true,
      },
    },
    {
      type: 'Feature',
      id: 'demo-menu-2',
      geometry: {
        type: 'Point',
        coordinates: [107.1616, -6.2582],
      },
      properties: {
        name: 'Titik Simulasi B',
        category: 'Minuman',
        averagePrice: 8000,
        isDemo: true,
      },
    },
    {
      type: 'Feature',
      id: 'demo-menu-3',
      geometry: {
        type: 'Point',
        coordinates: [107.162, -6.2574],
      },
      properties: {
        name: 'Titik Simulasi C',
        category: 'Camilan',
        averagePrice: 10000,
        isDemo: true,
      },
    },
  ],
};