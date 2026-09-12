'use client';
import {useEffect,useState} from 'react';
type Summary={counts:{observations:number;observations_without_coordinates:number;menu_items:number}; study:{radius_m:number};limitations:string[]};
export default function SummaryDashboard() {
  const [data,setData]=useState<Summary|null>(null);
  const [error,setError]=useState('');
  useEffect(()=>{const controller=new AbortController();
    fetch('/api/ai/summary',{signal:controller.signal}).then(async r=>{if(!r.ok)throw new Error();return r.json();}).then(setData).catch(()=>{if(!controller.signal.aborted)setError('Ringkasan belum tersedia. Pastikan backend AI aktif.');});
    return ()=>controller.abort();
  },[]);
  return <section className="p-4"><h2 className="font-semibold">Ringkasan dataset studi</h2>
    {error && <p role="alert" className="mt-2 text-sm text-amber-800">{error}</p>}
    {!data && !error && <p className="mt-2 text-sm">Memuat ringkasan…</p>}
    {data && <><p className="mt-2 text-sm">Radius {data.study.radius_m} m · {data.counts.observations} observasi dalam dataset · {data.counts.menu_items} item menu.</p><p className="mt-1 text-xs text-slate-500">{data.counts.observations_without_coordinates} observasi tanpa koordinat. Jumlah dataset bukan jumlah usaha unik atau jumlah lokasi terverifikasi dalam radius. Daya beli dan omzet belum tersedia.</p></>}
  </section>;
}
