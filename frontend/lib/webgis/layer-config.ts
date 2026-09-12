import type {LayerConfig,LayerVisibility} from '@/types/webgis';
export const MENU_GO_COLOR='#ea580c';
export const MENU_GO_SOURCE_ID='demo';
export const MENU_GO_LAYER_ID='demo-points';
export const LAYER_CONFIG:LayerConfig[]=[
{id:'boundary',name:'Batas studi 1 km',description:'Pusat stasiun sementara',color:'#60a5fa',available:true,group:'Wilayah studi'},
{id:'survei',name:'Laporan survei',description:'Lokasi perkiraan · klik untuk membaca',color:'#10b981',available:true,group:'Wilayah studi'},
{id:'osm',name:'Referensi OSM',description:'Jalan, titik dan polygon referensi',color:'#fb923c',available:true,group:'Referensi'},
{id:'rbi',name:'Referensi RBI',description:'Dapat tumpang tindih dengan OSM',color:'#c084fc',available:true,group:'Referensi'},
{id:'menu-go',name:'Menu Go',description:'Layer menu berkoordinat belum tersedia',color:'#94a3b8',available:false,group:'Belum tersedia'},
{id:'struk-go',name:'Struk Go',description:'Data transaksi belum tersedia',color:'#94a3b8',available:false,group:'Belum tersedia'},
{id:'properti-go',name:'Properti Go',description:'Layer produk belum tersedia',color:'#94a3b8',available:false,group:'Belum tersedia'}];
export const INITIAL_LAYER_VISIBILITY:LayerVisibility={boundary:true,survei:true,osm:false,rbi:false,'menu-go':false,'struk-go':false,'properti-go':false};
