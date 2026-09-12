'use client';
import {useEffect,useRef,useState} from 'react';
import {Map as GLMap,NavigationControl,AttributionControl,setWorkerUrl} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type {LayerId,LayerVisibility,Evidence} from '@/types/webgis';
type Props={visibility:LayerVisibility;opacity:number;basemap:'satellite'|'light'|'basic';focus:number;selected:Evidence|null;onPick:(ids:string[])=>void};
const key=process.env.NEXT_PUBLIC_MAPID_API_KEY?.trim();
const layers:[string,LayerId,string,'line-opacity'|'fill-opacity'|'circle-opacity'][]=[['boundary-line','boundary','line','line-opacity'],['survey-points','survei','circle','circle-opacity'],['osm-line','osm','line','line-opacity'],['osm-fill','osm','fill','fill-opacity'],['osm-points','osm','circle','circle-opacity'],['rbi-line','rbi','line','line-opacity'],['rbi-fill','rbi','fill','fill-opacity'],['rbi-points','rbi','circle','circle-opacity']];
function style(name:string){const u=new URL(`https://basemap.mapid.io/styles/${name}/style.json`);u.searchParams.set('key',key||'');return u.toString();}
export default function MapComponent(props:Props){
 const container=useRef<HTMLDivElement>(null),map=useRef<GLMap|null>(null),latest=useRef(props);
 const [error,setError]=useState('');
 useEffect(()=>{latest.current=props;const m=map.current;if(!m)return;for(const [id,v,,paint] of layers)if(m.getLayer(id)){m.setLayoutProperty(id,'visibility',props.visibility[v]?'visible':'none');m.setPaintProperty(id,paint,paint==='fill-opacity'?props.opacity*.04:props.opacity);}},[props]);
 useEffect(()=>{if(!container.current||!key)return;
 setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
 let m:GLMap;
 try {m=new GLMap({container:container.current,attributionControl:false,style:style(latest.current.basemap),center:[107.1450733,-6.2553138],zoom:14.6,transformRequest:url=>{const u=new URL(url,window.location.href);if(u.origin==='https://basemap.mapid.io'){u.searchParams.set('key',key);return {url:u.toString()};}return {url};}});}catch{queueMicrotask(()=>setError('Peta tidak dapat dimulai. Periksa dukungan WebGL browser.'));return;}
 map.current=m;m.addControl(new NavigationControl(),'top-right');m.addControl(new AttributionControl({compact:false,customAttribution:'Basemap: <a href="https://mapid.io/" target="_blank" rel="noopener noreferrer">MAPID</a>'}),'bottom-right');
 m.on('error',()=>setError('Sebagian aset peta belum termuat. Coba basemap lain atau periksa izin key MAPID.'));
 m.on('style.load',()=>{
 setError('');
 const sources={boundary:'study_boundary',survey:'survey_unverified',osm:'osm_reference',rbi:'rbi_reference'};
 for(const [id,path] of Object.entries(sources))if(!m.getSource(id))m.addSource(id,{type:'geojson',data:`/api/ai/layers/${path}`});
 m.addLayer({id:'boundary-line',type:'line',source:'boundary',paint:{'line-color':'#60a5fa','line-width':3,'line-dasharray':[3,2]}});
 m.addLayer({id:'survey-points',type:'circle',source:'survey',paint:{'circle-color':'#10b981','circle-radius':8,'circle-stroke-color':'#fff','circle-stroke-width':2}});
 for(const [id,color] of [['osm','#fb923c'],['rbi','#c084fc']]){
 m.addLayer({id:`${id}-fill`,type:'fill',source:id,filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':color,'fill-opacity':.04}});
 m.addLayer({id:`${id}-line`,type:'line',source:id,filter:['!=',['geometry-type'],'Point'],paint:{'line-color':color,'line-width':1.5}});
 m.addLayer({id:`${id}-points`,type:'circle',source:id,filter:['==',['geometry-type'],'Point'],paint:{'circle-color':color,'circle-radius':4}});
 }
 for(const [id,v,,paint] of layers){m.setLayoutProperty(id,'visibility',latest.current.visibility[v]?'visible':'none');m.setPaintProperty(id,paint,paint==='fill-opacity'?latest.current.opacity*.04:latest.current.opacity);}
 m.moveLayer('survey-points');
 });
 m.on('click',e=>{if(!m.getLayer('survey-points'))return;const hits=m.queryRenderedFeatures(e.point,{layers:['survey-points']});const ids=[...new Set(hits.map(f=>String(f.properties.observation_id||f.id)))];if(ids.length)latest.current.onPick(ids);});
 m.on('mousemove',e=>{if(m.getLayer('survey-points'))m.getCanvas().style.cursor=m.queryRenderedFeatures(e.point,{layers:['survey-points']}).length?'pointer':'';});
 const observer=new ResizeObserver(()=>m.resize());observer.observe(container.current);
 return ()=>{observer.disconnect();m.remove();map.current=null;};
 },[]);
 useEffect(()=>{const m=map.current;if(m){m.setStyle(style(props.basemap));m.easeTo({pitch:props.basemap==='basic'?55:0});}},[props.basemap]);
 useEffect(()=>{map.current?.fitBounds([[107.1357,-6.2645],[107.1545,-6.2461]],{padding:40,duration:700});},[props.focus]);
 useEffect(()=>{if(props.selected?.coordinates)map.current?.flyTo({center:props.selected.coordinates,zoom:16});},[props.selected]);
 return <div className="relative h-full w-full"><div ref={container} style={{position:'absolute',inset:0}}/>{(!key||error)&&<div role="alert" className="absolute bottom-4 left-4 right-4 rounded-xl bg-white p-3 text-sm text-amber-900 shadow">{!key?'Isi key basemap pada konfigurasi frontend untuk menampilkan peta.':error}</div>}<div className="pointer-events-none absolute bottom-10 left-4 rounded-lg bg-slate-900/80 px-3 py-2 text-xs text-white">Radius 1 km · lokasi survei perkiraan</div></div>;
}
