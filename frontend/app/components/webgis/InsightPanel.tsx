'use client';
import type {Evidence} from '@/types/webgis';
import {useState, type FormEvent} from 'react';

type Source = {number: number; evidence_id: string; title: string; source_pdf_page?: number; location_label?: string};
type Reply = {mode: string; display: {answer: string; sources: Source[]; notes: string[]; decision_matrix?: {audience:string;evidence_id:string;consideration:string;next_step:string;status:string}[]; details?: {dataset_limitations?: string[]; model_limitations?: string[]}}};
type Turn = {question: string; reply: Reply; targetTitle?: string};
const labels: Record<string,string> = {live_llm: 'Jawaban Gemini · periksa sumber', dataset_answer_not_llm: 'Jawaban dari ringkasan dataset', fallback_dataset_summary: 'Jawaban model ditolak · ringkasan cadangan'};

function downloadReport(turn: Turn, format: 'json' | 'html') {
  const report={exported_at:new Date().toISOString(),question:turn.question,selected_report:turn.targetTitle||null,...turn.reply};
  const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
  const d=turn.reply.display;
  const content=format==='json'?JSON.stringify(report,null,2):`<!doctype html><html lang="id"><meta charset="utf-8"><title>Laporan LAPAK-AI</title><style>body{font:16px/1.6 sans-serif;max-width:900px;margin:40px auto;padding:20px}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><h1>Laporan LAPAK-AI</h1><p>${escape(report.exported_at)}</p><p>Mode: ${escape(turn.reply.mode)}</p><h2>${escape(turn.question)}</h2><p>Konteks: ${escape(turn.targetTitle||'Dataset')}</p><pre>${escape(d.answer)}</pre><h2>Sumber</h2><ul>${d.sources.map(s=>`<li>[${s.number}] ${escape(s.title)} — ${escape(s.evidence_id)} ${s.source_pdf_page?`(PDF halaman ${s.source_pdf_page})`:''}</li>`).join('')}</ul><h2>Keterbatasan</h2><pre>${escape([...(d.notes||[]),...(d.details?.dataset_limitations||[]),...(d.details?.model_limitations||[])].join('\n'))}</pre><h2>Matriks pertimbangan awal</h2><pre>${escape(JSON.stringify(d.decision_matrix||[],null,2))}</pre><p>Bukan keputusan kelayakan lokasi atau prediksi omzet. Buka dialog cetak browser untuk menyimpan sebagai PDF.</p></html>`;
  const url=URL.createObjectURL(new Blob([content],{type:format==='json'?'application/json':'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`lapak-ai-laporan.${format}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

export default function InsightPanel({target,onClearTarget}:{target:Evidence|null;onClearTarget:()=>void}) {
  const [question,setQuestion] = useState('');
  const [turns,setTurns] = useState<Turn[]>([]);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy || !question.trim()) return;
    const sent=question.trim();setBusy(true);setError('');
    try {
      const res=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:sent,mode:'live',evidence_ids:target?[target.evidence_id]:[]})});
      const data=await res.json();
      if (!res.ok) throw new Error(data.error || 'Jawaban belum tersedia.');
      if (!data.display || typeof data.display.answer !== 'string' || !Array.isArray(data.display.sources)) throw new Error('Format respons backend belum sesuai.');
      setTurns(previous=>[...previous,{question:sent,reply:data,targetTitle:target?.title}]);setQuestion('');
    } catch (e) {setError(e instanceof Error ? e.message : 'Tidak dapat menghubungi backend.');}
    finally {setBusy(false);}
  }
  return <section className="flex min-h-0 flex-1 flex-col p-4">
    <h2 className="font-semibold">AI Copilot</h2>
    <p className="mt-2 text-xs text-slate-500">Pilih laporan untuk membahas objek tertentu. Setiap pertanyaan berdiri sendiri; checkbox layer bukan filter analisis.</p>
    <div aria-live="polite" className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto">
      {turns.map((turn,index)=><article key={index} className="rounded-lg border border-slate-200 p-3 text-sm">
        <div className="mb-2 flex gap-3 text-xs text-emerald-700"><button onClick={()=>downloadReport(turn,'json')}>Unduh JSON</button><button onClick={()=>downloadReport(turn,'html')}>Unduh laporan cetak</button></div><p className="font-semibold">{turn.question}</p>{turn.targetTitle&&<p className="mt-1 text-xs text-emerald-700">Laporan: {turn.targetTitle}</p>}
        <p className="my-2 text-xs text-amber-800">{labels[turn.reply.mode] || turn.reply.mode}</p>
        <p className="whitespace-pre-wrap break-words">{turn.reply.display.answer}</p>
        <details className="mt-3"><summary className="cursor-pointer font-medium">Sumber ({turn.reply.display.sources.length})</summary>
          <ul className="mt-2 space-y-2">{turn.reply.display.sources.map(s=><li key={s.evidence_id}>[{s.number}] {s.title}{s.source_pdf_page ? ` · PDF halaman ${s.source_pdf_page}` : ''}<p className="text-xs text-slate-500">{s.location_label}</p></li>)}</ul>
        </details>
        {turn.reply.display.notes?.map(note=><p key={note} className="mt-2 text-xs text-amber-800">{note}</p>)}
        {Boolean(turn.reply.display.decision_matrix?.length)&&<details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Matriks pertimbangan awal</summary>{turn.reply.display.decision_matrix?.map((row,i)=><div key={i} className="mt-2 rounded border p-2 text-xs"><strong>{row.audience}</strong><p>{row.consideration}</p><p className="mt-1">{row.next_step}</p><p className="mt-1 text-amber-800">{row.status}</p><p className="mt-1 text-slate-500">Sumber: {row.evidence_id}</p></div>)}</details>}
        <details className="mt-2 text-xs text-slate-500"><summary className="cursor-pointer">Keterbatasan data</summary><ul>{Array.from(new Set([...(turn.reply.display.details?.dataset_limitations || []),...(turn.reply.display.details?.model_limitations || [])])).map(n=><li key={n} className="mt-1">{n}</li>)}</ul></details>
      </article>)}
    </div>
    {target&&<div className="mt-2 shrink-0 rounded-lg bg-emerald-50 p-2 text-xs">Konteks: {target.title}<button type="button" disabled={busy} onClick={onClearTarget} className="ml-2 underline">Lepas pilihan</button></div>}
    <form onSubmit={submit} className="mt-4 shrink-0 space-y-2 border-t pt-3">
      <label htmlFor="ai-question" className="text-sm font-medium">Pertanyaan</label>
      {target&&!question&&<button type="button" disabled={busy} onClick={()=>setQuestion('Apa temuan, implikasi, dan tindak lanjut yang perlu dipertimbangkan dari laporan ini?')} className="block text-left text-xs text-emerald-700 underline">Gunakan pertanyaan panduan</button>}
      <textarea id="ai-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={2000} rows={3} disabled={busy} placeholder="Apa laporan tentang trotoar?" className="w-full rounded-lg border border-slate-300 p-2 text-sm" />
      <button disabled={busy || !question.trim()} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Menunggu jawaban…' : 'Kirim'}</button>
      {busy && <p role="status" className="text-xs text-slate-500">Layanan dapat menunggu kuota. Jangan kirim ulang selama proses berlangsung.</p>}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  </section>;
}
