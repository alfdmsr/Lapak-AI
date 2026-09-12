export type LayerId = 'boundary'|'survei'|'osm'|'rbi'|'menu-go'|'struk-go'|'properti-go';
export type LayerVisibility = Record<LayerId,boolean>;
export interface LayerConfig {id:LayerId;name:string;description:string;color:string;available:boolean;group:string}
export interface Evidence {evidence_id:string; title:string; text:string; date?:string; source_pdf_page?:number; offered_price_idr?:number; coordinates?:[number,number]; location_verified?:boolean;kind?:string}
