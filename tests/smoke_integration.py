import subprocess,time,urllib.request,json,os,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
procs=[]
try:
 procs.append(subprocess.Popen([sys.executable,'server.py'],cwd=root/'ai-service',env={**os.environ,'HOST':'127.0.0.1','PORT':'18080','GEMINI_API_KEY':''},stdout=None,stderr=None))
 procs.append(subprocess.Popen(['node','node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3100'],cwd=root/'frontend',env={**os.environ,'AI_BACKEND_URL':'http://127.0.0.1:18080'},stdout=None,stderr=None))
 for _ in range(15):
  try:
   r=opener.open('http://127.0.0.1:3100/api/ai/health',timeout=2)
   if r.status==200:break
  except Exception:time.sleep(.3)
 else:raise RuntimeError('Server tidak siap')
 for path in ['health','summary','layers/study_boundary','layers/survey_unverified']:
  data=json.load(opener.open('http://127.0.0.1:3100/api/ai/'+path,timeout=20));assert isinstance(data,dict);print('PASS GET',path)
 def post(body):
  req=urllib.request.Request('http://127.0.0.1:3100/api/ai/chat',data=json.dumps(body).encode(),headers={'Content-Type':'application/json'})
  return json.load(opener.open(req,timeout=20))
 r=post({'question':'Berapa rata-rata harga menu di kawasan ini?','mode':'live'})
 assert r['mode']=='dataset_answer_not_llm' and r['display']['sources'][0]['evidence_id']=='summary';print('PASS chat dataset tanpa Gemini')
 r=post({'question':'trotoar','mode':'preview'});assert r['mode']=='preview_not_llm';print('PASS chat retrieval')
 r=post({'question':'jelaskan laporan ini','mode':'preview','evidence_ids':['activity:page:7']});assert [e['evidence_id'] for e in r['context']['evidence']]==['activity:page:7'];print('PASS object isolation via Next.js and Python')
 try:post({'question':'uji','mode':'preview','evidence_ids':['fake']})
 except urllib.error.HTTPError as e:assert e.code==400;print('PASS unknown object rejected')
 else:raise AssertionError('Unknown object accepted')
 try:post({'question':''})
 except urllib.error.HTTPError as e:assert e.code==400;print('PASS invalid request')
 else:raise AssertionError('invalid diterima')
 html=opener.open('http://127.0.0.1:3100',timeout=20).read().decode();assert 'AI Copilot' in html;print('PASS page render')
finally:
 for p in procs:p.terminate()
 for p in procs:p.wait(timeout=10)
