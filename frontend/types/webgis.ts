export type LayerId = 'menu-go' | 'struk-go' | 'properti-go' | 'survei';
export type LayerVisibility = Record<LayerId, boolean>;

export interface LayerConfig {
    id: LayerId;
    name: string;
    description: string;
    color: string;
    available: boolean;
}